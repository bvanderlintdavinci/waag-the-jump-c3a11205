import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Flag, ShieldBan } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-auth";
import { BLOCK_REASONS, REPORT_REASONS } from "@/lib/pinguingo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

export function BlockDialog({ userId, userName }: { userId: string; userName: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(BLOCK_REASONS[0]);
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useSession();
  const qc = useQueryClient();

  async function submit() {
    if (!user) return;
    setSaving(true);
    const fullReason = details.trim() ? `${reason} — ${details.trim()}` : reason;
    const { error } = await supabase
      .from("blocks")
      .insert({ blocker_id: user.id, blocked_id: userId, reason: fullReason });
    setSaving(false);
    if (error) {
      toast.error("Blokkeren mislukt", { description: error.message });
      return;
    }
    toast.success(`${userName} is geblokkeerd`, {
      description: "De reden is doorgestuurd naar de beheerder.",
    });
    setOpen(false);
    void qc.invalidateQueries();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ShieldBan /> Blokkeren
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{userName} blokkeren</DialogTitle>
          <DialogDescription>
            Geef een reden op. Deze wordt doorgestuurd naar de beheerder. Jullie verdwijnen wederzijds uit
            zoekresultaten, chats en de feed.
          </DialogDescription>
        </DialogHeader>
        <RadioGroup value={reason} onValueChange={setReason} className="gap-2">
          {BLOCK_REASONS.map((r) => (
            <div key={r} className="flex items-center gap-2">
              <RadioGroupItem value={r} id={`block-${r}`} />
              <Label htmlFor={`block-${r}`} className="font-normal">
                {r}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <Textarea
          placeholder="Toelichting (optioneel)"
          maxLength={500}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
        <DialogFooter>
          <Button variant="destructive" onClick={submit} disabled={saving}>
            Blokkeer definitief
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ReportDialog({
  userId,
  context = "profile",
  label = "Melden",
}: {
  userId: string;
  context?: string | undefined;
  label?: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const { user } = useSession();

  async function submit() {
    if (!user) return;
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_user_id: userId,
      context,
      reason,
      details: details.trim() || null,
    });
    if (error) {
      toast.error("Melden mislukt", { description: error.message });
      return;
    }
    toast.success("Bedankt voor je melding", { description: "Een moderator kijkt ernaar." });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Melden">
          <Flag /> {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Melding maken</DialogTitle>
          <DialogDescription>
            Bij 2 of meer meldingen wordt het account automatisch tijdelijk stilgezet voor herziening.
          </DialogDescription>
        </DialogHeader>
        <RadioGroup value={reason} onValueChange={setReason} className="gap-2">
          {REPORT_REASONS.map((r) => (
            <div key={r} className="flex items-center gap-2">
              <RadioGroupItem value={r} id={`report-${r}`} />
              <Label htmlFor={`report-${r}`} className="font-normal">
                {r}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <Textarea
          placeholder="Toelichting (optioneel)"
          maxLength={500}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
        <DialogFooter>
          <Button onClick={submit}>Melding versturen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

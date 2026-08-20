import { useState } from "react";
import { Lightbulb, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Kind = "idea" | "abuse";

const COPY: Record<Kind, { title: string; description: string; placeholder: string }> = {
  idea: {
    title: "Idee of advies voor de website",
    description: "Vertel wat er beter kan. Je bericht komt rechtstreeks bij de beheerder terecht.",
    placeholder: "Ik zou het fijn vinden als...",
  },
  abuse: {
    title: "Meld ongewenst gedrag",
    description:
      "Beschrijf wat er is gebeurd en om wie het gaat. De beheerder bekijkt elke melding persoonlijk.",
    placeholder: "Ik kreeg een vervelend bericht van...",
  },
};

export function FeedbackButtons({ floating = true }: { floating?: boolean }) {
  const [kind, setKind] = useState<Kind | null>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const { user } = useSession();

  async function submit() {
    if (!kind) return;
    const text = message.trim();
    if (text.length < 3) {
      toast.error("Schrijf eerst even je bericht.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("feedback_messages").insert({
      kind,
      message: text.slice(0, 2000),
      email: email.trim() || null,
      user_id: user?.id ?? null,
    });
    setBusy(false);
    if (error) {
      toast.error("Versturen mislukt", { description: error.message });
      return;
    }
    toast.success("Bedankt! Je bericht staat bij de beheerder.");
    setMessage("");
    setEmail("");
    setKind(null);
  }

  const wrapper = floating
    ? "fixed bottom-20 right-3 z-40 flex flex-col gap-2 sm:bottom-5"
    : "flex flex-wrap gap-2";

  return (
    <>
      <div className={wrapper}>
        <Button size="sm" variant="secondary" className="shadow-[var(--shadow-lift)]" onClick={() => setKind("idea")}>
          <Lightbulb /> Idee of advies
        </Button>
        <Button size="sm" variant="outline" className="bg-card shadow-[var(--shadow-lift)]" onClick={() => setKind("abuse")}>
          <ShieldAlert /> Meld ongewenst gedrag
        </Button>
      </div>

      <Dialog open={kind !== null} onOpenChange={(open) => !open && setKind(null)}>
        <DialogContent>
          {kind ? (
            <>
              <DialogHeader>
                <DialogTitle>{COPY[kind].title}</DialogTitle>
                <DialogDescription>{COPY[kind].description}</DialogDescription>
              </DialogHeader>
              <Textarea
                rows={5}
                maxLength={2000}
                placeholder={COPY[kind].placeholder}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="grid gap-1.5">
                <Label htmlFor="fb-email">E-mail voor terugkoppeling (optioneel)</Label>
                <Input
                  id="fb-email"
                  type="email"
                  maxLength={255}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button onClick={submit} disabled={busy}>
                  Versturen
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

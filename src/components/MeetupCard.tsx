import { useState } from "react";
import { CalendarClock, MapPin } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { MeetupPayload } from "@/lib/chat-extras";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const STATUS_LABEL: Record<MeetupPayload["status"], string> = {
  pending: "Wacht op antwoord",
  accepted: "Geaccepteerd",
  declined: "Vriendelijk bedankt",
  rescheduled: "Nieuwe datum voorgesteld",
};

function fmt(iso: string | null) {
  if (!iso) return "Datum in overleg";
  return new Date(iso).toLocaleString("nl-NL", {
    timeZone: "Europe/Amsterdam",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MeetupCard({ messageId, meetup, myId }: { messageId: string; meetup: MeetupPayload; myId?: string | undefined }) {
  const [newDate, setNewDate] = useState("");
  const [busy, setBusy] = useState(false);
  const open = meetup.status === "pending" || meetup.status === "rescheduled";
  const canRespond = open && !!myId && meetup.proposed_by !== myId;

  async function respond(status: "accepted" | "declined" | "rescheduled") {
    setBusy(true);
    const { error } = await supabase.rpc("respond_meetup", {
      _message_id: messageId,
      _status: status,
      ...(status === "rescheduled" && newDate ? { _proposed_at: new Date(newDate).toISOString() } : {}),
    });
    setBusy(false);
    if (error) toast.error("Bijwerken mislukt", { description: error.message });
  }

  return (
    <div className="w-72 max-w-full rounded-xl border border-border bg-card p-4 text-card-foreground">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-extrabold">{meetup.type}</p>
        <Badge variant={meetup.status === "accepted" ? "default" : "outline"}>{STATUS_LABEL[meetup.status]}</Badge>
      </div>
      <p className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <CalendarClock className="size-4" /> {fmt(meetup.proposed_at)}
      </p>
      <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <MapPin className="size-4" /> {meetup.location || "Openbare plek in overleg"}
      </p>
      {canRespond ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" disabled={busy} onClick={() => void respond("accepted")}>Accepteren</Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" disabled={busy}>Datum aanpassen</Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-2">
              <Input type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
              <Button size="sm" className="w-full" disabled={!newDate || busy} onClick={() => void respond("rescheduled")}>
                Nieuwe datum voorstellen
              </Button>
            </PopoverContent>
          </Popover>
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => void respond("declined")}>
            Vriendelijk bedanken
          </Button>
        </div>
      ) : open ? (
        <p className="mt-3 text-xs text-muted-foreground">Wacht op reactie van de ander.</p>
      ) : null}
    </div>
  );
}

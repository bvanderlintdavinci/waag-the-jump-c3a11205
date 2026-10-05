import { useState } from "react";
import { CalendarHeart } from "lucide-react";

import { MEETUP_TYPES } from "@/lib/chat-extras";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export interface MeetupDraft {
  type: string;
  proposed_at: string | null;
  location: string;
}

export function MeetupDialog({ onSend }: { onSend: (d: MeetupDraft) => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(MEETUP_TYPES[0]);
  const [when, setWhen] = useState("");
  const [location, setLocation] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await onSend({
      type,
      proposed_at: when ? new Date(when).toISOString() : null,
      location: location.trim(),
    });
    if (ok) {
      setOpen(false);
      setWhen("");
      setLocation("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <CalendarHeart /> Stel een ontmoeting voor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stel een ontmoeting voor</DialogTitle>
          <DialogDescription>Spreek de eerste keer altijd af op een openbare plek.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {MEETUP_TYPES.map((t) => (
              <Button key={t} type="button" size="sm" variant={t === type ? "default" : "outline"} onClick={() => setType(t)}>
                {t}
              </Button>
            ))}
          </div>
          <div className="space-y-1">
            <Label htmlFor="mu-when">Datum en tijd (optioneel)</Label>
            <Input id="mu-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="mu-loc">Openbare locatie</Label>
            <Input id="mu-loc" maxLength={120} placeholder="Bijv. café De Waag, Markt" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <Button type="submit" className="w-full">Verstuur uitnodiging</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

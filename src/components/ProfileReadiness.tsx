import { Link } from "@tanstack/react-router";
import { CheckCircle2, Circle } from "lucide-react";

import { useMyProfile, useSession } from "@/hooks/use-auth";
import { computeReadiness } from "@/lib/profile-readiness";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function useProfileReadiness() {
  const { user } = useSession();
  const { data: profile } = useMyProfile();
  return computeReadiness(profile, user);
}

function ReadinessBody() {
  const r = useProfileReadiness();
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Progress value={r.percent} className="h-2 flex-1" />
        <span className="text-sm font-semibold text-foreground">{r.percent}%</span>
      </div>
      <ul className="space-y-1 text-sm">
        {r.checks.map((c) => (
          <li key={c.key} className="flex items-center gap-2 text-foreground">
            {c.done ? <CheckCircle2 className="size-4 text-primary" /> : <Circle className="size-4 text-muted-foreground" />}
            {c.label}
          </li>
        ))}
      </ul>
      <Button asChild>
        <Link to="/instellingen">Profiel bewerken</Link>
      </Button>
    </div>
  );
}

export function ProfileReadinessBanner() {
  const r = useProfileReadiness();
  if (r.ready) return null;
  return (
    <div className="surface mb-4 p-4">
      <p className="mb-2 text-sm font-semibold text-foreground">
        Maak je profiel af om nieuwe gesprekken te starten
      </p>
      <ReadinessBody />
    </div>
  );
}

export function ProfileReadinessDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bijna klaar om te chatten</DialogTitle>
          <DialogDescription>
            Eerlijk voor iedereen: je start nieuwe gesprekken zodra je profiel minstens 80% compleet is.
          </DialogDescription>
        </DialogHeader>
        <ReadinessBody />
      </DialogContent>
    </Dialog>
  );
}

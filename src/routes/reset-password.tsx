import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Dare2MeetLogo } from "@/components/Dare2MeetLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nieuw wachtwoord | Dare2Meet" },
      { name: "description", content: "Kies een nieuw wachtwoord voor je Dare2Meet-account." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Nieuw wachtwoord | Dare2Meet" },
      { property: "og:description", content: "Herstel veilig de toegang tot je Dare2Meet-account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const isRecovery = hash.get("type") === "recovery" || new URLSearchParams(window.location.search).get("type") === "recovery";

    void supabase.auth.getSession().then(({ data }) => setReady(isRecovery || !!data.session));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Kies een wachtwoord van minimaal 8 tekens.");
      return;
    }
    if (password !== confirm) {
      toast.error("De wachtwoorden zijn niet gelijk.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error("Wachtwoord wijzigen mislukt", { description: error.message });
      return;
    }
    toast.success("Je wachtwoord is gewijzigd. Je kunt nu verder.");
    navigate({ to: "/feed", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="surface w-full max-w-md p-6">
        <div className="mb-5 flex items-center gap-3">
          <Dare2MeetLogo className="size-10" />
          <h1 className="font-display text-xl font-bold text-foreground">Nieuw wachtwoord kiezen</h1>
        </div>
        {!ready ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Deze herstel-link is verlopen of ongeldig.</p>
            <Link to="/auth"><Button variant="outline">Terug naar inloggen</Button></Link>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="new-password">Nieuw wachtwoord</Label>
              <Input id="new-password" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="confirm-password">Herhaal wachtwoord</Label>
              <Input id="confirm-password" type="password" minLength={8} required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <Button type="submit" disabled={busy}>{busy ? "Opslaan..." : "Wachtwoord opslaan"}</Button>
          </form>
        )}
      </div>
    </div>
  );
}
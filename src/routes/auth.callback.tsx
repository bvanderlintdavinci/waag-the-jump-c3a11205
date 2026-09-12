import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { Dare2MeetLogo } from "@/components/Dare2MeetLogo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Even inloggen | Dare2Meet" },
      { name: "description", content: "Je aanmelding wordt afgerond, een moment geduld." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const params = new URLSearchParams(window.location.search);
      const providerError = params.get("error_description") ?? params.get("error");
      if (providerError) {
        if (!cancelled) setError(providerError);
        return;
      }

      const code = params.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (!cancelled) setError(exchangeError.message);
          return;
        }
      }

      for (let attempt = 0; attempt < 20; attempt += 1) {
        const { data, error: userError } = await supabase.auth.getUser();
        if (data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("onboarded")
            .eq("id", data.user.id)
            .maybeSingle();
          if (!cancelled) navigate({ to: profile?.onboarded ? "/feed" : "/onboarding", replace: true });
          return;
        }
        if (userError && attempt === 19) {
          if (!cancelled) setError("De aanmelding kon niet worden afgerond. Probeer opnieuw in te loggen.");
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      }

      if (!cancelled) setError("De aanmelding duurde te lang. Probeer opnieuw in te loggen.");
    }

    void finish();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <Dare2MeetLogo className={`size-12 ${error ? "" : "animate-pulse"}`} />
      {error ? (
        <div className="max-w-md space-y-4 px-4 text-center">
          <h1 className="font-display text-xl font-bold text-foreground">Aanmelden niet afgerond</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Link to="/auth"><Button>Terug naar inloggen</Button></Link>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Bezig met inloggen...</p>
      )}
    </div>
  );
}

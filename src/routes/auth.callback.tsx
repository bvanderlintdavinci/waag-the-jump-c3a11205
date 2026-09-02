import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { Dare2MeetLogo } from "@/components/Dare2MeetLogo";

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

  useEffect(() => {
    let done = false;

    async function go() {
      const { data } = await supabase.auth.getSession();
      if (done) return;
      done = true;
      navigate({ to: data.session ? "/feed" : "/auth", replace: true });
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session && !done) {
        done = true;
        navigate({ to: "/feed", replace: true });
      }
    });

    const timer = setTimeout(go, 600);
    return () => {
      clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <Dare2MeetLogo className="size-12 animate-pulse" />
      <p className="text-sm text-muted-foreground">Bezig met inloggen...</p>
    </div>
  );
}

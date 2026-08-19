import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarHeart, LogOut, Mail, MessageCircle, Settings, ShieldCheck, Users } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin, useMyProfile } from "@/hooks/use-auth";
import { PinguinGoLogo } from "@/components/PinguinGoLogo";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/feed", label: "Waagjes", icon: CalendarHeart },
  { to: "/leden", label: "Leden", icon: Users },
  { to: "/berichten", label: "Berichten", icon: Mail },
  { to: "/chats", label: "Chats", icon: MessageCircle },
  { to: "/instellingen", label: "Account", icon: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: profile } = useMyProfile();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/feed" className="flex items-center gap-2">
            <img src={waag} alt="Waag de pinguïn" width={1024} height={1024} className="size-8 object-contain" />
            <span className="text-lg font-extrabold tracking-tight text-primary">PinguinGo</span>
          </Link>
          <nav className="ml-auto hidden items-center gap-1 sm:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-mint hover:text-mint-foreground"
                activeProps={{ className: "bg-mint text-mint-foreground" }}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin ? (
              <Link
                to="/admin"
                className="rounded-lg px-3 py-2 text-sm font-medium text-warning"
                activeProps={{ className: "bg-mint" }}
              >
                <ShieldCheck className="inline size-4" /> Admin
              </Link>
            ) : null}
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:ml-2">
            <Link to="/profiel/$id" params={{ id: profile?.id ?? "" }}>
              <UserAvatar path={profile?.avatar_url} name={profile?.first_name} className="size-9" />
            </Link>
            <Button variant="ghost" size="icon" aria-label="Uitloggen" onClick={signOut}>
              <LogOut />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:pb-12">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card px-2 py-1 sm:hidden">
        <div className="flex items-stretch justify-around">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-[11px] font-medium text-muted-foreground"
              activeProps={{ className: "text-primary" }}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

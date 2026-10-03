import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function NotificationBell() {
  const { user } = useSession();
  const qc = useQueryClient();
  const key = ["notifications", user?.id];

  const { data: items = [] } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, body, activity_id, read_at, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notif-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new as { title: string; body: string };
          toast(n.title, { description: n.body });
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification(n.title, { body: n.body, icon: "/favicon.png" });
          }
          void qc.invalidateQueries({ queryKey: ["notifications", user.id] });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, qc]);

  const unread = items.filter((n) => !n.read_at).length;

  async function onOpen(open: boolean) {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      void Notification.requestPermission();
    }
    if (open && unread && user) {
      await supabase.from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null);
      void qc.invalidateQueries({ queryKey: key });
    }
  }

  if (!user) return null;
  return (
    <Popover onOpenChange={(o) => void onOpen(o)}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Meldingen" className="relative">
          <Bell />
          {unread ? (
            <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-2">
        {items.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">Nog geen meldingen.</p>
        ) : (
          <ul className="grid gap-1">
            {items.map((n) => (
              <li key={n.id} className="rounded-lg p-2 text-sm hover:bg-muted">
                {n.activity_id ? (
                  <Link to="/waagje/$id" params={{ id: n.activity_id }} className="block">
                    <p className="font-semibold text-foreground">{n.title}</p>
                    <p className="text-muted-foreground">{n.body}</p>
                  </Link>
                ) : (
                  <>
                    <p className="font-semibold text-foreground">{n.title}</p>
                    <p className="text-muted-foreground">{n.body}</p>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

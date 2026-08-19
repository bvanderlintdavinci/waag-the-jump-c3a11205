import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useBlockedIds, useSession } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { UserAvatar } from "@/components/UserAvatar";

export const Route = createFileRoute("/_authenticated/berichten")({
  head: () => ({
    meta: [
      { title: "Berichten | Dare2Meet" },
      { name: "description", content: "Je persoonlijke 1-op-1 gesprekken met andere leden." },
      { property: "og:title", content: "Berichten | Dare2Meet" },
      { property: "og:description", content: "Stuur een persoonlijk bericht naar je waaggenoten." },
    ],
  }),
  component: DirectMessages,
});

function DirectMessages() {
  const { user } = useSession();
  const { data: blocked } = useBlockedIds();

  const { data: threads, isLoading } = useQuery({
    queryKey: ["direct-messages", user?.id, blocked],
    enabled: !!user,
    queryFn: async () => {
      const { data: mine } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user!.id);
      const ids = (mine ?? []).map((m) => m.conversation_id);
      if (!ids.length) return [];
      const { data: convs } = await supabase
        .from("conversations")
        .select("*")
        .in("id", ids)
        .eq("is_group", false);
      const convIds = (convs ?? []).map((c) => c.id);
      if (!convIds.length) return [];
      const { data: parts } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .in("conversation_id", convIds);
      const otherIds = [...new Set((parts ?? []).map((p) => p.user_id).filter((uid) => uid !== user!.id))];
      const { data: profiles } = otherIds.length
        ? await supabase.from("profiles").select("id, first_name, avatar_url, city").in("id", otherIds)
        : { data: [] };
      const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

      const { data: msgs } = await supabase
        .from("messages")
        .select("conversation_id, body, created_at")
        .in("conversation_id", convIds)
        .order("created_at", { ascending: false });

      return (convs ?? [])
        .map((c) => {
          const otherId = (parts ?? []).find((p) => p.conversation_id === c.id && p.user_id !== user!.id)?.user_id;
          const last = (msgs ?? []).find((m) => m.conversation_id === c.id);
          return { id: c.id, other: otherId ? byId.get(otherId) : undefined, otherId, last };
        })
        .filter((t) => !!t.other && !(blocked ?? []).includes(t.otherId!))
        .sort((a, b) => (b.last?.created_at ?? "").localeCompare(a.last?.created_at ?? ""));
    },
  });

  return (
    <AppShell>
      <h1 className="mb-5 text-2xl font-extrabold text-foreground">Berichten</h1>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Laden...</p>
      ) : !threads?.length ? (
        <EmptyState description="Nog geen persoonlijke gesprekken. Stuur een deelnemer van een event een bericht om te beginnen." />
      ) : (
        <div className="grid gap-2">
          {threads.map((t) => (
            <Link key={t.id} to="/chats/$id" params={{ id: t.id }} className="surface flex items-center gap-3 p-4">
              <UserAvatar path={t.other?.avatar_url} name={t.other?.first_name} className="size-10" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-foreground">{t.other?.first_name}</span>
                <span className="block truncate text-sm text-muted-foreground">
                  {t.last?.body ?? "Nog geen berichten"}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}

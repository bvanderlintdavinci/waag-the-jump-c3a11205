import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useBlockedIds, useSession } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/chats/")({
  head: () => ({
    meta: [
      { title: "Chats | Dare2Meet" },
      { name: "description", content: "Je 1-op-1 gesprekken en groepschats van waagjes." },
      { property: "og:title", content: "Chats | Dare2Meet" },
      { property: "og:description", content: "Praat verder met je waaggenoten." },
    ],
  }),
  component: ChatList,
});

function ChatList() {
  const { user } = useSession();
  const { data: blocked } = useBlockedIds();

  const { data: chats, isLoading } = useQuery({
    queryKey: ["chats", user?.id, blocked],
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
        .eq("is_group", true);
      const { data: allParts } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .in("conversation_id", ids);
      const otherIds = [
        ...new Set((allParts ?? []).map((p) => p.user_id).filter((uid) => uid !== user!.id)),
      ];
      const { data: profiles } = otherIds.length
        ? await supabase.from("profiles").select("id, first_name").in("id", otherIds)
        : { data: [] };
      const nameOf = new Map((profiles ?? []).map((p) => [p.id, p.first_name]));

      return (convs ?? [])
        .map((c) => {
          const others = (allParts ?? [])
            .filter((p) => p.conversation_id === c.id && p.user_id !== user!.id)
            .map((p) => p.user_id);
          return { ...c, others };
        })
        .filter((c) => c.is_group || !c.others.some((o) => (blocked ?? []).includes(o)))
        .map((c) => ({
          ...c,
          label: c.is_group
            ? (c.title ?? "Groepschat")
            : (nameOf.get(c.others[0] ?? "") ?? "Onbekend lid"),
        }));
    },
  });

  return (
    <AppShell>
      <h1 className="mb-5 text-2xl font-extrabold text-foreground">Groepschats</h1>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Laden...</p>
      ) : !chats?.length ? (
        <EmptyState description="Meld je aan voor een waagje of stuur iemand een chatverzoek om te beginnen." />
      ) : (
        <div className="grid gap-2">
          {chats.map((c) => (
            <Link key={c.id} to="/chats/$id" params={{ id: c.id }} className="surface flex items-center gap-3 p-4">
              <span className="font-semibold text-foreground">{c.label}</span>
              {c.is_group ? (
                <Badge variant="secondary" className="ml-auto">
                  <Users className="size-3.5" /> Groep
                </Badge>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}

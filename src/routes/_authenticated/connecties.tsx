import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, UserCheck, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-auth";
import { openDirectChat } from "@/lib/direct-chat";
import { removeConnection, respondConnection } from "@/lib/connections";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/connecties")({
  head: () => ({
    meta: [
      { title: "Connecties en favorieten | Dare2Meet" },
      { name: "description", content: "Beheer je connecties, openstaande verzoeken en je favorietenlijst." },
      { property: "og:title", content: "Connecties en favorieten | Dare2Meet" },
      { property: "og:description", content: "Houd contact met leden waarmee je een connectie hebt." },
    ],
  }),
  component: ConnectionsPage,
});

type MiniProfile = { id: string; first_name: string; avatar_url: string | null; city: string };

async function loadProfiles(ids: string[]): Promise<Map<string, MiniProfile>> {
  if (!ids.length) return new Map();
  const { data } = await supabase.from("profiles").select("id, first_name, avatar_url, city").in("id", ids);
  return new Map((data ?? []).map((p) => [p.id, p as MiniProfile]));
}

function ConnectionsPage() {
  const { user } = useSession();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["connections", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("connections")
        .select("id, requester_id, addressee_id, status")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const { data: favs } = await supabase
        .from("favorites")
        .select("id, favorite_id")
        .eq("owner_id", user!.id);
      const ids = [
        ...new Set([
          ...(rows ?? []).flatMap((r) => [r.requester_id, r.addressee_id]),
          ...(favs ?? []).map((f) => f.favorite_id),
        ]),
      ].filter((id) => id !== user!.id);
      const profiles = await loadProfiles(ids);
      return { rows: rows ?? [], favs: favs ?? [], profiles };
    },
  });

  const rows = data?.rows ?? [];
  const profiles = data?.profiles ?? new Map<string, MiniProfile>();
  const accepted = rows.filter((r) => r.status === "accepted");
  const incoming = rows.filter((r) => r.status === "pending" && r.addressee_id === user?.id);
  const outgoing = rows.filter((r) => r.status === "pending" && r.requester_id === user?.id);

  const other = (row: { requester_id: string; addressee_id: string }) =>
    row.requester_id === user?.id ? row.addressee_id : row.requester_id;

  async function chat(otherId: string) {
    if (!user) return;
    const name = profiles.get(otherId)?.first_name ?? "Lid";
    try {
      const convId = await openDirectChat(user.id, otherId, name);
      navigate({ to: "/chats/$id", params: { id: convId } });
    } catch (e) {
      toast.error("Chat starten mislukt", { description: e instanceof Error ? e.message : undefined });
    }
  }

  async function respond(id: string, accept: boolean) {
    try {
      await respondConnection(id, accept);
      await qc.invalidateQueries({ queryKey: ["connections"] });
      toast.success(accept ? "Connectie geaccepteerd" : "Verzoek geweigerd");
    } catch (e) {
      toast.error("Bijwerken mislukt", { description: e instanceof Error ? e.message : undefined });
    }
  }

  async function drop(id: string) {
    try {
      await removeConnection(id);
      await qc.invalidateQueries({ queryKey: ["connections"] });
      toast.success("Connectie verwijderd");
    } catch (e) {
      toast.error("Verwijderen mislukt", { description: e instanceof Error ? e.message : undefined });
    }
  }

  async function unfavorite(favoriteId: string) {
    if (!user) return;
    await supabase.from("favorites").delete().eq("owner_id", user.id).eq("favorite_id", favoriteId);
    await qc.invalidateQueries({ queryKey: ["connections"] });
  }

  function Row({ id, actions }: { id: string; actions: React.ReactNode }) {
    const p = profiles.get(id);
    return (
      <div className="surface flex flex-wrap items-center gap-3 p-4">
        <Link to="/profiel/$id" params={{ id }} className="flex min-w-0 flex-1 items-center gap-3">
          <UserAvatar path={p?.avatar_url ?? null} name={p?.first_name ?? "Lid"} className="size-11" />
          <span className="min-w-0">
            <span className="block truncate font-semibold text-foreground">{p?.first_name ?? "Lid"}</span>
            <span className="block truncate text-xs text-muted-foreground">{p?.city}</span>
          </span>
        </Link>
        <div className="flex flex-wrap gap-2">{actions}</div>
      </div>
    );
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-extrabold text-foreground">Connecties</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        Word connectie met leden die je vaker wilt spreken en bewaar mensen op je favorietenlijst.
      </p>

      <Tabs defaultValue="accepted">
        <TabsList className="flex-wrap">
          <TabsTrigger value="accepted">Mijn connecties</TabsTrigger>
          <TabsTrigger value="incoming">Verzoeken</TabsTrigger>
          <TabsTrigger value="outgoing">Verstuurd</TabsTrigger>
          <TabsTrigger value="favorites">Favorieten</TabsTrigger>
        </TabsList>

        <TabsContent value="accepted" className="mt-5 grid gap-3">
          {accepted.length === 0 ? (
            <EmptyState description="Je hebt nog geen connecties. Bekijk leden en druk op 'Connectie maken'." />
          ) : (
            accepted.map((r) => (
              <Row
                key={r.id}
                id={other(r)}
                actions={
                  <>
                    <Button size="sm" onClick={() => void chat(other(r))}>
                      <MessageCircle /> Bericht
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void drop(r.id)}>
                      <X /> Verwijderen
                    </Button>
                  </>
                }
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="incoming" className="mt-5 grid gap-3">
          {incoming.length === 0 ? (
            <EmptyState description="Geen openstaande connectieverzoeken." />
          ) : (
            incoming.map((r) => (
              <Row
                key={r.id}
                id={other(r)}
                actions={
                  <>
                    <Button size="sm" onClick={() => void respond(r.id, true)}>
                      <UserCheck /> Accepteren
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void respond(r.id, false)}>
                      Weigeren
                    </Button>
                  </>
                }
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="outgoing" className="mt-5 grid gap-3">
          {outgoing.length === 0 ? (
            <EmptyState description="Je hebt geen openstaande verzoeken verstuurd." />
          ) : (
            outgoing.map((r) => (
              <Row
                key={r.id}
                id={other(r)}
                actions={
                  <Button size="sm" variant="outline" onClick={() => void drop(r.id)}>
                    <X /> Intrekken
                  </Button>
                }
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-5 grid gap-3">
          {(data?.favs ?? []).length === 0 ? (
            <EmptyState description="Nog geen favorieten. Bewaar leden die op je oproep reageerden." />
          ) : (
            (data?.favs ?? []).map((f) => (
              <Row
                key={f.id}
                id={f.favorite_id}
                actions={
                  <>
                    <Button size="sm" onClick={() => void chat(f.favorite_id)}>
                      <MessageCircle /> Bericht
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void unfavorite(f.favorite_id)}>
                      <Heart /> Uit favorieten
                    </Button>
                  </>
                }
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      <p className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground">
        <UserPlus className="size-4" /> Connecties zien elkaars profiel iets uitgebreider en kunnen altijd
        berichten sturen.
      </p>
    </AppShell>
  );
}

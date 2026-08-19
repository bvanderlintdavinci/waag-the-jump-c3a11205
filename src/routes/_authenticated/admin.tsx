import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — PinguinGo" },
      { name: "description", content: "Beheer meldingen, blokkeerredenen, moderatielogs en verwijderverzoeken." },
      { property: "og:title", content: "Admin dashboard — PinguinGo" },
      { property: "og:description", content: "Moderatie en beheer van PinguinGo." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { data: isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Laden...</p>
      </AppShell>
    );
  }
  if (!isAdmin) {
    return (
      <AppShell>
        <EmptyState title="Geen toegang" description="Deze pagina is alleen voor beheerders." />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="mb-5 text-2xl font-extrabold text-foreground">Admin dashboard</h1>
      <Tabs defaultValue="reports">
        <TabsList className="flex-wrap">
          <TabsTrigger value="reports">Meldingen</TabsTrigger>
          <TabsTrigger value="blocks">Blokkeerredenen</TabsTrigger>
          <TabsTrigger value="words">Woordfilter</TabsTrigger>
          <TabsTrigger value="users">Leden</TabsTrigger>
          <TabsTrigger value="deletions">Verwijderwachtrij</TabsTrigger>
        </TabsList>
        <TabsContent value="reports" className="mt-5">
          <Reports />
        </TabsContent>
        <TabsContent value="blocks" className="mt-5">
          <BlockLog />
        </TabsContent>
        <TabsContent value="words" className="mt-5">
          <WordLog />
        </TabsContent>
        <TabsContent value="users" className="mt-5">
          <UsersTab />
        </TabsContent>
        <TabsContent value="deletions" className="mt-5">
          <Deletions />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="surface flex flex-wrap items-center gap-3 p-4 text-sm">{children}</div>;
}

function Reports() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function resolve(id: string, userId: string) {
    await supabase.from("reports").update({ resolved: true }).eq("id", id);
    await supabase.from("profiles").update({ shadowbanned: false }).eq("id", userId);
    await qc.invalidateQueries();
    toast.success("Melding afgehandeld en account weer actief");
  }

  if (!data?.length) return <EmptyState title="Geen meldingen" />;
  return (
    <div className="grid gap-2">
      {data.map((r) => (
        <Row key={r.id}>
          <Badge variant={r.resolved ? "secondary" : "destructive"}>{r.resolved ? "Afgehandeld" : "Open"}</Badge>
          <span className="font-semibold">{r.reason}</span>
          <span className="text-muted-foreground">{r.context}</span>
          <span className="text-xs text-muted-foreground">{r.details}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {new Date(r.created_at).toLocaleString("nl-NL")}
          </span>
          {!r.resolved ? (
            <Button size="sm" variant="outline" onClick={() => resolve(r.id, r.reported_user_id)}>
              Afhandelen
            </Button>
          ) : null}
        </Row>
      ))}
    </div>
  );
}

function BlockLog() {
  const { data } = useQuery({
    queryKey: ["admin-blocks"],
    queryFn: async () => {
      const { data } = await supabase.from("blocks").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  if (!data?.length) return <EmptyState title="Nog geen blokkades" />;
  return (
    <div className="grid gap-2">
      {data.map((b) => (
        <Row key={b.id}>
          <span className="font-semibold">{b.reason}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {new Date(b.created_at).toLocaleString("nl-NL")}
          </span>
        </Row>
      ))}
    </div>
  );
}

function WordLog() {
  const { data } = useQuery({
    queryKey: ["admin-words"],
    queryFn: async () => {
      const { data } = await supabase
        .from("moderation_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      return data ?? [];
    },
  });
  if (!data?.length) return <EmptyState title="Geen geblokkeerde woorden-pogingen" />;
  return (
    <div className="grid gap-2">
      {data.map((l) => (
        <Row key={l.id}>
          <Badge variant="destructive">High risk</Badge>
          <span className="font-semibold">{l.field}</span>
          <span className="text-muted-foreground">{(l.matched_terms ?? []).join(", ")}</span>
          <span className="line-clamp-1 text-xs text-muted-foreground">{l.content}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {new Date(l.created_at).toLocaleString("nl-NL")}
          </span>
        </Row>
      ))}
    </div>
  );
}

function UsersTab() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, first_name, city, shadowbanned, deleted_at, created_at")
        .order("created_at", { ascending: false })
        .limit(300);
      return data ?? [];
    },
  });

  async function toggleBan(id: string, value: boolean) {
    await supabase.from("profiles").update({ shadowbanned: value }).eq("id", id);
    await qc.invalidateQueries();
    toast.success(value ? "Account stilgezet" : "Account weer actief");
  }

  if (!data?.length) return <EmptyState title="Nog geen leden" />;
  return (
    <div className="grid gap-2">
      {data.map((u) => (
        <Row key={u.id}>
          <span className="font-semibold">{u.first_name}</span>
          <span className="text-muted-foreground">{u.city}</span>
          {u.shadowbanned ? <Badge variant="destructive">Stilgezet</Badge> : null}
          {u.deleted_at ? <Badge variant="secondary">Verwijderwachtrij</Badge> : null}
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => toggleBan(u.id, !u.shadowbanned)}
          >
            {u.shadowbanned ? "Activeren" : "Stilzetten"}
          </Button>
        </Row>
      ))}
    </div>
  );
}

function Deletions() {
  const { data } = useQuery({
    queryKey: ["admin-deletions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("deletion_requests")
        .select("*")
        .order("requested_at", { ascending: false });
      return data ?? [];
    },
  });
  if (!data?.length) return <EmptyState title="Geen accounts in de verwijderwachtrij" />;
  return (
    <div className="grid gap-2">
      {data.map((d) => (
        <Row key={d.id}>
          <span className="font-semibold">Verzoek {new Date(d.requested_at).toLocaleDateString("nl-NL")}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            Definitief wissen na {new Date(d.purge_after).toLocaleDateString("nl-NL")}
          </span>
        </Row>
      ))}
    </div>
  );
}

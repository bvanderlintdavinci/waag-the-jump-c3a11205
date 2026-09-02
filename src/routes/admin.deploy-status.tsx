import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Activity, Database, GitCommitHorizontal, Lock, RefreshCw, Server } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { getBuildStatus } from "@/lib/build-status.functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STORAGE_KEY = "d2m-deploy-status-pin";
const PIN = "CsaDeploy2026!Bergschenhoek";

export const Route = createFileRoute("/admin/deploy-status")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Deploy status | Dare2Meet" },
      { name: "description", content: "Interne statuspagina van de Dare2Meet build en omgeving." },
      { name: "robots", content: "noindex, nofollow" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  }),
  component: DeployStatusPage,
});

function DeployStatusPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === PIN) setUnlocked(true);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pin.trim() === PIN) {
      localStorage.setItem(STORAGE_KEY, PIN);
      setUnlocked(true);
      setError(null);
      return;
    }
    setError("Onjuiste toegangscode.");
  }

  if (!unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <form onSubmit={submit} className="surface w-full max-w-sm space-y-4 p-6">
          <div className="flex items-center gap-2 text-foreground">
            <Lock className="size-5" />
            <h1 className="text-lg font-semibold">Afgeschermde pagina</h1>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pin">Toegangscode</Label>
            <Input id="pin" type="password" value={pin} onChange={(e) => setPin(e.target.value)} autoFocus />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full">
            Ontgrendelen
          </Button>
        </form>
      </div>
    );
  }

  return <StatusDashboard onLock={() => {
    localStorage.removeItem(STORAGE_KEY);
    setUnlocked(false);
    setPin("");
  }} />;
}

function StatusDashboard({ onLock }: { onLock: () => void }) {
  const fetchBuild = useServerFn(getBuildStatus);

  const build = useQuery({
    queryKey: ["build-status"],
    queryFn: () => fetchBuild(),
  });

  const health = useQuery({
    queryKey: ["db-health"],
    refetchInterval: 60000,
    queryFn: async () => {
      const started = performance.now();
      const { error } = await supabase.from("profiles").select("id", { count: "exact", head: true });
      return { ok: !error, ms: Math.round(performance.now() - started) };
    },
  });

  const b = build.data;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Deploy status</h1>
            <p className="text-sm text-muted-foreground">Interne statuspagina, niet zichtbaar in menu's.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void build.refetch();
                void health.refetch();
              }}
            >
              <RefreshCw className="mr-2 size-4" />
              Ververs
            </Button>
            <Button variant="ghost" size="sm" onClick={onLock}>
              Vergrendel
            </Button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <Card icon={GitCommitHorizontal} title="Actieve build">
            {build.isLoading ? (
              <p className="text-sm text-muted-foreground">Laden...</p>
            ) : (
              <dl className="space-y-1 text-sm">
                <Row label="Versie" value={b?.version ?? "onbekend"} mono />
                <Row label="Commit" value={b?.commitShort ?? "onbekend"} mono />
                <Row label="Branch" value={b?.branch ?? "-"} mono />
                <Row
                  label="Datum"
                  value={b?.deployedAt ? new Date(b.deployedAt).toLocaleString("nl-NL") : "onbekend"}
                />
              </dl>
            )}
          </Card>

          <Card icon={Server} title="Omgeving">
            <Badge variant={b?.environment === "production" ? "default" : "secondary"}>
              {b?.environment === "production"
                ? "Production"
                : b?.environment === "preview"
                  ? "Preview"
                  : "Development"}
            </Badge>
            <p className="mt-3 text-xs text-muted-foreground">{b?.repo ?? "Geen repository gekoppeld"}</p>
          </Card>

          <Card icon={Activity} title="Versiecontrole">
            {b?.upToDate === null ? (
              <>
                <Badge variant="secondary">Onbekend</Badge>
                <p className="mt-2 text-xs text-muted-foreground">{b?.note ?? "Geen vergelijking mogelijk."}</p>
              </>
            ) : b?.upToDate ? (
              <Badge>Up-to-date</Badge>
            ) : (
              <>
                <Badge variant="destructive">Nieuwe update beschikbaar</Badge>
                <p className="mt-2 text-xs text-muted-foreground">
                  Laatste commit: <span className="font-mono">{b?.latestCommitShort}</span>
                </p>
              </>
            )}
          </Card>

          <Card icon={Database} title="Database en API">
            {health.isLoading ? (
              <p className="text-sm text-muted-foreground">Meten...</p>
            ) : (
              <>
                <Badge variant={health.data?.ok ? "default" : "destructive"}>
                  {health.data?.ok ? "Verbonden" : "Geen verbinding"}
                </Badge>
                <p className="mt-2 text-xs text-muted-foreground">Responstijd: {health.data?.ms ?? "-"} ms</p>
              </>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="surface p-5">
      <div className="mb-3 flex items-center gap-2 text-foreground">
        <Icon className="size-4" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono text-xs text-foreground" : "text-foreground"}>{value}</dd>
    </div>
  );
}

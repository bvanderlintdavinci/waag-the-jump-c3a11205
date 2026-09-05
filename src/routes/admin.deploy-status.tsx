import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Activity, ArrowUpCircle, Database, GitBranch, Lock, LogOut, Mail, RefreshCw, Server } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { getBuildOverview, getEmailOverview } from "@/lib/deploy-status.functions";
import { applyLatestVersion, checkVersion } from "@/lib/version-check";
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
  const [pinValue, setPinValue] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === PIN) setPinValue(stored);
    else if (stored) localStorage.removeItem(STORAGE_KEY);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pin.trim() === PIN) {
      localStorage.setItem(STORAGE_KEY, PIN);
      setPinValue(PIN);
      setError(null);
      return;
    }
    setError("Onjuiste toegangscode.");
  }

  if (!pinValue) {
    return (
      <div className="penguin-texture flex min-h-screen items-center justify-center bg-background px-4">
        <form onSubmit={submit} className="surface relative z-10 w-full max-w-sm space-y-4 p-6">
          <div className="flex items-center gap-2 text-ink">
            <Lock className="size-5" />
            <h1 className="font-display text-lg font-semibold">Afgeschermde pagina</h1>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pin">Toegangscode</Label>
            <Input id="pin" type="password" value={pin} onChange={(e) => setPin(e.target.value)} autoFocus />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="cta-glow w-full">
            Ontgrendelen
          </Button>
        </form>
      </div>
    );
  }

  return (
    <StatusDashboard
      pin={pinValue}
      onLock={() => {
        localStorage.removeItem(STORAGE_KEY);
        setPinValue(null);
        setPin("");
      }}
    />
  );
}

function StatusDashboard({ pin, onLock }: { pin: string; onLock: () => void }) {
  const fetchBuild = useServerFn(getBuildOverview);
  const fetchEmail = useServerFn(getEmailOverview);

  const build = useQuery({
    queryKey: ["deploy-build"],
    queryFn: () => fetchBuild({ data: { pin } }),
  });

  const email = useQuery({
    queryKey: ["deploy-email"],
    queryFn: () => fetchEmail({ data: { pin } }),
  });

  const version = useQuery({
    queryKey: ["version-check"],
    queryFn: checkVersion,
    refetchInterval: 120000,
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
  const e = email.data;
  const v = version.data;


  return (
    <div className="penguin-texture min-h-screen bg-background px-4 py-10">
      <div className="relative z-10 mx-auto max-w-3xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Deploy status</h1>
            <p className="text-xs text-muted-foreground">Interne pagina · niet zichtbaar in menu's</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void build.refetch();
                void email.refetch();
                void health.refetch();
                void version.refetch();
              }}
            >
              <RefreshCw className="mr-2 size-4" />
              Vernieuwen
            </Button>
            <Button variant="ghost" size="sm" onClick={onLock}>
              <LogOut className="mr-2 size-4" />
              Uitloggen
            </Button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <Card icon={Activity} title="Live versie en status">
            {build.isLoading ? (
              <p className="text-sm text-muted-foreground">Laden...</p>
            ) : (
              <>
                <Badge variant={b?.environment === "production" ? "default" : "secondary"}>
                  {b?.environment === "production"
                    ? "Production · Live"
                    : b?.environment === "preview"
                      ? "Preview"
                      : "Development"}
                </Badge>
                <p className="mt-3 font-mono text-sm text-ink">{b?.commitShort ?? b?.version ?? "live"}</p>
                <p className="mt-1 text-xs text-muted-foreground">Branch: {b?.branch ?? "-"}</p>
                <p className="text-xs text-muted-foreground">
                  Live gezet: {b?.deployedAt ? new Date(b.deployedAt).toLocaleString("nl-NL") : "onbekend"}
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
                <p className="mt-3 text-2xl font-semibold text-ink">{health.data?.ms ?? "-"} ms</p>
                <p className="text-xs text-muted-foreground">Responstijd van de laatste controle</p>
              </>
            )}
          </Card>

          <Card icon={GitBranch} title="Versiecontrole">
            {version.isLoading ? (
              <p className="text-sm text-muted-foreground">Controleren...</p>
            ) : (
              <>
                <Badge variant={v?.updateAvailable ? "destructive" : "default"}>
                  {v?.latest === null
                    ? "Niet te bepalen"
                    : v?.updateAvailable
                      ? "Nieuwe versie beschikbaar"
                      : "Up-to-date"}
                </Badge>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <p>
                    Nu geladen: <span className="font-mono text-ink">{v?.running ?? "-"}</span>
                  </p>
                  <p>
                    Live beschikbaar: <span className="font-mono text-ink">{v?.latest ?? "onbekend"}</span>
                  </p>
                  {v?.note ? <p className="text-copper">{v.note}</p> : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void version.refetch()}
                    disabled={version.isFetching}
                  >
                    <RefreshCw className="mr-2 size-4" />
                    {version.isFetching ? "Bezig..." : "Opnieuw controleren"}
                  </Button>
                  <Button
                    size="sm"
                    className="cta-glow"
                    onClick={() => void applyLatestVersion()}
                    disabled={!v?.updateAvailable}
                  >
                    <ArrowUpCircle className="mr-2 size-4" />
                    Bijwerken naar nieuwste versie
                  </Button>
                </div>
              </>
            )}
          </Card>

        </section>

        <div className="surface p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-ink">
              <Mail className="size-4" />
              <h2 className="font-display text-sm font-bold uppercase tracking-wide">
                E-mailoverzicht en wachtrij
              </h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => void email.refetch()} disabled={email.isFetching}>
              <RefreshCw className="mr-2 size-4" />
              {email.isFetching ? "Bezig..." : "Vernieuw e-mailstatus"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Verzending loopt automatisch via {e?.domain ?? "het mail-domein"}.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Stat
              label="Mislukt"
              value={e?.failed ?? 0}
              tone={(e?.failed ?? 0) > 0 ? "danger" : "ok"}
            />
            <Stat
              label="In wachtrij"
              value={e?.pending ?? 0}
              tone={(e?.pending ?? 0) > 0 ? "warn" : "ok"}
            />
            <Stat label="Verzonden (24 uur)" value={e?.sent24h ?? 0} tone="ok" />
          </div>

          {e?.error ? <p className="mt-3 text-xs text-destructive">{e.error}</p> : null}

          {e?.recent.length ? (
            <ul className="mt-4 space-y-2">
              {e.recent.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-ink">
                    {item.template}
                    {item.error ? (
                      <span className="block text-xs text-destructive">{item.error}</span>
                    ) : null}
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString("nl-NL")}
                    <StatusBadge status={item.status} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Geen e-mails in het logboek.</p>
          )}
        </div>

        <div className="surface flex items-center gap-2 p-4 text-xs text-muted-foreground">
          <Server className="size-4" />
          Deze pagina is afgeschermd met een toegangscode en wordt niet geïndexeerd door zoekmachines.
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "failed") return <Badge variant="destructive">Mislukt</Badge>;
  if (status === "queued") return <Badge variant="secondary">In wachtrij</Badge>;
  if (status === "suppressed") return <Badge variant="outline">Geblokkeerd</Badge>;
  return <Badge>Verzonden</Badge>;
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "ok" | "warn" | "danger" }) {
  const toneClass =
    tone === "danger" ? "text-destructive" : tone === "warn" ? "text-copper" : "text-ink";
  return (
    <div className="rounded-xl border border-border bg-card/70 p-4">
      <p className={`font-display text-2xl font-bold ${toneClass}`}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
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
      <div className="mb-3 flex items-center gap-2 text-ink">
        <Icon className="size-4" />
        <h2 className="font-display text-sm font-bold uppercase tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  );
}

import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Activity,
  Database,
  GitCommitHorizontal,
  Lock,
  LogOut,
  Mail,
  RefreshCw,
  Rocket,
  Server,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { getDeployOverview, getEmailOverview, startDeploy } from "@/lib/deploy-status.functions";
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
  const fetchOverview = useServerFn(getDeployOverview);
  const fetchEmail = useServerFn(getEmailOverview);
  const deployFn = useServerFn(startDeploy);

  const overview = useQuery({
    queryKey: ["deploy-overview"],
    queryFn: () => fetchOverview({ data: { pin } }),
  });

  const email = useQuery({
    queryKey: ["deploy-email"],
    queryFn: () => fetchEmail({ data: { pin } }),
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

  const deploy = useMutation({
    mutationFn: () => deployFn({ data: { pin } }),
    onSuccess: (res) => {
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
      void overview.refetch();
    },
    onError: () => toast.error("Deploy starten mislukt."),
  });

  const d = overview.data;
  const updateAvailable = d?.upToDate === false;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold uppercase tracking-tight text-foreground">Deployment</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void overview.refetch();
                void email.refetch();
                void health.refetch();
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

        <div className="surface p-5">
          {overview.isLoading ? (
            <p className="text-sm text-muted-foreground">Status laden...</p>
          ) : (
            <>
              <p className="text-sm font-bold uppercase tracking-wide text-foreground">
                {d?.upToDate == null
                  ? "Status onbekend"
                  : d.upToDate
                    ? "De laatste versie staat live!"
                    : "Nieuwe update beschikbaar"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {d?.repo ?? "geen repository"} · {d?.workflow} · branch {d?.branch}
              </p>
              {d?.note ? <p className="mt-2 text-xs text-destructive">{d.note}</p> : null}
            </>
          )}
        </div>

        <section className="grid gap-4 sm:grid-cols-2">
          <Card icon={GitCommitHorizontal} title="Live versie">
            <p className="font-mono text-sm text-foreground">{d?.liveShaShort ?? "onbekend"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Live gezet:{" "}
              {d?.liveDeployedAt ? new Date(d.liveDeployedAt).toLocaleString("nl-NL") : "onbekend"}
            </p>
            {d?.runs[0] ? (
              <p className="text-xs text-muted-foreground">
                Run #{d.runs[0].number} · {d.runs[0].conclusion ?? d.runs[0].status}
              </p>
            ) : null}
          </Card>

          <Card icon={Activity} title="Laatste versie in GitHub">
            <p className="font-mono text-sm text-foreground">{d?.latestShaShort ?? "onbekend"}</p>
            <p className="mt-1 text-sm text-foreground">{d?.latestMessage ?? "-"}</p>
            <p className="text-xs text-muted-foreground">Auteur: {d?.latestAuthor ?? "-"}</p>
            <p className="text-xs text-muted-foreground">
              Commit: {d?.latestDate ? new Date(d.latestDate).toLocaleString("nl-NL") : "-"}
            </p>
          </Card>

          <Card icon={Server} title="Omgeving">
            <Badge variant={d?.environment === "production" ? "default" : "secondary"}>
              {d?.environment === "production"
                ? "Production"
                : d?.environment === "preview"
                  ? "Preview"
                  : "Development"}
            </Badge>
            <p className="mt-3 text-xs text-muted-foreground">{d?.repo ?? "Geen repository gekoppeld"}</p>
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

        <div className="surface space-y-3 p-5">
          <Button
            className="w-full"
            disabled={!d?.configured || deploy.isPending}
            onClick={() => deploy.mutate()}
            variant={updateAvailable ? "default" : "secondary"}
          >
            <Rocket className="mr-2 size-4" />
            {deploy.isPending
              ? "Deploy starten..."
              : updateAvailable
                ? "Deploy nieuwste versie"
                : "Opnieuw deployen"}
          </Button>
          {d?.runs.length ? (
            <p className="text-xs text-muted-foreground">
              Laatste run #{d.runs[0]!.number}: {d.runs[0]!.conclusion ?? d.runs[0]!.status} op{" "}
              {new Date(d.runs[0]!.createdAt).toLocaleString("nl-NL")}.{" "}
              <a
                className="underline underline-offset-2"
                href={d.runs[0]!.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Bekijk in GitHub Actions
              </a>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Nog geen deploys gevonden. Stel GITHUB_REPO en GITHUB_DEPLOY_TOKEN in om te koppelen.
            </p>
          )}
        </div>

        <div className="surface p-5">
          <div className="mb-3 flex items-center gap-2 text-foreground">
            <Mail className="size-4" />
            <h2 className="text-sm font-bold uppercase tracking-wide">E-mailoverzicht</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Alleen ter informatie. Verzending gaat automatisch via {email.data?.domain ?? "het mail-domein"}.
          </p>
          {email.isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">Laden...</p>
          ) : email.data?.issues.length ? (
            <ul className="mt-3 space-y-2">
              {email.data.issues.map((i) => (
                <li key={i.id} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-foreground">{i.subject}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(i.createdAt).toLocaleDateString("nl-NL")} · {i.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Geen berichten in de wachtrij.</p>
          )}
        </div>
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
        <h2 className="text-sm font-bold uppercase tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  );
}

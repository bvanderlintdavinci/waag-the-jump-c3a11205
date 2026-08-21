import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink, RefreshCw, Rocket } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsAdmin } from "@/hooks/use-auth";
import { getDeployStatus, triggerDeploy } from "@/lib/deploy.functions";

export const Route = createFileRoute("/_authenticated/deploy")({
  head: () => ({
    meta: [
      { title: "Deploy | Dare2Meet" },
      { name: "description", content: "Start een nieuwe publicatie van de statische Dare2Meet build." },
      { property: "og:title", content: "Deploy | Dare2Meet" },
      { property: "og:description", content: "Beheerderspagina om de site opnieuw te publiceren." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DeployPage,
});

function statusLabel(status: string, conclusion: string | null) {
  if (status !== "completed") return { label: "Bezig", variant: "secondary" as const };
  if (conclusion === "success") return { label: "Gelukt", variant: "default" as const };
  return { label: conclusion ?? "Mislukt", variant: "destructive" as const };
}

function DeployPage() {
  const { data: isAdmin, isLoading } = useIsAdmin();
  const queryClient = useQueryClient();
  const fetchStatus = useServerFn(getDeployStatus);
  const startDeploy = useServerFn(triggerDeploy);
  const [busy, setBusy] = useState(false);

  const status = useQuery({
    queryKey: ["deploy-status"],
    enabled: !!isAdmin,
    refetchInterval: 15000,
    queryFn: () => fetchStatus(),
  });

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

  const config = status.data?.config;
  const runs = status.data?.runs ?? [];

  async function onDeploy() {
    setBusy(true);
    try {
      const result = await startDeploy({});
      if (result.ok) {
        toast.success(result.message);
        setTimeout(() => queryClient.invalidateQueries({ queryKey: ["deploy-status"] }), 3000);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Deploy starten mislukt.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Deploy</h1>
          <p className="text-sm text-muted-foreground">
            Publiceer de statische build van Dare2Meet naar het live domein.
          </p>
        </header>

        {status.isLoading ? (
          <p className="text-sm text-muted-foreground">Status ophalen...</p>
        ) : config && !config.configured ? (
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">Nog niet ingesteld</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Voeg deze waarden toe als secrets voordat je vanaf hier kunt deployen:
            </p>
            <ul className="mt-3 space-y-1 text-sm text-foreground">
              {config.missing.map((m) => (
                <li key={m} className="font-mono text-xs">
                  {m}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              GITHUB_REPO is bijvoorbeeld gebruiker/dare2meet. GITHUB_DEPLOY_TOKEN is een token met rechten
              op Actions. Optioneel: GITHUB_DEPLOY_BRANCH en GITHUB_DEPLOY_WORKFLOW.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{config?.repo}</p>
                <p className="text-xs text-muted-foreground">
                  Branch {config?.branch} · workflow {config?.workflow}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => status.refetch()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Ververs
                </Button>
                <Button size="sm" onClick={onDeploy} disabled={busy}>
                  <Rocket className="mr-2 h-4 w-4" />
                  {busy ? "Bezig..." : "Nu deployen"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Laatste deploys</h2>
          {runs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nog geen deploys gevonden.</p>
          ) : (
            <ul className="space-y-2">
              {runs.map((run) => {
                const s = statusLabel(run.status, run.conclusion);
                return (
                  <li
                    key={run.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
                  >
                    <div>
                      <p className="text-sm text-foreground">
                        {new Date(run.createdAt).toLocaleString("nl-NL")}
                      </p>
                      <p className="text-xs text-muted-foreground">Run {run.id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={s.variant}>{s.label}</Badge>
                      <a
                        href={run.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Bekijk deploy log"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

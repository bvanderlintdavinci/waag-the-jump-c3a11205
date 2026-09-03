import { createServerFn } from "@tanstack/react-start";

/** Toegangscode voor de interne deploy-statuspagina. */
const FALLBACK_PIN = "CsaDeploy2026!Bergschenhoek";

function expectedPin(): string {
  return process.env["DEPLOY_STATUS_PIN"] ?? FALLBACK_PIN;
}

function assertPin(pin: string) {
  if (pin !== expectedPin()) throw new Error("Onjuiste toegangscode.");
}

function config() {
  const repo = process.env["GITHUB_REPO"] ?? null;
  const token = process.env["GITHUB_DEPLOY_TOKEN"] ?? null;
  const branch = process.env["GITHUB_DEPLOY_BRANCH"] ?? "main";
  const workflow = process.env["GITHUB_DEPLOY_WORKFLOW"] ?? "deploy.yml";
  return { repo, token, branch, workflow };
}

function headers(token: string | null) {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "dare2meet-deploy",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type DeployRun = {
  id: number;
  number: number;
  status: string;
  conclusion: string | null;
  createdAt: string;
  url: string;
  sha: string;
};

export type DeployOverview = {
  configured: boolean;
  missing: string[];
  repo: string | null;
  branch: string;
  workflow: string;
  environment: "production" | "preview" | "development";
  liveSha: string | null;
  liveShaShort: string | null;
  liveDeployedAt: string | null;
  latestSha: string | null;
  latestShaShort: string | null;
  latestMessage: string | null;
  latestAuthor: string | null;
  latestDate: string | null;
  upToDate: boolean | null;
  runs: DeployRun[];
  note: string | null;
};

export const getDeployOverview = createServerFn({ method: "POST" })
  .inputValidator((data: { pin: string }) => data)
  .handler(async ({ data }): Promise<DeployOverview> => {
    assertPin(data.pin);
    const { repo, token, branch, workflow } = config();
    const missing = [...(repo ? [] : ["GITHUB_REPO"]), ...(token ? [] : ["GITHUB_DEPLOY_TOKEN"])];

    const envName = (process.env["VERCEL_ENV"] ?? process.env["NODE_ENV"] ?? "").toLowerCase();
    const environment: DeployOverview["environment"] =
      envName === "production" ? "production" : envName === "preview" ? "preview" : "development";

    const base: DeployOverview = {
      configured: missing.length === 0,
      missing,
      repo,
      branch,
      workflow,
      environment,
      liveSha: null,
      liveShaShort: null,
      liveDeployedAt: null,
      latestSha: null,
      latestShaShort: null,
      latestMessage: null,
      latestAuthor: null,
      latestDate: null,
      upToDate: null,
      runs: [],
      note: missing.length ? `Ontbrekende instellingen: ${missing.join(", ")}` : null,
    };

    if (!repo) return base;

    try {
      const [commitRes, runsRes] = await Promise.all([
        fetch(`https://api.github.com/repos/${repo}/commits/${branch}`, { headers: headers(token) }),
        fetch(
          `https://api.github.com/repos/${repo}/actions/workflows/${workflow}/runs?per_page=5&branch=${branch}`,
          { headers: headers(token) },
        ),
      ]);

      if (commitRes.ok) {
        const body = (await commitRes.json()) as {
          sha?: string;
          commit?: { message?: string; author?: { name?: string; date?: string } };
        };
        base.latestSha = body.sha ?? null;
        base.latestShaShort = body.sha ? body.sha.slice(0, 7) : null;
        base.latestMessage = body.commit?.message?.split("\n")[0] ?? null;
        base.latestAuthor = body.commit?.author?.name ?? null;
        base.latestDate = body.commit?.author?.date ?? null;
      } else {
        base.note = `GitHub gaf status ${commitRes.status} bij het ophalen van de laatste commit.`;
      }

      if (runsRes.ok) {
        const body = (await runsRes.json()) as {
          workflow_runs?: Array<{
            id: number;
            run_number: number;
            status: string;
            conclusion: string | null;
            created_at: string;
            html_url: string;
            head_sha: string;
          }>;
        };
        base.runs = (body.workflow_runs ?? []).map((r) => ({
          id: r.id,
          number: r.run_number,
          status: r.status,
          conclusion: r.conclusion,
          createdAt: r.created_at,
          url: r.html_url,
          sha: r.head_sha,
        }));
        const live = base.runs.find((r) => r.conclusion === "success");
        if (live) {
          base.liveSha = live.sha;
          base.liveShaShort = live.sha.slice(0, 7);
          base.liveDeployedAt = live.createdAt;
        }
      } else if (!base.note) {
        base.note = `GitHub gaf status ${runsRes.status} bij het ophalen van de deploys.`;
      }
    } catch {
      base.note = "GitHub is niet bereikbaar.";
    }

    if (base.liveSha && base.latestSha) base.upToDate = base.liveSha === base.latestSha;
    return base;
  });

export const startDeploy = createServerFn({ method: "POST" })
  .inputValidator((data: { pin: string }) => data)
  .handler(async ({ data }) => {
    assertPin(data.pin);
    const { repo, token, branch, workflow } = config();
    if (!repo || !token) {
      return { ok: false as const, message: "GITHUB_REPO en GITHUB_DEPLOY_TOKEN zijn nog niet ingesteld." };
    }
    const res = await fetch(
      `https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`,
      { method: "POST", headers: headers(token), body: JSON.stringify({ ref: branch }) },
    );
    if (res.status === 204) return { ok: true as const, message: "Deploy gestart. Ververs over een minuut." };
    const detail = await res.text();
    console.error("[deploy] dispatch mislukt", res.status, detail);
    return { ok: false as const, message: `Deploy starten mislukt (status ${res.status}).` };
  });

export type EmailIssue = {
  id: string;
  subject: string;
  createdAt: string;
  status: string;
};

export const getEmailOverview = createServerFn({ method: "POST" })
  .inputValidator((data: { pin: string }) => data)
  .handler(async ({ data }) => {
    assertPin(data.pin);
    const domain = process.env["EMAIL_SENDING_DOMAIN"] ?? "notify.csatuning.nl";
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("feedback_messages")
      .select("id, kind, message, created_at, status")
      .order("created_at", { ascending: false })
      .limit(10);

    const issues: EmailIssue[] = (rows ?? []).map((r) => ({
      id: r.id as string,
      subject: `${r.kind as string}: ${String(r.message ?? "").slice(0, 60)}`,
      createdAt: r.created_at as string,
      status: (r.status as string) ?? "open",
    }));

    return {
      domain,
      error: error ? error.message : null,
      issues,
    };
  });

import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type DeployConfig = {
  configured: boolean;
  repo: string | null;
  branch: string;
  workflow: string;
  missing: string[];
};

type DeployRun = {
  id: number;
  status: string;
  conclusion: string | null;
  createdAt: string;
  url: string;
};

async function assertAdmin(context: { supabase: unknown; userId: string }) {
  const supabase = context.supabase as {
    rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
  };
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || data !== true) throw new Error("Forbidden");
}

function readConfig(): DeployConfig {
  const repo = process.env["GITHUB_REPO"] ?? null;
  const token = process.env["GITHUB_DEPLOY_TOKEN"] ?? null;
  const branch = process.env["GITHUB_DEPLOY_BRANCH"] ?? "main";
  const workflow = process.env["GITHUB_DEPLOY_WORKFLOW"] ?? "deploy.yml";
  const missing = [
    ...(repo ? [] : ["GITHUB_REPO"]),
    ...(token ? [] : ["GITHUB_DEPLOY_TOKEN"]),
  ];
  return { configured: missing.length === 0, repo, branch, workflow, missing };
}

function githubHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "dare2meet-deploy",
    "Content-Type": "application/json",
  };
}

export const getDeployStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const config = readConfig();
    if (!config.configured) return { config, runs: [] as DeployRun[] };

    const token = process.env["GITHUB_DEPLOY_TOKEN"]!;
    const res = await fetch(
      `https://api.github.com/repos/${config.repo}/actions/workflows/${config.workflow}/runs?per_page=5`,
      { headers: githubHeaders(token) },
    );
    if (!res.ok) {
      return { config, runs: [] as DeployRun[], error: `GitHub gaf status ${res.status}` };
    }
    const body = (await res.json()) as {
      workflow_runs?: Array<{
        id: number;
        status: string;
        conclusion: string | null;
        created_at: string;
        html_url: string;
      }>;
    };
    const runs: DeployRun[] = (body.workflow_runs ?? []).map((r) => ({
      id: r.id,
      status: r.status,
      conclusion: r.conclusion,
      createdAt: r.created_at,
      url: r.html_url,
    }));
    return { config, runs };
  });

export const triggerDeploy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const config = readConfig();
    if (!config.configured) {
      return { ok: false as const, message: `Ontbrekende instellingen: ${config.missing.join(", ")}` };
    }

    const token = process.env["GITHUB_DEPLOY_TOKEN"]!;
    const res = await fetch(
      `https://api.github.com/repos/${config.repo}/actions/workflows/${config.workflow}/dispatches`,
      {
        method: "POST",
        headers: githubHeaders(token),
        body: JSON.stringify({ ref: config.branch }),
      },
    );

    if (res.status === 204) return { ok: true as const, message: "Deploy gestart." };
    const detail = await res.text();
    console.error("[deploy] GitHub dispatch mislukt", res.status, detail);
    return { ok: false as const, message: `Deploy starten mislukt (status ${res.status}).` };
  });

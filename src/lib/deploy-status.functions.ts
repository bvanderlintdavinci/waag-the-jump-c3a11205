import { createServerFn } from "@tanstack/react-start";

/** Toegangscode voor de interne deploy-statuspagina. */
const FALLBACK_PIN = "CsaDeploy2026!Bergschenhoek";

function expectedPin(): string {
  return process.env["DEPLOY_STATUS_PIN"] ?? FALLBACK_PIN;
}

function assertPin(pin: string) {
  if (pin !== expectedPin()) throw new Error("Onjuiste toegangscode.");
}

export type BuildOverview = {
  environment: "production" | "preview" | "development";
  commit: string | null;
  commitShort: string | null;
  branch: string | null;
  deployedAt: string | null;
  version: string;
};

function env(name: string): string | null {
  const v = process.env[name];
  return v && v.length > 0 ? v : null;
}

export const getBuildOverview = createServerFn({ method: "POST" })
  .inputValidator((data: { pin: string }) => data)
  .handler(async ({ data }): Promise<BuildOverview> => {
    assertPin(data.pin);

    const commit =
      env("VERCEL_GIT_COMMIT_SHA") ??
      env("VITE_VERCEL_GIT_COMMIT_SHA") ??
      env("CF_PAGES_COMMIT_SHA") ??
      env("GITHUB_SHA");
    const branch =
      env("VERCEL_GIT_COMMIT_REF") ?? env("CF_PAGES_BRANCH") ?? env("GITHUB_REF_NAME") ?? "main";
    const deployedAt = env("BUILD_TIME") ?? env("VERCEL_DEPLOYMENT_CREATED_AT");

    const envName = (env("VERCEL_ENV") ?? env("NODE_ENV") ?? "").toLowerCase();
    const environment: BuildOverview["environment"] =
      envName === "production" ? "production" : envName === "preview" ? "preview" : "development";

    return {
      environment,
      commit,
      commitShort: commit ? commit.slice(0, 7) : null,
      branch,
      deployedAt,
      version: env("APP_VERSION") ?? (commit ? commit.slice(0, 7) : "live"),
    };
  });

export type EmailEntry = {
  id: string;
  template: string;
  status: string;
  error: string | null;
  createdAt: string;
};

export type EmailOverview = {
  domain: string;
  failed: number;
  pending: number;
  sent24h: number;
  recent: EmailEntry[];
  error: string | null;
};

export const getEmailOverview = createServerFn({ method: "POST" })
  .inputValidator((data: { pin: string }) => data)
  .handler(async ({ data }): Promise<EmailOverview> => {
    assertPin(data.pin);
    const domain = process.env["EMAIL_SENDING_DOMAIN"] ?? "notify.csatuning.nl";
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [failedRes, pendingRes, sentRes, recentRes] = await Promise.all([
      supabaseAdmin.from("email_log").select("id", { count: "exact", head: true }).eq("status", "failed"),
      supabaseAdmin.from("email_log").select("id", { count: "exact", head: true }).eq("status", "queued"),
      supabaseAdmin
        .from("email_log")
        .select("id", { count: "exact", head: true })
        .eq("status", "sent")
        .gte("created_at", since),
      supabaseAdmin
        .from("email_log")
        .select("id, template, status, error, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    const firstError =
      failedRes.error?.message ??
      pendingRes.error?.message ??
      sentRes.error?.message ??
      recentRes.error?.message ??
      null;

    return {
      domain,
      failed: failedRes.count ?? 0,
      pending: pendingRes.count ?? 0,
      sent24h: sentRes.count ?? 0,
      recent: (recentRes.data ?? []).map((r) => ({
        id: r.id as string,
        template: (r.template as string) ?? "onbekend",
        status: (r.status as string) ?? "onbekend",
        error: (r.error as string | null) ?? null,
        createdAt: r.created_at as string,
      })),
      error: firstError,
    };
  });

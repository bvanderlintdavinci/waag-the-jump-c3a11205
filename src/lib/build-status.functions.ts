import { createServerFn } from "@tanstack/react-start";

export type BuildStatus = {
  commit: string;
  commitShort: string;
  branch: string;
  version: string;
  deployedAt: string | null;
  environment: "production" | "preview" | "development";
  repo: string | null;
  latestCommit: string | null;
  latestCommitShort: string | null;
  upToDate: boolean | null;
  note: string | null;
};

function env(name: string): string | null {
  return process.env[name] ?? null;
}

export const getBuildStatus = createServerFn({ method: "GET" }).handler(async (): Promise<BuildStatus> => {
  const commit =
    env("GITHUB_SHA") ?? env("CF_PAGES_COMMIT_SHA") ?? env("VERCEL_GIT_COMMIT_SHA") ?? "onbekend";
  const branch =
    env("GITHUB_REF_NAME") ?? env("CF_PAGES_BRANCH") ?? env("VERCEL_GIT_COMMIT_REF") ?? "main";
  const repo = env("GITHUB_REPO") ?? env("GITHUB_REPOSITORY");
  const deployedAt = env("BUILD_TIME") ?? env("VERCEL_DEPLOYMENT_CREATED_AT");

  const envName = (env("VERCEL_ENV") ?? env("NODE_ENV") ?? "").toLowerCase();
  const environment: BuildStatus["environment"] =
    envName === "production" ? "production" : envName === "preview" ? "preview" : "development";

  let latestCommit: string | null = null;
  let note: string | null = null;

  if (repo) {
    try {
      const token = env("GITHUB_DEPLOY_TOKEN");
      const res = await fetch(`https://api.github.com/repos/${repo}/commits/${branch}`, {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "dare2meet-status",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const body = (await res.json()) as { sha?: string };
        latestCommit = body.sha ?? null;
      } else {
        note = `GitHub gaf status ${res.status}`;
      }
    } catch {
      note = "GitHub is niet bereikbaar";
    }
  } else {
    note = "Geen repository ingesteld (GITHUB_REPO)";
  }

  const known = commit !== "onbekend" && latestCommit !== null;

  return {
    commit,
    commitShort: commit.slice(0, 7),
    branch,
    version: env("APP_VERSION") ?? commit.slice(0, 7),
    deployedAt,
    environment,
    repo,
    latestCommit,
    latestCommitShort: latestCommit ? latestCommit.slice(0, 7) : null,
    upToDate: known ? commit === latestCommit : null,
    note,
  };
});

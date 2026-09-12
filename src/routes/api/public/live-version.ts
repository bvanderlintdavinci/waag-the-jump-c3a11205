import { createFileRoute } from "@tanstack/react-router";

const LIVE_SITE_URL = "https://waag-the-jump.lovable.app";

function assetFingerprint(html: string): string | null {
  const matches = html.match(/(?:https?:\/\/[^"'\s]+)?\/(?:_build\/)?assets\/[A-Za-z0-9._/-]+\.js/g) ?? [];
  const assets = Array.from(new Set(matches.map((asset) => asset.replace(/^https?:\/\/[^/]+/, "")))).sort();
  if (assets.length === 0) return null;

  let hash = 0;
  const value = assets.join("|");
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash.toString(16).padStart(8, "0").slice(0, 7);
}

export const Route = createFileRoute("/api/public/live-version")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const response = await fetch(`${LIVE_SITE_URL}/?version=${Date.now()}`, {
            headers: { "Cache-Control": "no-cache" },
          });
          if (!response.ok) {
            return Response.json(
              { version: null, checkedAt: new Date().toISOString(), error: `Live website gaf status ${response.status}.` },
              { status: 502, headers: { "Cache-Control": "no-store" } },
            );
          }

          const version = assetFingerprint(await response.text());
          return Response.json(
            {
              version,
              checkedAt: new Date().toISOString(),
              error: version ? null : "De live build kon niet worden herkend.",
            },
            { headers: { "Cache-Control": "no-store" } },
          );
        } catch {
          return Response.json(
            { version: null, checkedAt: new Date().toISOString(), error: "De live website is niet bereikbaar." },
            { status: 502, headers: { "Cache-Control": "no-store" } },
          );
        }
      },
    },
  },
});
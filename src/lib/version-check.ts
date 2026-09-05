/**
 * Versiecontrole zonder GitHub-token.
 *
 * De draaiende pagina kent haar eigen script-bestanden (met build-hash).
 * We halen de live index-pagina opnieuw op (zonder cache) en vergelijken de
 * script-hashes. Verschillen ze, dan staat er een nieuwere versie klaar.
 */

export type VersionCheck = {
  running: string;
  latest: string | null;
  updateAvailable: boolean;
  checkedAt: string;
  note: string | null;
};

function scriptFingerprint(doc: Document | string): string {
  const html =
    typeof doc === "string"
      ? doc
      : Array.from(doc.querySelectorAll("script[src]"))
          .map((s) => (s as HTMLScriptElement).getAttribute("src") ?? "")
          .join(" ");

  const matches = html.match(/\/(?:_build\/)?assets\/[A-Za-z0-9._-]+\.js/g) ?? [];
  const unique = Array.from(new Set(matches)).sort();
  return unique.join("|");
}

function shortHash(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash.toString(16).padStart(8, "0").slice(0, 7);
}

export async function checkVersion(): Promise<VersionCheck> {
  const runningPrint = scriptFingerprint(document);
  const running = runningPrint ? shortHash(runningPrint) : "dev";

  try {
    const res = await fetch(`${window.location.origin}/?versiecheck=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) {
      return {
        running,
        latest: null,
        updateAvailable: false,
        checkedAt: new Date().toISOString(),
        note: `Server gaf status ${res.status}`,
      };
    }
    const html = await res.text();
    const livePrint = scriptFingerprint(html);
    if (!livePrint) {
      return {
        running,
        latest: null,
        updateAvailable: false,
        checkedAt: new Date().toISOString(),
        note: "Kon de live versie niet lezen (ontwikkelmodus).",
      };
    }
    const latest = shortHash(livePrint);
    return {
      running,
      latest,
      updateAvailable: latest !== running,
      checkedAt: new Date().toISOString(),
      note: null,
    };
  } catch {
    return {
      running,
      latest: null,
      updateAvailable: false,
      checkedAt: new Date().toISOString(),
      note: "Live versie is nu niet bereikbaar.",
    };
  }
}

/** Leegt caches en herlaadt de app zodat de nieuwste versie geladen wordt. */
export async function applyLatestVersion(): Promise<void> {
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.update().catch(() => undefined)));
    }
  } catch {
    /* cache legen is best effort */
  }
  window.location.replace(`${window.location.pathname}?v=${Date.now()}`);
}

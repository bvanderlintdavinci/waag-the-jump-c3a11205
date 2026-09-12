/**
 * Versiecontrole zonder GitHub-token.
 *
 * De draaiende pagina kent haar eigen script-bestanden (met build-hash).
 * Een serverroute haalt de live pagina buiten de browser op. Daardoor blokkeert
 * de browser de controle niet wanneer preview en live verschillende hosts zijn.
 *
 * Belangrijk: in de Lovable-voorbeeldomgeving (preview) draait de app zonder
 * build-hashes. Vergelijken heeft daar geen zin en levert anders altijd
 * "nieuwe versie beschikbaar" op. Daarom melden we daar simpelweg
 * "voorbeeldmodus".
 */

export const LIVE_SITE_URL = "https://waag-the-jump.lovable.app";

export type VersionCheck = {
  running: string;
  latest: string | null;
  updateAvailable: boolean;
  checkedAt: string;
  isLiveSite: boolean;
  note: string | null;
};

type LiveVersionResponse = {
  version: string | null;
  checkedAt: string;
  error: string | null;
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

function onLiveSite(): boolean {
  return window.location.origin === LIVE_SITE_URL;
}

export async function checkVersion(): Promise<VersionCheck> {
  const runningPrint = scriptFingerprint(document);
  const running = runningPrint ? shortHash(runningPrint) : "voorbeeld";
  const isLiveSite = onLiveSite();
  const checkedAt = new Date().toISOString();

  try {
    const res = await fetch(`/api/public/live-version?versiecheck=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    const payload = (await res.json()) as LiveVersionResponse;
    if (!res.ok || !payload.version) {
      return {
        running,
        latest: null,
        updateAvailable: false,
        checkedAt,
        isLiveSite,
        note: payload.error ?? `De live website gaf status ${res.status}.`,
      };
    }
    const latest = payload.version;

    if (!isLiveSite) {
      return {
        running,
        latest,
        updateAvailable: false,
        checkedAt,
        isLiveSite,
        note: "Je bekijkt nu de voorbeeldomgeving. Vergelijken kan alleen op de live website zelf.",
      };
    }

    return {
      running,
      latest,
      updateAvailable: latest !== running,
      checkedAt,
      isLiveSite,
      note: null,
    };
  } catch {
    return {
      running,
      latest: null,
      updateAvailable: false,
      checkedAt,
      isLiveSite,
      note: "De live website is nu niet bereikbaar.",
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
      await Promise.all(regs.map((r) => r.unregister().catch(() => undefined)));
    }
  } catch {
    /* cache legen is best effort */
  }

  if (onLiveSite()) {
    window.location.replace(`${window.location.pathname}?v=${Date.now()}`);
    return;
  }
  window.location.href = `${LIVE_SITE_URL}/admin/deploy-status?v=${Date.now()}`;
}

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  CONSENT_EVENT,
  NON_ESSENTIAL_TRACKERS,
  OPEN_CONSENT_EVENT,
  activeCategories,
  applyGoogleConsent,
  readConsent,
  saveConsent,
  trackersActive,
} from "@/lib/consent";

const NOTICE_KEY = "d2m-cookie-notice";

const LABELS = {
  advertising: {
    title: "Advertenties",
    text: "Cookies van advertentiepartners om advertenties te tonen en te meten. Hiermee houden we de site gratis.",
  },
  analytics: {
    title: "Statistieken",
    text: "Anonieme meting van hoe de site gebruikt wordt.",
  },
} as const;

export function CookieNotice() {
  const [mode, setMode] = useState<"hidden" | "notice" | "banner" | "prefs">("hidden");
  const [prefs, setPrefs] = useState({ advertising: false, analytics: false });

  useEffect(() => {
    if (trackersActive()) {
      const current = readConsent();
      applyGoogleConsent(current);
      if (current) setPrefs({ advertising: current.advertising, analytics: current.analytics });
      else setMode("banner");
    } else {
      try {
        if (!localStorage.getItem(NOTICE_KEY)) setMode("notice");
      } catch {
        /* opslag geblokkeerd */
      }
    }
    const open = () => {
      const c = readConsent();
      if (c) setPrefs({ advertising: c.advertising, analytics: c.analytics });
      setMode(trackersActive() ? "prefs" : "notice");
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === "d2m-consent") {
        applyGoogleConsent(readConsent());
        window.dispatchEvent(new Event(CONSENT_EVENT));
      }
    };
    window.addEventListener(OPEN_CONSENT_EVENT, open);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(OPEN_CONSENT_EVENT, open);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (mode === "hidden") return null;

  const wrap =
    "fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-lift)] sm:inset-x-auto sm:left-1/2 sm:w-full sm:-translate-x-1/2";

  if (mode === "notice") {
    return (
      <div data-google-query-build="false" className={wrap} role="dialog" aria-label="Cookiemelding">
        <p className="text-sm text-foreground">
          Dare2Meet gebruikt alleen functionele opslag om je ingelogd te houden. Geen trackers en geen
          advertentiecookies.{" "}
          <Link to="/cookies" className="font-semibold text-primary underline">
            Lees de cookieverklaring
          </Link>
          .
        </p>
        <div className="mt-3 flex justify-end">
          <Button
            size="sm"
            onClick={() => {
              try {
                localStorage.setItem(NOTICE_KEY, "1");
              } catch {
                /* niets */
              }
              setMode("hidden");
            }}
          >
            Begrepen
          </Button>
        </div>
      </div>
    );
  }

  const cats = activeCategories();
  const decide = (choice: { advertising: boolean; analytics: boolean }) => {
    saveConsent(choice);
    setPrefs(choice);
    setMode("hidden");
  };

  return (
    <div data-google-query-build="false" className={wrap} role="dialog" aria-label="Cookietoestemming">
      <h2 className="font-display text-base font-semibold text-foreground">Jouw cookiekeuze</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Naast noodzakelijke opslag willen we graag cookies gebruiken van{" "}
        {Array.from(new Set(NON_ESSENTIAL_TRACKERS.map((t) => t.provider))).join(", ")}. Je kiest zelf; weigeren
        heeft geen gevolgen voor je account. Je kunt je keuze altijd wijzigen via "Cookie-instellingen".{" "}
        <Link to="/cookies" className="font-semibold text-primary underline">
          Meer info
        </Link>
      </p>

      {mode === "prefs" && (
        <div className="mt-3 space-y-3">
          <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-semibold">Noodzakelijk</p>
              <p className="text-xs text-muted-foreground">Inloggen en je keuzes onthouden. Altijd aan.</p>
            </div>
            <Switch checked disabled aria-label="Noodzakelijk" />
          </div>
          {cats.map((c) => (
            <div key={c} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-semibold">{LABELS[c].title}</p>
                <p className="text-xs text-muted-foreground">{LABELS[c].text}</p>
              </div>
              <Switch
                checked={prefs[c]}
                onCheckedChange={(v) => setPrefs((p) => ({ ...p, [c]: v }))}
                aria-label={LABELS[c].title}
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap justify-end gap-2">
        {mode === "banner" ? (
          <Button size="sm" variant="ghost" onClick={() => setMode("prefs")}>
            Voorkeuren beheren
          </Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => decide(prefs)}>
            Keuze opslaan
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => decide({ advertising: false, analytics: false })}>
          Weigeren
        </Button>
        <Button size="sm" onClick={() => decide({ advertising: true, analytics: true })}>
          Accepteren
        </Button>
      </div>
    </div>
  );
}

export function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
    >
      Cookie-instellingen
    </button>
  );
}

import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

const STORAGE_KEY = "d2m-visit-session";
const HEARTBEAT_MS = 60_000;

function sessionKey(): string {
  let key = sessionStorage.getItem(STORAGE_KEY);
  if (!key) {
    key = crypto.randomUUID();
    sessionStorage.setItem(STORAGE_KEY, key);
  }
  return key;
}

function ping() {
  try {
    void fetch("/api/public/track-visit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionKey: sessionKey() }),
    }).catch(() => undefined);
  } catch {
    /* meten mag nooit de site breken */
  }
}

/** Meet anoniem hoeveel bezoekers er zijn en hoe lang ze blijven. */
export function VisitTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    ping();
  }, [pathname]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") ping();
    }, HEARTBEAT_MS);
    return () => window.clearInterval(timer);
  }, []);

  return null;
}

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

const KEY = "d2m-cookie-notice";

export function CookieNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* opslag geblokkeerd: melding overslaan */
    }
  }, []);

  if (!show) return null;

  function accept() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* niets te doen */
    }
    setShow(false);
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-lift)] sm:inset-x-auto sm:left-1/2 sm:w-full sm:-translate-x-1/2">
      <p className="text-sm text-foreground">
        Dare2Meet gebruikt alleen functionele opslag om je ingelogd te houden. Geen trackers en geen
        advertentiecookies.{" "}
        <Link to="/cookies" className="font-semibold text-primary underline">
          Lees de cookieverklaring
        </Link>
        .
      </p>
      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={accept}>
          Begrepen
        </Button>
      </div>
    </div>
  );
}

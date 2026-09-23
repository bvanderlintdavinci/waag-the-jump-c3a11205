import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Eye, Heart, Loader2 } from "lucide-react";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-auth";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { confirmVisitorCheckout, createVisitorCheckout, getVisitorPurchaseStatus } from "@/lib/payments.functions";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { UserAvatar } from "@/components/UserAvatar";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/bezoekers")({
  validateSearch: (s: Record<string, unknown>): { session_id?: string | undefined } => ({
    session_id: typeof s['session_id'] === "string" ? s['session_id'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Wie bekeek mijn profiel? | Dare2Meet" },
      { name: "description", content: "Bekijk eenmalig de laatste 5 bezoekers van je profiel, met kijktijd en relatiestatus." },
      { property: "og:title", content: "Wie bekeek mijn profiel? | Dare2Meet" },
      { property: "og:description", content: "Eenmalig € 2,99: je laatste 5 profielbezoekers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VisitorsPage,
});

type SnapshotVisitor = {
  visitor_id: string;
  first_name: string;
  avatar_url: string | null;
  city: string | null;
  relationship_status: string | null;
  duration_seconds: number;
  visited_at: string;
};

function formatDuration(s: number) {
  if (!s || s < 1) return "minder dan 1 seconde";
  if (s < 60) return `${s} sec`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m} min ${r} sec` : `${m} min`;
}

function VisitorsPage() {
  const { user } = useSession();
  const { session_id } = Route.useSearch();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [waiver, setWaiver] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const statusFn = useServerFn(getVisitorPurchaseStatus);
  const confirmFn = useServerFn(confirmVisitorCheckout);
  const env = (() => { try { return getStripeEnvironment(); } catch { return null; } })();

  const { data: status, refetch: refetchStatus } = useQuery({
    queryKey: ["visitor-status", user?.id, env],
    enabled: !!user && !!env,
    queryFn: () => statusFn({ data: { environment: env! } }),
  });

  useEffect(() => {
    if (!session_id || !env) return;
    let tries = 0;
    let stop = false;
    const run = async () => {
      const r = await confirmFn({ data: { sessionId: session_id, environment: env } }).catch((e: Error) => ({ error: e.message }));
      if (stop) return;
      if ("error" in r) setConfirmError(r.error);
      else if (r.status === "pending" && ++tries < 20) setTimeout(run, 3000);
      else void refetchStatus();
    };
    void run();
    return () => { stop = true; };
  }, [session_id, env]);

  const { data: snapshots, isLoading } = useQuery({
    queryKey: ["visitor-snapshots", user?.id, env],
    enabled: !!user && !!env,
    refetchInterval: (q) => {
      const rows = q.state.data as { created_at: string }[] | undefined;
      if (!session_id) return false;
      const fresh = rows?.[0] && Date.now() - new Date(rows[0].created_at).getTime() < 10 * 60 * 1000;
      return fresh ? false : 3000;
    },
    queryFn: async () => {
      const { data } = await supabase
        .from("visitor_snapshots")
        .select("id, visitors, created_at")
        .eq("user_id", user!.id)
        .eq("environment", env!)
        .is("revoked_at", null)
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []).map((r) => ({ ...r, visitors: (r.visitors as unknown as SnapshotVisitor[]) ?? [] }));
    },
  });

  const waiting =
    !!session_id &&
    !(snapshots?.[0] && Date.now() - new Date(snapshots[0].created_at).getTime() < 10 * 60 * 1000);

  const fetchClientSecret = async () => {
    const result = await createVisitorCheckout({
      data: {
        environment: getStripeEnvironment(),
        waiveWithdrawal: waiver,
        returnUrl: `${window.location.origin}/bezoekers?session_id={CHECKOUT_SESSION_ID}`,
      },
    });
    if ("error" in result) throw new Error(result.error);
    return result.clientSecret;
  };

  return (
    <AppShell>
      <div className="mx-auto grid max-w-2xl gap-5 px-4 py-6">
        <PaymentTestModeBanner />
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Wie bekeek mijn profiel?</h1>
          <p className="mt-1 text-muted-foreground">
            Eenmalig € 2,99: zie de laatste 5 bezoekers van je profiel op dit moment, hoe lang ze keken en hun
            relatiestatus. Geen abonnement — je momentopname blijft bewaard.
          </p>
        </div>

        {confirmError && <p className="surface p-4 text-sm text-destructive">{confirmError}</p>}
        {waiting && !confirmError && (
          <div className="surface flex items-center gap-3 p-4 text-sm">
            <Loader2 className="size-4 animate-spin text-primary" /> Betaling ontvangen, je bezoekers worden opgehaald…
          </div>
        )}

        {!checkoutOpen ? (
          <div className="surface grid gap-3 p-5">
            <div className="flex flex-wrap items-center gap-4">
              <Eye className="size-6 text-primary" />
              <div className="min-w-52 flex-1">
                <p className="font-bold text-foreground">Nieuwe momentopname</p>
                <p className="text-sm text-muted-foreground">
                  {status?.canBuy
                    ? `${status.newVisitors >= 5 ? "5 of meer" : status.newVisitors} nieuwe bezoeker(s) sinds je vorige momentopname.`
                    : "Nog geen nieuwe bezoekers sinds je vorige momentopname. Kom later terug."}
                </p>
              </div>
              <Button disabled={!status?.canBuy || !waiver} onClick={() => setCheckoutOpen(true)}>
                Bekijk voor € 2,99
              </Button>
            </div>
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input type="checkbox" className="mt-0.5" checked={waiver} onChange={(e) => setWaiver(e.target.checked)} />
              <span>
                Ik wil direct toegang tot deze digitale inhoud en zie daarmee af van mijn wettelijke bedenktijd van 14 dagen.
                Zie de <Link to="/voorwaarden" className="underline">voorwaarden</Link>.
              </span>
            </label>
          </div>
        ) : (
          <div className="surface overflow-hidden p-2">
            <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
            <Button variant="ghost" className="mt-2 w-full" onClick={() => setCheckoutOpen(false)}>
              Annuleren
            </Button>
          </div>
        )}

        {isLoading ? null : !snapshots?.length ? (
          <EmptyState description="Je hebt nog geen momentopname gekocht." />
        ) : (
          snapshots.map((s) => (
            <section key={s.id} className="grid gap-2">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Momentopname van {new Date(s.created_at).toLocaleString("nl-NL", { dateStyle: "long", timeStyle: "short" })}
              </h2>
              {!s.visitors.length ? (
                <p className="surface p-4 text-sm text-muted-foreground">Er waren toen nog geen bezoekers.</p>
              ) : (
                s.visitors.map((v) => (
                  <Link
                    key={v.visitor_id}
                    to="/profiel/$id"
                    params={{ id: v.visitor_id }}
                    className="surface flex items-center gap-3 p-4 transition hover:border-primary"
                  >
                    <UserAvatar path={v.avatar_url} name={v.first_name} className="size-11" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">
                        {v.first_name}
                        {v.city && <span className="ml-2 text-xs font-normal text-muted-foreground">{v.city}</span>}
                      </p>
                      <p className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" /> {formatDuration(v.duration_seconds)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Heart className="size-3" /> {v.relationship_status || "Niet ingevuld"}
                        </span>
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </section>
          ))
        )}
      </div>
    </AppShell>
  );
}

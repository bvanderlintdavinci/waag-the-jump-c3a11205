import type { StripeEnv } from "@/lib/stripe.server";

export type SnapshotVisitor = {
  visitor_id: string;
  first_name: string;
  avatar_url: string | null;
  city: string | null;
  relationship_status: string | null;
  duration_seconds: number;
  visited_at: string;
};

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Most recent visitors (max 5, unique), excluding anonymous, blocked, shadowbanned and deleted members. */
export async function collectVisitors(userId: string, sinceIso?: string | null): Promise<SnapshotVisitor[]> {
  const db = await admin();
  let q = db
    .from("profile_visits")
    .select("visitor_id, created_at, duration_seconds")
    .eq("profile_id", userId)
    .neq("visitor_id", userId)
    .order("created_at", { ascending: false })
    .limit(300);
  if (sinceIso) q = q.gt("created_at", sinceIso);
  const { data: visits } = await q;

  const latest = new Map<string, { created_at: string; duration_seconds: number }>();
  for (const v of visits ?? []) {
    if (!latest.has(v.visitor_id)) latest.set(v.visitor_id, { created_at: v.created_at, duration_seconds: v.duration_seconds ?? 0 });
  }
  const ids = [...latest.keys()];
  if (!ids.length) return [];

  const [{ data: profiles }, { data: blocks }] = await Promise.all([
    db
      .from("profiles")
      .select("id, first_name, avatar_url, city, relationship_status, shadowbanned, deleted_at, anonymous_visits")
      .in("id", ids),
    db
      .from("blocks")
      .select("blocker_id, blocked_id")
      .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`),
  ]);
  const blocked = new Set<string>();
  for (const b of blocks ?? []) blocked.add(b.blocker_id === userId ? b.blocked_id : b.blocker_id);
  const pmap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const out: SnapshotVisitor[] = [];
  for (const id of ids) {
    const p = pmap.get(id);
    if (!p || p.shadowbanned || p.deleted_at || p.anonymous_visits || blocked.has(id)) continue;
    const v = latest.get(id)!;
    out.push({
      visitor_id: id,
      first_name: p.first_name,
      avatar_url: p.avatar_url,
      city: p.city || null,
      relationship_status: p.relationship_status,
      duration_seconds: v.duration_seconds,
      visited_at: v.created_at,
    });
    if (out.length === 5) break;
  }
  return out;
}

/** Timestamp of the last active (not revoked) snapshot in this environment. */
export async function lastSnapshotAt(userId: string, env: StripeEnv): Promise<string | null> {
  const db = await admin();
  const { data } = await db
    .from("visitor_snapshots")
    .select("created_at")
    .eq("user_id", userId)
    .eq("environment", env)
    .is("revoked_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.created_at ?? null;
}

/** Idempotent fulfilment for a paid checkout session. */
export async function fulfillVisitorSnapshot(session: any, env: StripeEnv): Promise<boolean> {
  const userId = session?.metadata?.userId as string | undefined;
  if (!userId || session?.metadata?.purpose !== "visitor_snapshot") return false;
  if (session.payment_status === "unpaid") return false;

  const db = await admin();
  const { data: existing } = await db
    .from("visitor_snapshots")
    .select("id")
    .eq("checkout_session_id", session.id)
    .maybeSingle();
  if (existing) return true;

  const visitors = await collectVisitors(userId);
  const pi = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
  const waiver = session.metadata?.withdrawal_waiver_at as string | undefined;

  const { error } = await db.from("visitor_snapshots").upsert(
    {
      user_id: userId,
      checkout_session_id: session.id,
      environment: env,
      visitors,
      payment_intent_id: pi,
      withdrawal_waiver_at: waiver || null,
    },
    { onConflict: "checkout_session_id", ignoreDuplicates: true },
  );
  if (error) throw error;
  return true;
}

export async function revokeByPaymentIntent(paymentIntentId: string | null | undefined, env: StripeEnv) {
  if (!paymentIntentId) return;
  const db = await admin();
  await db
    .from("visitor_snapshots")
    .update({ revoked_at: new Date().toISOString(), visitors: [] })
    .eq("payment_intent_id", paymentIntentId)
    .eq("environment", env)
    .is("revoked_at", null);
}

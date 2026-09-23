import { createFileRoute } from "@tanstack/react-router";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

type Snapshot = {
  visitor_id: string;
  first_name: string;
  avatar_url: string | null;
  city: string | null;
  relationship_status: string | null;
  duration_seconds: number;
  visited_at: string;
};

async function fulfillVisitorSnapshot(session: any, env: StripeEnv) {
  const userId = session.metadata?.userId as string | undefined;
  if (!userId || session.metadata?.purpose !== "visitor_snapshot") return;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: existing } = await supabaseAdmin
    .from("visitor_snapshots")
    .select("id")
    .eq("checkout_session_id", session.id)
    .maybeSingle();
  if (existing) return;

  const { data: visits } = await supabaseAdmin
    .from("profile_visits")
    .select("visitor_id, created_at, duration_seconds")
    .eq("profile_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);

  const latest = new Map<string, { created_at: string; duration_seconds: number }>();
  for (const v of visits ?? []) {
    if (!latest.has(v.visitor_id)) latest.set(v.visitor_id, { created_at: v.created_at, duration_seconds: v.duration_seconds ?? 0 });
  }

  const ids = [...latest.keys()];
  const { data: profiles } = ids.length
    ? await supabaseAdmin
        .from("profiles")
        .select("id, first_name, avatar_url, city, relationship_status, shadowbanned, deleted_at")
        .in("id", ids)
    : { data: [] as any[] };
  const pmap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  const snapshot: Snapshot[] = [];
  for (const id of ids) {
    const p: any = pmap.get(id);
    if (!p || p.shadowbanned || p.deleted_at) continue;
    const v = latest.get(id)!;
    snapshot.push({
      visitor_id: id,
      first_name: p.first_name,
      avatar_url: p.avatar_url,
      city: p.city || null,
      relationship_status: p.relationship_status,
      duration_seconds: v.duration_seconds,
      visited_at: v.created_at,
    });
    if (snapshot.length === 5) break;
  }

  await supabaseAdmin.from("visitor_snapshots").upsert(
    { user_id: userId, checkout_session_id: session.id, environment: env, visitors: snapshot },
    { onConflict: "checkout_session_id" },
  );
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);
  switch (event.type) {
    case "checkout.session.completed":
      if (event.data.object.payment_status !== "unpaid") await fulfillVisitorSnapshot(event.data.object, env);
      break;
    case "checkout.session.async_payment_succeeded":
      await fulfillVisitorSnapshot(event.data.object, env);
      break;
    default:
      console.log("Unhandled event:", event.type);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          return Response.json({ received: true, ignored: "invalid env" });
        }
        try {
          await handleWebhook(request, rawEnv);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});

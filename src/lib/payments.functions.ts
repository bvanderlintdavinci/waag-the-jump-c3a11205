import { createServerFn } from "@tanstack/react-start";
import type Stripe from "stripe";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

type CheckoutSessionResult = { clientSecret: string } | { error: string };

export const VISITOR_SNAPSHOT_PRICE = "profile_visitors_snapshot_once";

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string | undefined; userId?: string | undefined },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) {
    throw new Error("Invalid userId");
  }
  if (options.userId) {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${options.userId}'`,
      limit: 1,
    });
    const hit = found.data[0];
    if (hit) return hit.id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    const customer = existing.data[0];
    if (customer) {
      if (options.userId && customer.metadata?.['userId'] !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

export const createVisitorCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { returnUrl: string; environment: StripeEnv; waiveWithdrawal: boolean }) => {
    if (data.waiveWithdrawal !== true) throw new Error("Bevestig eerst dat je afziet van je bedenktijd.");
    if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("Invalid env");
    if (typeof data.returnUrl !== "string" || !/^https?:\/\//.test(data.returnUrl)) throw new Error("Invalid returnUrl");
    return data;
  })
  .handler(async ({ data, context }): Promise<CheckoutSessionResult> => {
    try {
      const userId = context.userId;
      const email = (context.claims as { email?: string } | undefined)?.email;
      const { collectVisitors, lastSnapshotAt } = await import("@/lib/visitor-snapshot.server");
      const since = await lastSnapshotAt(userId, data.environment);
      const fresh = await collectVisitors(userId, since);
      if (!fresh.length) return { error: "Er zijn nog geen nieuwe bezoekers sinds je vorige momentopname." };
      const stripe = createStripeClient(data.environment);

      const prices = await stripe.prices.list({ lookup_keys: [VISITOR_SNAPSHOT_PRICE] });
      const stripePrice = prices.data[0];
      if (!stripePrice) throw new Error("Price not found");
      const productId = typeof stripePrice.product === "string" ? stripePrice.product : stripePrice.product.id;
      const product = await stripe.products.retrieve(productId);

      const customerId = await resolveOrCreateCustomer(stripe, { email, userId });

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer: customerId,
        payment_intent_data: { description: product.name },
        metadata: { userId, purpose: "visitor_snapshot", managed_payments: "true", withdrawal_waiver_at: new Date().toISOString() },
        managed_payments: { enabled: true },
      } as Stripe.Checkout.SessionCreateParams);

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

export const getVisitorPurchaseStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => {
    if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("Invalid env");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { collectVisitors, lastSnapshotAt } = await import("@/lib/visitor-snapshot.server");
    const since = await lastSnapshotAt(context.userId, data.environment);
    const fresh = await collectVisitors(context.userId, since);
    return { newVisitors: fresh.length, canBuy: fresh.length > 0 };
  });

export const confirmVisitorCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { sessionId: string; environment: StripeEnv }) => {
    if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("Invalid env");
    if (typeof data.sessionId !== "string" || !/^cs_[A-Za-z0-9_]+$/.test(data.sessionId)) throw new Error("Invalid session");
    return data;
  })
  .handler(async ({ data, context }): Promise<{ status: "fulfilled" | "pending" } | { error: string }> => {
    try {
      const stripe = createStripeClient(data.environment);
      const session = await stripe.checkout.sessions.retrieve(data.sessionId);
      if (session.metadata?.["userId"] !== context.userId) return { error: "Deze betaling hoort niet bij jouw account." };
      if (session.payment_status === "unpaid") return { status: "pending" };
      const { fulfillVisitorSnapshot } = await import("@/lib/visitor-snapshot.server");
      await fulfillVisitorSnapshot(session, data.environment);
      return { status: "fulfilled" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

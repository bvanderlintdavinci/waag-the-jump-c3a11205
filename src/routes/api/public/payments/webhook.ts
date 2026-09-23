import { createFileRoute } from "@tanstack/react-router";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";
import { fulfillVisitorSnapshot, revokeByPaymentIntent } from "@/lib/visitor-snapshot.server";

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);
  const obj = event.data.object;
  switch (event.type) {
    case "checkout.session.completed":
      if (obj.payment_status !== "unpaid") await fulfillVisitorSnapshot(obj, env);
      break;
    case "checkout.session.async_payment_succeeded":
      await fulfillVisitorSnapshot({ ...obj, payment_status: "paid" }, env);
      break;
    case "checkout.session.async_payment_failed":
      console.log("Async payment failed for session", obj.id);
      break;
    case "charge.refunded":
    case "charge.dispute.created":
      await revokeByPaymentIntent(typeof obj.payment_intent === "string" ? obj.payment_intent : obj.payment_intent?.id, env);
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

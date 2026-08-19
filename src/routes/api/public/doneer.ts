import { createFileRoute } from "@tanstack/react-router";

/**
 * Redirect naar PayPal. Het ontvangende e-mailadres staat bewust alleen
 * server-side, zodat het nergens in de website-broncode zichtbaar is.
 */
export const Route = createFileRoute("/api/public/doneer")({
  server: {
    handlers: {
      GET: async () => {
        const business = process.env["PAYPAL_DONATION_EMAIL"] ?? "bvanderlint@gmail.com";
        const url = new URL("https://www.paypal.com/donate");
        url.searchParams.set("business", business);
        url.searchParams.set("currency_code", "EUR");
        url.searchParams.set("item_name", "Steun Dare2Meet");
        return new Response(null, { status: 302, headers: { Location: url.toString() } });
      },
    },
  },
});

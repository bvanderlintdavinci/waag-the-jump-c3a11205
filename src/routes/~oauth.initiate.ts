import { createFileRoute } from "@tanstack/react-router";

const OAUTH_BROKER = "https://waag-the-jump.lovable.app/~oauth/initiate";
const ALLOWED_PROVIDERS = new Set(["google", "apple"]);

export const Route = createFileRoute("/~oauth/initiate")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestUrl = new URL(request.url);
        const provider = requestUrl.searchParams.get("provider");
        const redirectUri = requestUrl.searchParams.get("redirect_uri");
        const state = requestUrl.searchParams.get("state");

        if (!provider || !ALLOWED_PROVIDERS.has(provider) || !redirectUri || !state) {
          return new Response("Ongeldige inlogaanvraag", { status: 400 });
        }

        let redirectUrl: URL;
        try {
          redirectUrl = new URL(redirectUri);
        } catch {
          return new Response("Ongeldige terugkeerpagina", { status: 400 });
        }

        const allowedOrigins = new Set([
          requestUrl.origin,
          "https://dare2meet.nl",
          "https://www.dare2meet.nl",
          "https://waag-the-jump.lovable.app",
        ]);
        if (!allowedOrigins.has(redirectUrl.origin) || redirectUrl.pathname !== "/auth/callback") {
          return new Response("Terugkeerpagina niet toegestaan", { status: 400 });
        }

        const brokerUrl = new URL(OAUTH_BROKER);
        requestUrl.searchParams.forEach((value, key) => brokerUrl.searchParams.append(key, value));
        return Response.redirect(brokerUrl, 302);
      },
    },
  },
});
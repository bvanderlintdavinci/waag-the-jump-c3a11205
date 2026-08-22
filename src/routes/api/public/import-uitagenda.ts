import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/import-uitagenda")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["UITAGENDA_CRON_SECRET"];
        if (!secret) {
          return new Response("Niet geconfigureerd", { status: 503 });
        }
        const provided = request.headers.get("x-cron-secret") ?? "";
        if (provided.length !== secret.length || provided !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { importUitagenda, DEFAULT_IMPORT_CITIES } = await import("@/lib/external-events.server");
        try {
          const result = await importUitagenda(DEFAULT_IMPORT_CITIES);
          return Response.json({ ok: true, ...result });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Onbekende fout";
          console.error("[uitagenda] cron import mislukt", message);
          return Response.json({ ok: false, error: message }, { status: 500 });
        }
      },
    },
  },
});

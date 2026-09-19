import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/weekly-report")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["LOVABLE_CRON_SECRET"];
        if (!secret) return new Response("Niet geconfigureerd", { status: 503 });
        const provided = request.headers.get("x-cron-secret") ?? "";
        if (provided.length !== secret.length || provided !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }

        try {
          const { sendWeeklyReport } = await import("@/lib/weekly-report.server");
          const { stats } = await sendWeeklyReport();
          return Response.json({ ok: true, stats });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Onbekende fout";
          console.error("[weekly-report] versturen mislukt", message);
          return Response.json({ ok: false, error: message }, { status: 500 });
        }
      },
    },
  },
});

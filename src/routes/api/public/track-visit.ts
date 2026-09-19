import { createFileRoute } from "@tanstack/react-router";

/**
 * Anonieme bezoekmeting: registreert per sessiesleutel de eerste en laatste
 * activiteit, zodat het weekrapport bezoekers en verblijfsduur kan tonen.
 * Er worden geen IP-adressen of persoonsgegevens opgeslagen.
 */
export const Route = createFileRoute("/api/public/track-visit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { sessionKey?: unknown };
        try {
          body = (await request.json()) as { sessionKey?: unknown };
        } catch {
          return new Response("Ongeldig verzoek", { status: 400 });
        }

        const sessionKey = typeof body.sessionKey === "string" ? body.sessionKey.slice(0, 64) : "";
        if (sessionKey.length < 8) {
          return new Response("Ongeldige sessie", { status: 400 });
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: existing } = await supabaseAdmin
            .from("site_sessions")
            .select("id, page_views")
            .eq("session_key", sessionKey)
            .maybeSingle();

          if (existing) {
            await supabaseAdmin
              .from("site_sessions")
              .update({ last_seen_at: new Date().toISOString(), page_views: (existing.page_views ?? 1) + 1 })
              .eq("id", existing.id);
          } else {
            await supabaseAdmin.from("site_sessions").insert({ session_key: sessionKey });
          }
          return Response.json({ ok: true });
        } catch (error) {
          console.error("[track-visit] mislukt", error instanceof Error ? error.message : error);
          return Response.json({ ok: false }, { status: 500 });
        }
      },
    },
  },
});

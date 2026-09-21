import { createFileRoute } from "@tanstack/react-router";

import { cityFromLocation, citySlug, SITE_URL } from "@/lib/public-activities";
import { listPublicActivities } from "@/lib/public-activities.functions";

const STATIC_PATHS = ["/", "/verhaal", "/uitjes", "/privacy", "/cookies", "/voorwaarden", "/disclaimer"];

/** Sitemap met alle openbare pagina's, inclusief elk uitje en elke plaats. */
export const Route = createFileRoute("/sitemap[.]xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = new Set(STATIC_PATHS.map((p) => `${SITE_URL}${p}`));
        try {
          const activities = await listPublicActivities();
          for (const a of activities) {
            urls.add(`${SITE_URL}/uitje/${a.id}`);
            const city = cityFromLocation(a.location_name);
            if (city) urls.add(`${SITE_URL}/uitjes/${citySlug(city)}`);
          }
        } catch (error) {
          console.error("[sitemap] uitjes ophalen mislukt", error instanceof Error ? error.message : error);
        }

        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls]
          .map((loc) => `  <url><loc>${loc}</loc></url>`)
          .join("\n")}\n</urlset>\n`;

        return new Response(body, {
          headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
        });
      },
    },
  },
});

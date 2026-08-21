import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts
    server: { entry: "server" },
    // Statische export: er wordt een SPA-shell (index.html) gegenereerd, zodat de
    // build op elke statische host (GitHub Pages, eigen server) kan draaien.
    spa: {
      enabled: true,
      prerender: { outputPath: "/index.html", crawlLinks: false },
    },
  },
});

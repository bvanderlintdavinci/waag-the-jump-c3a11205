import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts
    server: { entry: "server" },
  },
  vite: {
    // Dwing Nitro om statische bestanden te bouwen voor GitHub Pages i.p.v. Cloudflare
    nitro: {
      preset: "github-pages",
      prerender: {
        routes: ["/"],
        crawlLinks: true,
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";

/**
 * Redirect naar de Buy Me a Coffee-pagina van Dare2Meet. Oude links naar deze
 * route blijven zo op de juiste doneerpagina uitkomen.
 */
export const Route = createFileRoute("/api/public/doneer")({
  server: {
    handlers: {
      GET: async () =>
        new Response(null, {
          status: 302,
          headers: { Location: "https://buymeacoffee.com/dare2meet" },
        }),
    },
  },
});

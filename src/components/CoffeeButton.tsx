import { Coffee } from "lucide-react";

/**
 * Zwevende donatieknop, zichtbaar op elke pagina. Opent de Buy Me a Coffee-
 * pagina van Dare2Meet in een nieuw tabblad.
 */
export function CoffeeButton() {
  return (
    <a
      data-google-query-build="false"
      href="https://buymeacoffee.com/dare2meet"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Koop een bakje koffie voor de creator"
      className="fixed bottom-20 left-3 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-lift)] transition-transform hover:scale-[1.03] hover:bg-primary/90 sm:bottom-5"
    >
      <Coffee className="size-4" />
      <span>Koop een bakje koffie voor de creator</span>
      <span aria-hidden="true">☕</span>
    </a>
  );
}

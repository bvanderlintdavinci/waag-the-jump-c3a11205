import { Coffee } from "lucide-react";

/**
 * Zwevende donatieknop, zichtbaar op elke pagina. Linkt naar de server-route
 * die naar PayPal doorstuurt, zodat het ontvangende adres verborgen blijft.
 */
export function CoffeeButton() {
  return (
    <a
      data-google-query-build="false"
      href="/api/public/doneer"
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Koop een bak koffie voor Dare2Meet"
      className="fixed bottom-20 left-3 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-lift)] transition-transform hover:scale-[1.03] hover:bg-primary/90 sm:bottom-5"
    >
      <Coffee className="size-4" />
      <span>Koop een bak koffie</span>
      <span aria-hidden="true">☕</span>
    </a>
  );
}

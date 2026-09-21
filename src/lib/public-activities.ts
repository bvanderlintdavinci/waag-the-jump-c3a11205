/** Hulpfuncties voor de openbare uitje- en stadspagina's (bruikbaar op server en client). */

export const SITE_URL = "https://www.dare2meet.nl";

/** Haalt de plaatsnaam uit "Locatie, Plaats" of geeft de hele naam terug. */
export function cityFromLocation(locationName: string | null | undefined): string {
  const parts = (locationName ?? "").split(",").map((p) => p.trim()).filter(Boolean);
  const city = parts.length > 1 ? parts[parts.length - 1]! : (parts[0] ?? "");
  return city.replace(/^regio\s+/i, "").trim();
}

/** Maakt een adresvriendelijke sleutel van een plaatsnaam: "Den Haag" -> "den-haag". */
export function citySlug(city: string): string {
  return city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Toont een slug weer als leesbare plaatsnaam: "den-haag" -> "Den Haag". */
export function cityLabelFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => (part.length <= 3 && ["aan", "den", "der", "van", "op"].includes(part) ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(" ");
}

/** Korte, veilige samenvatting voor zoekresultaten en deelberichten. */
export function shortSummary(text: string | null | undefined, max = 155): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

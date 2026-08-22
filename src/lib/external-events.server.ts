import { PLACES } from "@/lib/geo";

export type ScrapedEvent = {
  source: string;
  source_url: string;
  title: string;
  description: string | null;
  category: string | null;
  city: string | null;
  location_name: string | null;
  starts_at: string;
  image_url: string | null;
  lat: number | null;
  lng: number | null;
};

type RawEvent = {
  title?: unknown;
  starts_at?: unknown;
  city?: unknown;
  location_name?: unknown;
  url?: unknown;
  category?: unknown;
  description?: unknown;
  image_url?: unknown;
};

const EXTRACT_PROMPT =
  "Extract the upcoming events listed on this Dutch outings page as an array 'events'. " +
  "Each event has: title, starts_at (ISO 8601 date-time; use the event date shown on the page, " +
  "assume the current or next year, never a past year), city, location_name, url (absolute link to the event page), " +
  "category (one Dutch word), description (max 200 characters), image_url (absolute). " +
  "Skip advertisements and navigation items. Maximum 20 events.";

function text(value: unknown, max = 400): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim().replace(/\s+/g, " ");
  if (!clean) return null;
  return clean.slice(0, max);
}

function normaliseDate(value: unknown): string | null {
  const raw = text(value, 40);
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  const now = new Date();
  // Sommige bronnen tonen het jaartal van de eerste editie; corrigeer naar het lopende jaar.
  if (parsed.getFullYear() < now.getFullYear()) parsed.setFullYear(now.getFullYear());
  const horizon = new Date(now.getTime() + 400 * 24 * 60 * 60 * 1000);
  if (parsed.getTime() < now.getTime() - 24 * 60 * 60 * 1000) return null;
  if (parsed.getTime() > horizon.getTime()) return null;
  return parsed.toISOString();
}

function coordsFor(city: string | null, fallback: string): { lat: number | null; lng: number | null } {
  const names = [city, fallback].filter((n): n is string => !!n);
  for (const name of names) {
    const q = name.toLowerCase();
    const match = PLACES.find((p) => p.name.toLowerCase() === q);
    if (match) return { lat: match.lat, lng: match.lng };
  }
  return { lat: null, lng: null };
}

async function firecrawlScrape(url: string): Promise<RawEvent[]> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["FIRECRAWL_API_KEY"];
  if (!lovableKey || !connectionKey) {
    throw new Error("Firecrawl is niet gekoppeld (LOVABLE_API_KEY of FIRECRAWL_API_KEY ontbreekt).");
  }

  const res = await fetch("https://connector-gateway.lovable.dev/firecrawl/v2/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": connectionKey,
    },
    body: JSON.stringify({
      url,
      onlyMainContent: true,
      formats: [{ type: "json", prompt: EXTRACT_PROMPT }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[uitagenda] scrape mislukt [${res.status}] ${url}: ${body}`);
    throw new Error(`Scrapen van ${url} mislukte (status ${res.status}).`);
  }

  const payload = (await res.json()) as {
    success?: boolean;
    data?: { json?: { events?: unknown } };
  };
  const events = payload.data?.json?.events;
  return Array.isArray(events) ? (events as RawEvent[]) : [];
}

function toEvent(raw: RawEvent, source: string, city: string, baseUrl: string): ScrapedEvent | null {
  const title = text(raw.title, 160);
  const starts = normaliseDate(raw.starts_at);
  const link = text(raw.url, 500);
  if (!title || !starts || !link) return null;
  let absolute: string;
  try {
    absolute = new URL(link, baseUrl).toString();
  } catch {
    return null;
  }
  const eventCity = text(raw.city, 80) ?? city;
  const coords = coordsFor(eventCity, city);
  return {
    source,
    source_url: absolute,
    title,
    description: text(raw.description, 300),
    category: text(raw.category, 40),
    city: eventCity,
    location_name: text(raw.location_name, 120),
    starts_at: starts,
    image_url: text(raw.image_url, 500),
    lat: coords.lat,
    lng: coords.lng,
  };
}

export const DEFAULT_IMPORT_CITIES = [
  "Utrecht",
  "Amsterdam",
  "Rotterdam",
  "Den Haag",
  "Eindhoven",
  "Groningen",
];

export async function importUitagenda(cities: string[]) {
  const targets = cities.length ? cities : DEFAULT_IMPORT_CITIES;
  const collected = new Map<string, ScrapedEvent>();
  const errors: string[] = [];

  for (const city of targets) {
    const slug = city.toLowerCase().replace(/\s+/g, "-");
    const sources = [
      { source: "dagjeweg.nl", url: `https://www.dagjeweg.nl/kalender/${slug}` },
      { source: "wattedoenin.nl", url: `https://www.wattedoenin.nl/${slug}` },
    ];
    for (const { source, url } of sources) {
      try {
        const raw = await firecrawlScrape(url);
        for (const item of raw) {
          const event = toEvent(item, source, city, url);
          if (event) collected.set(event.source_url, event);
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }
  }

  const rows = [...collected.values()];
  let saved = 0;

  if (rows.length) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Alles komt in dezelfde agenda (activities), zodat mensen zich direct kunnen aanmelden.
    const { error } = await supabaseAdmin.from("activities").upsert(
      rows.map((r) => ({
        title: r.title,
        description: r.description ?? "Regionaal uitje uit de uitagenda. Sluit aan en spreek samen af.",
        category: r.category ?? "Uitje",
        kind: "friendship" as const,
        is_public: true,
        cancelled: false,
        creator_id: null,
        host_name: r.source,
        location_name: [r.location_name, r.city].filter(Boolean).join(", ") || (r.city ?? "Onbekend"),
        location_note: "",
        starts_at: r.starts_at,
        lat: r.lat,
        lng: r.lng,
        source: r.source,
        source_url: r.source_url,
        image_url: r.image_url,
      })),
      { onConflict: "source_url" },
    );
    if (error) throw new Error(`Opslaan mislukt: ${error.message}`);
    saved = rows.length;

    await supabaseAdmin
      .from("activities")
      .delete()
      .not("source_url", "is", null)
      .lt("starts_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  }

  return { saved, cities: targets, errors };
}

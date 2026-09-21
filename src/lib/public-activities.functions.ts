import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { citySlug, cityFromLocation } from "@/lib/public-activities";

export type PublicActivity = {
  id: string;
  title: string;
  description: string;
  category: string;
  starts_at: string;
  ends_at: string | null;
  location_name: string;
  image_key: string;
  image_url: string | null;
  source: string | null;
  source_url: string | null;
};

const COLUMNS = "id, title, description, category, starts_at, ends_at, location_name, image_key, image_url, source, source_url";

function publicClient() {
  return createClient<Database>(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

/** Eén openbaar uitje, ook zichtbaar zonder account. */
export const getPublicActivity = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => ({ id: String(input?.id ?? "").slice(0, 64) }))
  .handler(async ({ data }): Promise<PublicActivity | null> => {
    const { data: row } = await publicClient()
      .from("activities")
      .select(COLUMNS)
      .eq("id", data.id)
      .eq("is_public", true)
      .eq("cancelled", false)
      .maybeSingle();
    return (row as PublicActivity | null) ?? null;
  });

async function fetchUpcoming(): Promise<PublicActivity[]> {
  const { data } = await publicClient()
    .from("activities")
    .select(COLUMNS)
    .eq("is_public", true)
    .eq("cancelled", false)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(500);
  return (data ?? []) as PublicActivity[];
}

/** Alle komende openbare uitjes, gebruikt voor stadspagina's en de sitemap. */
export const listPublicActivities = createServerFn({ method: "GET" }).handler(async () => fetchUpcoming());

/** Komende uitjes in één plaats. */
export const getCityActivities = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => ({ slug: String(input?.slug ?? "").slice(0, 60) }))
  .handler(async ({ data }): Promise<PublicActivity[]> => {
    const all = await fetchUpcoming();
    return all.filter((a) => citySlug(cityFromLocation(a.location_name)) === data.slug);
  });

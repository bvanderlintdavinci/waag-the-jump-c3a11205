import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Rainbow } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useMyProfile, useSession } from "@/hooks/use-auth";
import { ageFromBirthDate, distanceKm, resolveLocation } from "@/lib/geo";
import { intentLabel } from "@/lib/pinguingo";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { DEFAULT_FILTERS, LocationFilter, type Filters } from "@/components/LocationFilter";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/leden")({
  head: () => ({
    meta: [
      { title: "Leden zoeken — PinguinGo" },
      { name: "description", content: "Zoek leden op plaatsnaam, afstand, intentie en interesses." },
      { property: "og:title", content: "Leden zoeken — PinguinGo" },
      { property: "og:description", content: "Vind maatjes of een date binnen jouw afstandscirkel." },
    ],
  }),
  component: Members,
});

function Members() {
  const { user } = useSession();
  const { data: me } = useMyProfile();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const { data: members, isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, avatar_url, city, birth_date, intent, interests, lgbtq_badge, bio, lat, lng")
        .eq("onboarded", true)
        .is("deleted_at", null)
        .limit(300);
      if (error) throw error;
      return data ?? [];
    },
  });

  const center = useMemo(() => {
    const resolved = resolveLocation(filters.place);
    if (resolved) return resolved;
    if (me?.lat != null && me?.lng != null) return { name: me.city, lat: me.lat, lng: me.lng };
    return null;
  }, [filters.place, me]);

  const visible = useMemo(() => {
    return (members ?? [])
      .filter((m) => m.id !== user?.id)
      .map((m) => ({ ...m, distance: center ? distanceKm(center, m) : null }))
      .filter((m) => {
        if (filters.connection === "friendship" && m.intent === "dating") return false;
        if (filters.connection === "dating" && m.intent === "friendship") return false;
        if (filters.category !== "all" && !(m.interests ?? []).includes(filters.category)) return false;
        if (m.distance != null && m.distance > filters.radius) return false;
        return true;
      });
  }, [members, center, filters, user]);

  return (
    <AppShell>
      <h1 className="text-2xl font-extrabold text-foreground">Leden zoeken</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        Filter op plaatsnaam, afstandscirkel, type verbinding en interesses.
      </p>

      <LocationFilter value={filters} onChange={setFilters} resolvedName={center?.name} />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Leden laden...</p>
        ) : visible.length === 0 ? (
          <div className="sm:col-span-2">
            <EmptyState description="Geen leden gevonden binnen deze filters. Vergroot je afstandscirkel eens." />
          </div>
        ) : (
          visible.map((m) => (
            <Link key={m.id} to="/profiel/$id" params={{ id: m.id }} className="surface flex gap-3 p-4">
              <UserAvatar path={m.avatar_url} name={m.first_name} className="size-14" />
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-bold text-foreground">
                  {m.first_name}
                  {ageFromBirthDate(m.birth_date) ? `, ${ageFromBirthDate(m.birth_date)}` : ""}
                  {m.lgbtq_badge ? <Rainbow className="size-4 text-primary" aria-label="LHBTQIA+ badge" /> : null}
                </p>
                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" /> {m.city}
                  {m.distance != null ? ` · ${m.distance} km` : ""}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{m.bio}</p>
                <Badge variant="secondary" className="mt-2">
                  {intentLabel(m.intent)}
                </Badge>
              </div>
            </Link>
          ))
        )}
      </div>
    </AppShell>
  );
}

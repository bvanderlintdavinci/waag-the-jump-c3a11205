import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Rainbow } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useMyProfile, useSession } from "@/hooks/use-auth";
import { ageFromBirthDate, distanceKm, resolveLocation } from "@/lib/geo";
import { intentLabel } from "@/lib/pinguingo";
import { readProfileVisibility } from "@/lib/profile-details";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { DEFAULT_FILTERS, LocationFilter, type Filters } from "@/components/LocationFilter";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/leden")({
  head: () => ({
    meta: [
      { title: "Leden zoeken | Dare2Meet" },
      { name: "description", content: "Zoek leden op plaatsnaam, afstand, intentie en interesses." },
      { property: "og:title", content: "Leden zoeken | Dare2Meet" },
      { property: "og:description", content: "Vind buddy's of een date binnen jouw afstandscirkel." },
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
        .select("id, first_name, avatar_url, city, birth_date, intent, interests, lgbtq_badge, bio, lat, lng, education_level, occupation, industry, relationship_status, child_wish, dating_preferences, profile_visibility")
        .eq("onboarded", true)
        .is("deleted_at", null)
        .limit(300);
      if (error) throw error;
      return data ?? [];
    },
  });

  const center = useMemo(() => {
    if (filters.coords) return filters.coords;
    const resolved = resolveLocation(filters.place);
    if (resolved) return resolved;
    if (me?.lat != null && me?.lng != null) return { name: me.city, lat: me.lat, lng: me.lng };
    return null;
  }, [filters.place, filters.coords, me]);


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

  // In het datinggedeelte tonen we bewust meer info: biografie, hobby's en voorkeuren.
  const showDetails = filters.connection === "dating";

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
          visible.map((m) => {
            const visibility = readProfileVisibility(m.profile_visibility);
            const details = [
              visibility.occupation ? m.occupation : null,
              visibility.industry ? m.industry : null,
              visibility.education_level ? m.education_level : null,
              visibility.relationship_status ? m.relationship_status : null,
              visibility.child_wish && m.child_wish ? `Kinderwens: ${m.child_wish}` : null,
            ].filter(Boolean);
            return (
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
                <p className={`mt-1 text-sm text-muted-foreground ${showDetails ? "line-clamp-4" : "line-clamp-2"}`}>
                  {m.bio}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{intentLabel(m.intent)}</Badge>
                  {showDetails
                    ? (m.interests ?? []).slice(0, 6).map((i) => (
                        <Badge key={i} variant="outline">
                          {i}
                        </Badge>
                      ))
                    : null}
                </div>
                {showDetails ? (
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {(m.interests ?? []).length ? <p>Hobby's en interesses: {(m.interests ?? []).join(", ")}</p> : null}
                    {details.length ? <p>{details.join(" · ")}</p> : null}
                    {visibility.dating_preferences && m.dating_preferences ? <p className="line-clamp-2">Zoekt: {m.dating_preferences}</p> : null}
                  </div>
                ) : null}
              </div>
            </Link>
          );})
        )}
      </div>
    </AppShell>
  );
}

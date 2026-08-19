import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, Plus, Users } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useMyProfile } from "@/hooks/use-auth";
import { distanceKm, resolveLocation } from "@/lib/geo";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { DEFAULT_FILTERS, LocationFilter, type Filters } from "@/components/LocationFilter";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/feed")({
  head: () => ({
    meta: [
      { title: "Waagjes bij jou in de buurt — Dare2Meet" },
      { name: "description", content: "Bekijk alle oproepjes voor activiteiten en dates bij jou in de buurt." },
      { property: "og:title", content: "Waagjes bij jou in de buurt — Dare2Meet" },
      { property: "og:description", content: "Ontdek wat er te doen is en waag de sprong." },
    ],
  }),
  component: Feed,
});

export function useActivitiesFeed() {
  return useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data: activities, error } = await supabase
        .from("activities")
        .select("*")
        .eq("cancelled", false)
        .gte("starts_at", new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString())
        .order("starts_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      const ids = [...new Set((activities ?? []).map((a) => a.creator_id))].filter(
        (v): v is string => !!v,
      );
      const { data: profiles } = ids.length
        ? await supabase.from("profiles").select("id, first_name, avatar_url, city").in("id", ids)
        : { data: [] };
      const { data: parts } = await supabase.from("activity_participants").select("activity_id, user_id");
      const map = new Map((profiles ?? []).map((p) => [p.id, p]));
      return (activities ?? [])
        .filter((a) => !!a.creator_id && map.has(a.creator_id))
        .map((a) => ({
          ...a,
          creator: map.get(a.creator_id!)!,
          participants: (parts ?? []).filter((p) => p.activity_id === a.id).length,
        }));
    },
  });
}

function Feed() {
  const { data: profile } = useMyProfile();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const { data: activities, isLoading } = useActivitiesFeed();

  const center = useMemo(() => {
    const resolved = resolveLocation(filters.place);
    if (resolved) return resolved;
    if (profile?.lat != null && profile?.lng != null)
      return { name: profile.city, lat: profile.lat, lng: profile.lng };
    return null;
  }, [filters.place, profile]);

  const visible = useMemo(() => {
    return (activities ?? [])
      .map((a) => ({ ...a, distance: center ? distanceKm(center, a) : null }))
      .filter((a) => {
        if (filters.connection === "friendship" && a.kind !== "friendship") return false;
        if (filters.connection === "dating" && a.kind !== "date") return false;
        if (filters.category !== "all" && a.category !== filters.category) return false;
        if (a.distance != null && a.distance > filters.radius) return false;
        return true;
      });
  }, [activities, center, filters]);

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Waagjes in de buurt</h1>
          <p className="text-sm text-muted-foreground">
            Oproepjes op datum en afstand{center ? ` vanaf ${center.name}` : ""}.
          </p>
        </div>
        <Link to="/waagje/nieuw">
          <Button>
            <Plus /> Een Waagje plaatsen
          </Button>
        </Link>
      </div>

      <LocationFilter value={filters} onChange={setFilters} resolvedName={center?.name} />

      <div className="mt-6 grid gap-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Waagjes laden...</p>
        ) : visible.length === 0 ? (
          <EmptyState
            description="Er staan nog geen waagjes binnen deze afstandscirkel. Wees de eerste die van de ijsberg springt."
            action={
              <Link to="/waagje/nieuw">
                <Button>Een Waagje plaatsen</Button>
              </Link>
            }
          />
        ) : (
          visible.map((a) => (
            <Link
              key={a.id}
              to="/waagje/$id"
              params={{ id: a.id }}
              className="surface flex gap-4 p-4 transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <UserAvatar path={a.creator.avatar_url} name={a.creator.first_name} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-base font-bold text-foreground">{a.title}</h2>
                  <Badge variant={a.kind === "date" ? "default" : "secondary"}>
                    {a.kind === "date" ? "Date-oproep" : "Vriendschappelijk"}
                  </Badge>
                  <Badge variant="outline">{a.category}</Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3.5" />
                    {new Date(a.starts_at).toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {a.location_name || "Locatie n.t.b."}
                    {a.distance != null ? ` · ${a.distance} km` : ""}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3.5" /> {a.participants}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </AppShell>
  );
}

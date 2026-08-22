import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, ExternalLink, MapPin } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useMyProfile } from "@/hooks/use-auth";
import { distanceKm } from "@/lib/geo";
import { refreshUitagendaIfStale } from "@/lib/external-events.functions";
import { Badge } from "@/components/ui/badge";


const RADIUS_KM = 30;

export function ExternalAgenda() {
  const { data: profile } = useMyProfile();

  const { data, isLoading } = useQuery({
    queryKey: ["external-events"],
    queryFn: async () => {
      const to = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000);
      const { data, error } = await supabase
        .from("external_events")
        .select("*")
        .gte("starts_at", new Date().toISOString())
        .lte("starts_at", to.toISOString())
        .order("starts_at", { ascending: true })
        .limit(120);
      if (error) throw error;
      return data ?? [];
    },
  });

  const items = (data ?? [])
    .map((e) => ({
      ...e,
      distance:
        profile?.lat != null && profile?.lng != null && e.lat != null && e.lng != null
          ? distanceKm({ lat: profile.lat, lng: profile.lng }, { lat: e.lat, lng: e.lng })
          : null,
    }))
    .filter((e) => e.distance == null || e.distance <= RADIUS_KM)
    .slice(0, 12);

  if (isLoading || items.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 pb-12">
      <div className="mb-4">
        <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">Uit de regionale uitagenda</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Automatisch opgehaald van Dagjeweg.nl en wattedoenin.nl. Ga je erheen? Plaats een Waagje en neem
          anderen mee.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((event) => (
          <li key={event.id} className="surface flex flex-col p-4">
            <div className="flex flex-wrap items-center gap-2">
              {event.category ? <Badge variant="outline">{event.category}</Badge> : null}
              <Badge variant="secondary">{event.source}</Badge>
            </div>
            <h3 className="mt-2 text-base font-bold text-foreground">{event.title}</h3>
            {event.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
            ) : null}
            <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                {new Date(event.starts_at).toLocaleDateString("nl-NL", {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                })}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {event.location_name || event.city || "Locatie onbekend"}
                {event.distance != null ? ` · ${event.distance} km` : ""}
              </div>
            </dl>
            <a
              href={event.source_url}
              target="_blank"
              rel="noreferrer nofollow"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Bekijk bij {event.source} <ExternalLink className="size-3.5" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Baby, CalendarDays, Check, Clock, MapPin, Users } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useMyProfile, useSession } from "@/hooks/use-auth";
import { distanceKm } from "@/lib/geo";
import { downloadIcs, googleCalendarUrl } from "@/lib/ics";
import { ensureActivityConversation } from "@/lib/activity-chat";
import { refreshUitagendaIfStale } from "@/lib/external-events.functions";
import { ACTIVITY_IMAGES } from "@/lib/activity-templates";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";



type DemoAttendee = { name: string };

function demoAttendees(value: unknown): DemoAttendee[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is { name: string } => !!v && typeof v === "object" && typeof (v as DemoAttendee).name === "string")
    .map((v) => ({ name: v.name }));
}

const WEEK_LABELS = ["Deze week", "Volgende week", "Over 2 weken", "Over 3 weken"] as const;
const REGION_RADIUS_KM = 20;




export function EventAgenda() {
  const { user } = useSession();
  const { data: profile } = useMyProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [week, setWeek] = useState<number | "all">("all");
  const refreshAgenda = useServerFn(refreshUitagendaIfStale);
  const refreshStarted = useRef(false);

  const { data, isLoading } = useQuery({
    queryKey: ["public-agenda", user?.id ?? "anon"],
    queryFn: async () => {
      const from = new Date();
      const to = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000);
      const { data: events, error } = await supabase
        .from("activities")
        .select("*")
        .eq("is_public", true)
        .eq("cancelled", false)
        .gte("starts_at", from.toISOString())
        .lte("starts_at", to.toISOString())
        .order("starts_at", { ascending: true });
      if (error) throw error;
      const ids = (events ?? []).map((e) => e.id);
      const { data: parts } = ids.length
        ? await supabase.from("activity_participants").select("activity_id, user_id").in("activity_id", ids)
        : { data: [] };
      const memberIds = [...new Set((parts ?? []).map((p) => p.user_id))];
      const { data: profiles } = user && memberIds.length
        ? await supabase.from("profiles").select("id, first_name, avatar_url").in("id", memberIds)
        : { data: [] };
      return { events: events ?? [], parts: parts ?? [], profiles: profiles ?? [] };
    },
  });

  useEffect(() => {
    if (refreshStarted.current) return;
    refreshStarted.current = true;
    void refreshAgenda({})
      .then((r) => {
        if (r?.refreshed) void qc.invalidateQueries({ queryKey: ["public-agenda"] });
      })
      .catch(() => undefined);
  }, [refreshAgenda, qc]);

  const hasHome = profile?.lat != null && profile?.lng != null;

  const groups = useMemo(() => {
    const events = data?.events ?? [];
    const parts = data?.parts ?? [];
    const nameOf = new Map((data?.profiles ?? []).map((p) => [p.id, p]));
    const interests = (profile?.interests ?? []).map((i) => i.toLowerCase());
    const intent = profile?.intent ?? null;
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const buckets: { label: string; items: ReturnType<typeof decorate>[] }[] = WEEK_LABELS.map((label) => ({
      label,
      items: [],
    }));

    function decorate(event: (typeof events)[number]) {
      const joined = parts.filter((p) => p.activity_id === event.id);
      const category = (event.category ?? "").toLowerCase();
      const matchesInterest = interests.some((i) => category.includes(i) || i.includes(category));
      const matchesIntent =
        (intent === "dating" && event.kind === "date") ||
        (intent === "friendship" && event.kind !== "date") ||
        intent === "both";
      return {
        ...event,
        demo: demoAttendees(event.demo_attendees),
        members: joined.map((p) => nameOf.get(p.user_id)).filter((p): p is NonNullable<typeof p> => !!p),
        joinedCount: joined.length,
        isJoined: !!user && joined.some((p) => p.user_id === user.id),
        matchScore: (matchesInterest ? 2 : 0) + (matchesIntent ? 1 : 0),
        distance:
          profile?.lat != null && profile?.lng != null
            ? distanceKm({ lat: profile.lat, lng: profile.lng }, event)
            : null,
      };
    }

    for (const event of events) {
      const days = Math.floor((new Date(event.starts_at).getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
      const index = Math.min(3, Math.max(0, Math.floor(days / 7)));
      const item = decorate(event);
      if (item.distance != null && item.distance > REGION_RADIUS_KM) continue;
      buckets[index]!.items.push(item);
    }
    for (const bucket of buckets) {
      bucket.items.sort(
        (a, b) =>
          b.matchScore - a.matchScore || new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      );
    }
    return buckets
      .map((bucket, index) => ({ ...bucket, index }))
      .filter((b) => b.items.length > 0 && (week === "all" || week === b.index));
  }, [data, profile, user, week]);

  async function join(activityId: string) {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    const { error } = await supabase
      .from("activity_participants")
      .insert({ activity_id: activityId, user_id: user.id });
    if (error) {
      toast.error("Aanmelden mislukt", { description: error.message });
      return;
    }
    const event = (data?.events ?? []).find((e) => e.id === activityId);
    if (event) {
      await ensureActivityConversation(event.id, event.title, user.id);
      downloadIcs({
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location_name,
        startsAt: event.starts_at,
      });
      toast.success("Je bent aangemeld! Overleg samen over tijd en plek.", {
        description: "De agenda-uitnodiging is gedownload en de groepschat staat klaar.",
        action: {
          label: "Google Agenda",
          onClick: () =>
            window.open(
              googleCalendarUrl({
                id: event.id,
                title: event.title,
                description: event.description,
                location: event.location_name,
                startsAt: event.starts_at,
              }),
              "_blank",
              "noopener",
            ),
        },
      });
    } else {
      toast.success("Je bent aangemeld! Waag de sprong.");
    }
    await qc.invalidateQueries({ queryKey: ["public-agenda"] });
  }


  return (
    <section className="mx-auto max-w-5xl px-4 py-12" id="agenda">
      <div className="mb-6">
        <p className="eyebrow">Agenda</p>
        <h2 className="mt-2 text-3xl text-foreground sm:text-4xl">De komende vier weken</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Bekijk de actuele 4-weken agenda voor lokale uitjes, festivals en bijeenkomsten bij jou in de buurt.
          {hasHome ? ` We tonen wat er speelt binnen ${REGION_RADIUS_KM} km van ${profile?.city ?? "je woonplaats"}.` : ""}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button size="sm" variant={week === "all" ? "default" : "outline"} onClick={() => setWeek("all")}>
          Hele maand
        </Button>
        {WEEK_LABELS.map((label, index) => (
          <Button
            key={label}
            size="sm"
            variant={week === index ? "default" : "outline"}
            onClick={() => setWeek(index)}
          >
            {label}
          </Button>
        ))}
      </div>


      {isLoading ? (
        <p className="text-sm text-muted-foreground">Agenda laden...</p>
      ) : groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">Er staan nu geen events in de agenda.</p>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <div key={group.label}>
              <h3 className="mb-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                <CalendarDays className="size-4 text-primary" /> {group.label}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((event) => {
                  const date = new Date(event.starts_at);
                  return (
                    <article key={event.id} className="surface-lift flex flex-col overflow-hidden">
                      <img
                        src={ACTIVITY_IMAGES[event.image_key] ?? ACTIVITY_IMAGES["social"]}
                        alt={event.title}
                        loading="lazy"
                        width={1024}
                        height={640}
                        className="h-40 w-full object-cover"
                      />
                      <div className="flex flex-1 flex-col p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="gradient-primary border-transparent">{event.category}</Badge>
                          {event.kind === "date" ? <Badge variant="outline">Date-oproep</Badge> : null}
                          {event.source ? <Badge variant="secondary">via {event.source}</Badge> : null}
                        </div>
                        <h4 className="mt-2 text-base font-bold text-foreground">{event.title}</h4>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
                        {event.with_kids ? (
                          <p className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-mint-foreground">
                            <Baby className="size-3.5" />
                            Met kinderen
                            {event.kids_count ? ` · ${event.kids_count}` : ""}
                            {event.kids_ages ? ` · ${event.kids_ages}` : ""}
                          </p>
                        ) : null}
                        {event.notes ? (
                          <p className="mt-2 line-clamp-2 text-xs italic text-muted-foreground">{event.notes}</p>
                        ) : null}

                        <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="size-3.5" />
                            {date.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "long" })}
                            <Clock className="ml-2 size-3.5" />
                            {date.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="size-3.5" />
                            {event.location_name}
                            {event.distance != null ? ` · ${event.distance} km` : ""}
                          </div>
                        </dl>

                        {event.source_url ? (
                          <a
                            href={event.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 text-xs font-medium text-primary underline underline-offset-2"
                          >
                            Meer info over dit uitje
                          </a>
                        ) : null}

                        <div className="mt-4 flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {event.members.slice(0, 4).map((m) => (
                              <Link key={m.id} to="/profiel/$id" params={{ id: m.id }} title={m.first_name}>
                                <UserAvatar path={m.avatar_url} name={m.first_name} className="size-8" />
                              </Link>
                            ))}
                            {event.demo.slice(0, 4).map((d) => (
                              <span
                                key={d.name}
                                title={d.name}
                                className="flex size-8 items-center justify-center rounded-full border border-border bg-mint text-xs font-semibold text-mint-foreground"
                              >
                                {d.name.slice(0, 1)}
                              </span>
                            ))}
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="size-3.5" />
                            {event.demo.length + event.joinedCount}
                            {event.max_participants ? ` / ${event.max_participants}` : ""}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-2">
                          {event.isJoined ? (
                            <>
                              <Button variant="secondary" className="w-full" disabled>
                                <Check /> Aangemeld
                              </Button>
                              <Link to="/waagje/$id" params={{ id: event.id }}>
                                <Button variant="outline" className="w-full">
                                  Overleggen over tijd en plek
                                </Button>
                              </Link>
                            </>
                          ) : (
                            <Button className="w-full" onClick={() => void join(event.id)}>
                              Aansluiten / Ik ga ook
                            </Button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

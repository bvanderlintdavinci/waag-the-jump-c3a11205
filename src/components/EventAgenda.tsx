import { useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, Check, Clock, MapPin, Users } from "lucide-react";

import festivalImg from "@/assets/event-festival.jpg";
import coffeeImg from "@/assets/event-coffee.jpg";
import musicImg from "@/assets/event-music.jpg";
import motorImg from "@/assets/event-motor.jpg";
import natureImg from "@/assets/event-nature.jpg";
import socialImg from "@/assets/event-social.jpg";

import { supabase } from "@/integrations/supabase/client";
import { useMyProfile, useSession } from "@/hooks/use-auth";
import { distanceKm } from "@/lib/geo";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const IMAGES: Record<string, string> = {
  festival: festivalImg,
  coffee: coffeeImg,
  music: musicImg,
  motor: motorImg,
  nature: natureImg,
  social: socialImg,
};

type DemoAttendee = { name: string };

function demoAttendees(value: unknown): DemoAttendee[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is { name: string } => !!v && typeof v === "object" && typeof (v as DemoAttendee).name === "string")
    .map((v) => ({ name: v.name }));
}

function weekLabel(index: number) {
  return ["Deze week", "Volgende week", "Over twee weken"][index] ?? "Later";
}

export function EventAgenda() {
  const { user } = useSession();
  const { data: profile } = useMyProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["public-agenda", user?.id ?? "anon"],
    queryFn: async () => {
      const from = new Date();
      const to = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);
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

  const groups = useMemo(() => {
    const events = data?.events ?? [];
    const parts = data?.parts ?? [];
    const nameOf = new Map((data?.profiles ?? []).map((p) => [p.id, p]));
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const buckets: { label: string; items: ReturnType<typeof decorate>[] }[] = [
      { label: weekLabel(0), items: [] },
      { label: weekLabel(1), items: [] },
      { label: weekLabel(2), items: [] },
    ];

    function decorate(event: (typeof events)[number]) {
      const joined = parts.filter((p) => p.activity_id === event.id);
      return {
        ...event,
        demo: demoAttendees(event.demo_attendees),
        members: joined.map((p) => nameOf.get(p.user_id)).filter((p): p is NonNullable<typeof p> => !!p),
        joinedCount: joined.length,
        isJoined: !!user && joined.some((p) => p.user_id === user.id),
        distance:
          profile?.lat != null && profile?.lng != null
            ? distanceKm({ lat: profile.lat, lng: profile.lng }, event)
            : null,
      };
    }

    for (const event of events) {
      const days = Math.floor((new Date(event.starts_at).getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
      const index = Math.min(2, Math.max(0, Math.floor(days / 7)));
      buckets[index]!.items.push(decorate(event));
    }
    return buckets.filter((b) => b.items.length > 0);
  }, [data, profile, user]);

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
    toast.success("Je bent aangemeld! Waag de sprong.");
    await qc.invalidateQueries({ queryKey: ["public-agenda"] });
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12" id="agenda">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">De komende drie weken</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Van festivals en koffie-hotspots tot motorritten en spontane ontmoetingen. Sluit aan bij wat je leuk lijkt.
        </p>
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
                    <article key={event.id} className="surface flex flex-col overflow-hidden">
                      <img
                        src={IMAGES[event.image_key] ?? socialImg}
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
                        </div>
                        <h4 className="mt-2 text-base font-bold text-foreground">{event.title}</h4>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>

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

                        <div className="mt-4">
                          {event.isJoined ? (
                            <Button variant="secondary" className="w-full" disabled>
                              <Check /> Aangemeld
                            </Button>
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

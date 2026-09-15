import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Check, Heart, MapPin, MessageCircle, ShieldCheck, Users, X } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-auth";
import { openDirectChat } from "@/lib/direct-chat";
import { ensureActivityConversation } from "@/lib/activity-chat";
import { formatEventRange } from "@/lib/date-time";
import { activityStatusLabel, capacityLabel, slotsBetween } from "@/lib/activity-status";
import { toggleFavorite } from "@/lib/connections";
import { downloadIcs } from "@/lib/ics";
import { AppShell } from "@/components/AppShell";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/waagje/$id")({
  head: () => ({
    meta: [
      { title: "Waagje | Dare2Meet" },
      { name: "description", content: "Bekijk dit waagje, overleg over tijd en plek en waag de sprong." },
      { property: "og:title", content: "Waagje | Dare2Meet" },
      { property: "og:description", content: "Bekijk de details, stem af met de anderen en meld je aan." },
    ],
  }),
  component: ActivityDetail,
});

function ActivityDetail() {
  const { id } = Route.useParams();
  const { user } = useSession();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState("");
  const [slot, setSlot] = useState("");
  const [maxGroup, setMaxGroup] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["activity", id, user?.id],
    queryFn: async () => {
      const { data: activity, error } = await supabase.from("activities").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!activity) return null;
      const { data: participants } = await supabase
        .from("activity_participants")
        .select("user_id, slot_note, max_group_preference")
        .eq("activity_id", id);
      const { data: requests } = await supabase
        .from("activity_requests")
        .select("id, requester_id, message, status, created_at")
        .eq("activity_id", id)
        .order("created_at", { ascending: true });
      const ids = [
        ...new Set([
          activity.creator_id,
          ...(participants ?? []).map((p) => p.user_id),
          ...(requests ?? []).map((r) => r.requester_id),
        ]),
      ].filter((v): v is string => !!v);
      const { data: profiles } = ids.length
        ? await supabase.from("profiles").select("id, first_name, avatar_url, city").in("id", ids)
        : { data: [] };
      const { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("activity_id", id)
        .maybeSingle();
      const { data: favs } = user
        ? await supabase.from("favorites").select("favorite_id").eq("owner_id", user.id)
        : { data: [] };
      return {
        activity,
        conversationId: conv?.id ?? null,
        participants: participants ?? [],
        requests: requests ?? [],
        profiles: profiles ?? [],
        favorites: (favs ?? []).map((f) => f.favorite_id),
      };
    },
  });

  if (isLoading) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Laden...</p>
      </AppShell>
    );
  }
  if (!data) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Dit waagje bestaat niet meer.</p>
      </AppShell>
    );
  }

  const { activity, participants, requests, profiles, conversationId, favorites } = data;
  const creator = profiles.find((p) => p.id === activity.creator_id);
  const participantIds = participants.map((p) => p.user_id);
  const joined = !!user && participantIds.includes(user.id);
  const isOrganiser = !!user && activity.creator_id === user.id;
  const isDate = activity.kind === "date";
  const slots = slotsBetween(activity.starts_at, activity.ends_at);
  const myRequest = requests.find((r) => r.requester_id === user?.id);
  const closed = activity.status !== "open" || activity.cancelled;
  const statusLabel = activityStatusLabel(activity.status);

  async function join() {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("activity_participants").insert({
      activity_id: id,
      user_id: user.id,
      slot_note: slot || null,
      max_group_preference: maxGroup ? Number(maxGroup) : null,
    });
    setBusy(false);
    if (error) {
      toast.error("Aanmelden mislukt", { description: error.message });
      return;
    }
    await ensureActivityConversation(id, activity.title, user.id);
    downloadIcs({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      location: activity.location_name,
      startsAt: activity.starts_at,
    });
    await qc.invalidateQueries();
    toast.success("Je hebt de sprong gewaagd!", {
      description: "Overleg in de groepschat over tijd, plek en wie er meegaan.",
    });
  }

  async function sendRequest() {
    if (!user || !requestMessage.trim()) return;
    setBusy(true);
    const { error } = await supabase
      .from("activity_requests")
      .insert({ activity_id: id, requester_id: user.id, message: requestMessage.trim() });
    setBusy(false);
    if (error) {
      toast.error("Aanvraag versturen mislukt", { description: error.message });
      return;
    }
    setRequestMessage("");
    await qc.invalidateQueries({ queryKey: ["activity", id] });
    toast.success("Je aanvraag is verstuurd", {
      description: "De plaatser bekijkt je bericht en laat weten of het een match is.",
    });
  }

  async function respondRequest(requestId: string, requesterId: string, accept: boolean) {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("activity_requests")
      .update({ status: accept ? "accepted" : "declined" })
      .eq("id", requestId);
    setBusy(false);
    if (error) {
      toast.error("Bijwerken mislukt", { description: error.message });
      return;
    }
    await qc.invalidateQueries();
    if (accept) {
      try {
        const convId = await openDirectChat(user.id, requesterId, activity.title);
        toast.success("Geaccepteerd! De oproep is nu vervuld.");
        navigate({ to: "/chats/$id", params: { id: convId } });
      } catch {
        toast.success("Geaccepteerd! De oproep is nu vervuld.");
      }
      return;
    }
    toast.success("Aanvraag overgeslagen");
  }

  async function favorite(otherId: string) {
    if (!user) return;
    const isFav = favorites.includes(otherId);
    try {
      await toggleFavorite(user.id, otherId, isFav);
      await qc.invalidateQueries({ queryKey: ["activity", id] });
      toast.success(isFav ? "Uit favorieten gehaald" : "Toegevoegd aan je favorieten");
    } catch (e) {
      toast.error("Bijwerken mislukt", { description: e instanceof Error ? e.message : undefined });
    }
  }

  async function openGroupChat() {
    if (!user) return;
    const convId = conversationId ?? (await ensureActivityConversation(id, activity.title, user.id));
    if (!convId) {
      toast.error("De groepschat kon niet geopend worden.");
      return;
    }
    navigate({ to: "/chats/$id", params: { id: convId } });
  }

  async function sendProposal() {
    if (!user || !proposal.trim()) return;
    setBusy(true);
    const convId = conversationId ?? (await ensureActivityConversation(id, activity.title, user.id));
    if (!convId) {
      setBusy(false);
      toast.error("De groepschat kon niet geopend worden.");
      return;
    }
    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: convId, sender_id: user.id, body: `Voorstel: ${proposal.trim()}` });
    setBusy(false);
    if (error) {
      toast.error("Voorstel plaatsen mislukt", { description: error.message });
      return;
    }
    setProposal("");
    toast.success("Je voorstel staat in de groepschat.");
    await qc.invalidateQueries({ queryKey: ["activity", id] });
  }

  async function saveDetails(form: FormData) {
    if (!user) return;
    setBusy(true);
    const startsAt = String(form.get("startsAt") ?? "");
    const endsAt = String(form.get("endsAt") ?? "");
    const locationName = String(form.get("locationName") ?? "");
    const note = String(form.get("note") ?? "");
    const { error } = await supabase
      .from("activities")
      .update({
        starts_at: new Date(startsAt).toISOString(),
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        location_name: locationName,
        location_note: note,
      })
      .eq("id", id);
    if (error) {
      setBusy(false);
      toast.error("Bijwerken mislukt", { description: error.message });
      return;
    }
    const convId = conversationId ?? (await ensureActivityConversation(id, activity.title, user.id));
    if (convId) {
      await supabase.from("messages").insert({
        conversation_id: convId,
        sender_id: user.id,
        body: `De afspraak is bijgewerkt: ${new Date(startsAt).toLocaleString("nl-NL", {
          dateStyle: "full",
          timeStyle: "short",
        })} bij ${locationName}.${note ? ` ${note}` : ""}`,
      });
    }
    setBusy(false);
    await qc.invalidateQueries({ queryKey: ["activity", id] });
    toast.success("Afspraak bijgewerkt", { description: "Iedereen ziet het in de groepschat." });
  }

  async function messageMember(otherId: string, name: string) {
    if (!user) return;
    try {
      const convId = await openDirectChat(user.id, otherId, name);
      navigate({ to: "/chats/$id", params: { id: convId } });
    } catch (e) {
      toast.error("Bericht starten mislukt", { description: e instanceof Error ? e.message : undefined });
    }
  }

  const localStart = toLocalInput(activity.starts_at);
  const localEnd = activity.ends_at ? toLocalInput(activity.ends_at) : "";

  return (
    <AppShell>
      <div className="surface p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={isDate ? "default" : "secondary"}>
            {isDate ? "Date-oproep (één-op-één)" : "Vriendschappelijk"}
          </Badge>
          <Badge variant="outline">{activity.category}</Badge>
          {statusLabel ? <Badge variant="outline">{statusLabel}</Badge> : null}
        </div>
        <h1 className="mt-3 text-2xl font-extrabold text-foreground">{activity.title}</h1>
        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{activity.description}</p>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {formatEventRange(activity.starts_at, activity.ends_at)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4" /> {activity.location_name || "Locatie n.t.b."}
          </span>
          {isDate ? null : (
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4" /> {capacityLabel(participants.length, activity.max_participants)}
            </span>
          )}
        </div>
        {activity.location_note ? (
          <p className="mt-3 rounded-lg bg-muted p-3 text-sm text-foreground">{activity.location_note}</p>
        ) : null}

        {creator ? (
          <Link
            to="/profiel/$id"
            params={{ id: creator.id }}
            className="mt-5 inline-flex items-center gap-3 rounded-xl bg-muted px-3 py-2"
          >
            <UserAvatar path={creator.avatar_url} name={creator.first_name} className="size-9" />
            <span className="text-sm">
              <span className="font-semibold text-foreground">{creator.first_name}</span>
              <span className="text-muted-foreground"> · {creator.city}</span>
            </span>
          </Link>
        ) : null}

        {isDate ? (
          <div className="mt-6 grid gap-3">
            {isOrganiser ? (
              <p className="text-sm text-muted-foreground">
                Jij beheert deze oproep: hieronder zie je wie contact zoekt. Accepteer je iemand, dan sluit de
                oproep automatisch en opent er een privéchat.
              </p>
            ) : closed ? (
              <p className="rounded-lg bg-muted p-3 text-sm text-foreground">
                Deze oproep is inmiddels {statusLabel === "Vervuld" ? "vervuld" : "gesloten"}. Bekijk gerust de
                andere oproepen in de agenda.
              </p>
            ) : myRequest ? (
              <p className="rounded-lg bg-muted p-3 text-sm text-foreground">
                {myRequest.status === "accepted"
                  ? "Je aanvraag is geaccepteerd. Kijk in je chats voor het gesprek."
                  : myRequest.status === "declined"
                    ? "Deze oproep is aan iemand anders toegewezen. Blijf vooral kijken, er komen steeds nieuwe oproepen bij."
                    : "Je aanvraag staat open. De plaatser laat weten of het een match is."}
              </p>
            ) : (
              <>
                <Label htmlFor="req">Stuur een bericht met je aanvraag</Label>
                <Textarea
                  id="req"
                  rows={3}
                  maxLength={500}
                  placeholder="Vertel kort iets over jezelf en waarom dit je leuk lijkt."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                />
                <Button
                  className="justify-self-start"
                  disabled={busy || !requestMessage.trim()}
                  onClick={() => void sendRequest()}
                >
                  Aanvraag versturen
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="mt-6 grid gap-3">
            {joined ? (
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => void openGroupChat()}>
                  <MessageCircle /> Naar de groepschat
                </Button>
              </div>
            ) : closed ? (
              <p className="rounded-lg bg-muted p-3 text-sm text-foreground">Dit Waagje is gesloten.</p>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  {slots.length ? (
                    <div className="grid gap-1.5">
                      <Label>Welk uurblok past jou?</Label>
                      <Select value={slot} onValueChange={setSlot}>
                        <SelectTrigger>
                          <SelectValue placeholder="Kies een tijdstip" />
                        </SelectTrigger>
                        <SelectContent>
                          {slots.map((s) => (
                            <SelectItem key={s} value={s}>
                              vanaf {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                  <div className="grid gap-1.5">
                    <Label htmlFor="maxgroup">Liefst met niet meer dan ... personen erbij</Label>
                    <Input
                      id="maxgroup"
                      type="number"
                      min={1}
                      max={30}
                      placeholder="Bijvoorbeeld 4"
                      value={maxGroup}
                      onChange={(e) => setMaxGroup(e.target.value)}
                    />
                  </div>
                </div>
                <Button size="lg" className="justify-self-start" disabled={busy} onClick={() => void join()}>
                  Ik waag de sprong!
                </Button>
              </>
            )}
            <Button
              variant="outline"
              className="justify-self-start"
              onClick={() =>
                downloadIcs({
                  id: activity.id,
                  title: activity.title,
                  description: activity.description,
                  location: activity.location_name,
                  startsAt: activity.starts_at,
                })
              }
            >
              <CalendarDays /> Zet in mijn agenda
            </Button>
          </div>
        )}
      </div>

      {isDate && isOrganiser ? (
        <section className="surface mt-6 p-6">
          <h2 className="text-base font-bold text-foreground">Aanvragen beheren</h2>
          {requests.length === 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">Nog geen aanvragen binnengekomen.</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {requests.map((r) => {
                const p = profiles.find((x) => x.id === r.requester_id);
                return (
                  <div key={r.id} className="rounded-xl border border-border p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link to="/profiel/$id" params={{ id: r.requester_id }} className="flex items-center gap-3">
                        <UserAvatar path={p?.avatar_url ?? null} name={p?.first_name ?? "Lid"} className="size-9" />
                        <span className="text-sm font-semibold text-foreground">{p?.first_name ?? "Lid"}</span>
                      </Link>
                      <Badge variant="outline">
                        {r.status === "accepted" ? "Geaccepteerd" : r.status === "declined" ? "Overgeslagen" : "Nieuw"}
                      </Badge>
                    </div>
                    {r.message ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{r.message}</p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {r.status === "pending" ? (
                        <>
                          <Button size="sm" disabled={busy} onClick={() => void respondRequest(r.id, r.requester_id, true)}>
                            <Check /> Accepteren
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() => void respondRequest(r.id, r.requester_id, false)}
                          >
                            <X /> Overslaan
                          </Button>
                        </>
                      ) : null}
                      <Button size="sm" variant="outline" onClick={() => void favorite(r.requester_id)}>
                        <Heart /> {favorites.includes(r.requester_id) ? "Uit favorieten" : "Bewaar als favoriet"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void messageMember(r.requester_id, p?.first_name ?? "Lid")}
                      >
                        <MessageCircle /> Bericht
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      {joined && !isDate ? (
        <section className="surface mt-6 p-6">
          <h2 className="text-base font-bold text-foreground">Afspraken maken</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Nog niet alles staat vast? Stel een tijd, plek of vervoer voor. Je voorstel komt in de groepschat te
            staan, zodat iedereen kan reageren.
          </p>
          <Textarea
            className="mt-3"
            rows={3}
            maxLength={500}
            placeholder="Bijvoorbeeld: zullen we een half uur later afspreken bij de ingang? Ik kan twee mensen meenemen met de auto."
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button disabled={busy || !proposal.trim()} onClick={() => void sendProposal()}>
              Voorstel plaatsen
            </Button>
            <Button variant="outline" onClick={() => void openGroupChat()}>
              <MessageCircle /> Open de groepschat
            </Button>
          </div>

          {isOrganiser ? (
            <form
              className="mt-6 grid gap-3 border-t border-border pt-5"
              onSubmit={(e) => {
                e.preventDefault();
                void saveDetails(new FormData(e.currentTarget));
              }}
            >
              <p className="text-sm font-semibold text-foreground">Definitief maken (organisator)</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="startsAt">Begintijd</Label>
                  <Input id="startsAt" name="startsAt" type="datetime-local" defaultValue={localStart} required />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="endsAt">Eindtijd</Label>
                  <Input id="endsAt" name="endsAt" type="datetime-local" defaultValue={localEnd} />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="locationName">Ontmoetingsplek</Label>
                <Input
                  id="locationName"
                  name="locationName"
                  maxLength={120}
                  defaultValue={activity.location_name}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="note">Toelichting (wie neemt wat mee, waar precies)</Label>
                <Textarea id="note" name="note" rows={2} maxLength={300} defaultValue={activity.location_note} />
              </div>
              <Button type="submit" disabled={busy} className="justify-self-start">
                Afspraak bijwerken
              </Button>
            </form>
          ) : null}

          <p className="mt-5 inline-flex items-start gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            Spreek de eerste keer af op een openbare plek, regel je eigen vervoer en laat iemand weten waar je
            bent. Voelt iets niet goed? Gebruik de meld- of blokkeerknop.
          </p>
        </section>
      ) : null}

      {!isDate && (joined || isOrganiser) ? (
        <>
          <h2 className="mb-3 mt-8 text-base font-bold text-foreground">Waaggenoten</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {profiles
              .filter((p) => participantIds.includes(p.id))
              .map((p) => {
                const detail = participants.find((x) => x.user_id === p.id);
                return (
                  <div key={p.id} className="surface flex flex-wrap items-center gap-3 p-3">
                    <Link to="/profiel/$id" params={{ id: p.id }} className="flex min-w-0 flex-1 items-center gap-3">
                      <UserAvatar path={p.avatar_url} name={p.first_name} className="size-9" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">{p.first_name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {p.city}
                          {detail?.slot_note ? ` · vanaf ${detail.slot_note}` : ""}
                          {isOrganiser && detail?.max_group_preference
                            ? ` · liefst max. ${detail.max_group_preference} erbij`
                            : ""}
                        </span>
                      </span>
                    </Link>
                    {user && p.id !== user.id ? (
                      <Button size="sm" variant="outline" onClick={() => void messageMember(p.id, p.first_name)}>
                        <MessageCircle /> Bericht sturen
                      </Button>
                    ) : null}
                  </div>
                );
              })}
          </div>
        </>
      ) : null}
    </AppShell>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

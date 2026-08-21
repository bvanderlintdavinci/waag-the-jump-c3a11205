import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-auth";
import { openDirectChat } from "@/lib/direct-chat";
import { ensureActivityConversation } from "@/lib/activity-chat";
import { downloadIcs } from "@/lib/ics";
import { AppShell } from "@/components/AppShell";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["activity", id],
    queryFn: async () => {
      const { data: activity, error } = await supabase.from("activities").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!activity) return null;
      const { data: participants } = await supabase
        .from("activity_participants")
        .select("user_id")
        .eq("activity_id", id);
      const ids = [
        ...new Set([activity.creator_id, ...(participants ?? []).map((p) => p.user_id)]),
      ].filter((v): v is string => !!v);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, avatar_url, city")
        .in("id", ids);
      const { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("activity_id", id)
        .maybeSingle();
      return {
        activity,
        conversationId: conv?.id ?? null,
        participants: (participants ?? []).map((p) => p.user_id),
        profiles: profiles ?? [],
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

  const { activity, participants, profiles, conversationId } = data;
  const creator = profiles.find((p) => p.id === activity.creator_id);
  const joined = !!user && participants.includes(user.id);
  const isOrganiser = !!user && activity.creator_id === user.id;

  async function join() {
    if (!user) return;
    const { error } = await supabase
      .from("activity_participants")
      .insert({ activity_id: id, user_id: user.id });
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
    const locationName = String(form.get("locationName") ?? "");
    const note = String(form.get("note") ?? "");
    const { error } = await supabase
      .from("activities")
      .update({
        starts_at: new Date(startsAt).toISOString(),
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

  return (
    <AppShell>
      <div className="surface p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={activity.kind === "date" ? "default" : "secondary"}>
            {activity.kind === "date" ? "Date-oproep" : "Vriendschappelijk"}
          </Badge>
          <Badge variant="outline">{activity.category}</Badge>
        </div>
        <h1 className="mt-3 text-2xl font-extrabold text-foreground">{activity.title}</h1>
        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{activity.description}</p>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {new Date(activity.starts_at).toLocaleString("nl-NL", { dateStyle: "full", timeStyle: "short" })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4" /> {activity.location_name || "Locatie n.t.b."}
          </span>
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

        <div className="mt-6 flex flex-wrap gap-3">
          {joined ? (
            <Button onClick={() => void openGroupChat()}>
              <MessageCircle /> Naar de groepschat
            </Button>
          ) : (
            <Button size="lg" onClick={() => void join()}>
              Ik waag de sprong!
            </Button>
          )}
          <Button
            variant="outline"
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
      </div>

      {joined ? (
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
              <div className="grid gap-1.5">
                <Label htmlFor="startsAt">Datum en tijd</Label>
                <Input id="startsAt" name="startsAt" type="datetime-local" defaultValue={localStart} required />
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

      <h2 className="mb-3 mt-8 text-base font-bold text-foreground">
        Waaggenoten ({participants.length})
      </h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {profiles
          .filter((p) => participants.includes(p.id))
          .map((p) => (
            <div key={p.id} className="surface flex items-center gap-3 p-3">
              <Link to="/profiel/$id" params={{ id: p.id }} className="flex min-w-0 flex-1 items-center gap-3">
                <UserAvatar path={p.avatar_url} name={p.first_name} className="size-9" />
                <span className="truncate text-sm font-semibold text-foreground">{p.first_name}</span>
                <span className="truncate text-xs text-muted-foreground">{p.city}</span>
              </Link>
              {user && p.id !== user.id ? (
                <Button size="sm" variant="outline" onClick={() => void messageMember(p.id, p.first_name)}>
                  <MessageCircle /> Bericht sturen
                </Button>
              ) : null}
            </div>
          ))}
      </div>
    </AppShell>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

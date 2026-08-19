import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, MapPin, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/waagje/$id")({
  head: () => ({
    meta: [
      { title: "Waagje — PinguinGo" },
      { name: "description", content: "Bekijk dit waagje en waag de sprong om mee te doen." },
      { property: "og:title", content: "Waagje — PinguinGo" },
      { property: "og:description", content: "Bekijk de details en meld je aan voor deze activiteit." },
    ],
  }),
  component: ActivityDetail,
});

function ActivityDetail() {
  const { id } = Route.useParams();
  const { user } = useSession();
  const qc = useQueryClient();
  const navigate = useNavigate();

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
      const ids = [...new Set([activity.creator_id, ...(participants ?? []).map((p) => p.user_id)])];
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

  async function join() {
    if (!user) return;
    const { error } = await supabase
      .from("activity_participants")
      .insert({ activity_id: id, user_id: user.id });
    if (error) {
      toast.error("Aanmelden mislukt", { description: error.message });
      return;
    }
    if (conversationId) {
      await supabase
        .from("conversation_participants")
        .insert({ conversation_id: conversationId, user_id: user.id });
    }
    await qc.invalidateQueries();
    toast.success("Je hebt de sprong gewaagd!", { description: "De groepschat staat voor je klaar." });
  }

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
            <Button
              onClick={() => conversationId && navigate({ to: "/chats/$id", params: { id: conversationId } })}
              disabled={!conversationId}
            >
              <MessageCircle /> Naar de groepschat
            </Button>
          ) : (
            <Button size="lg" onClick={join}>
              Ik waag de sprong!
            </Button>
          )}
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-base font-bold text-foreground">
        Waaggenoten ({participants.length})
      </h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {profiles
          .filter((p) => participants.includes(p.id))
          .map((p) => (
            <Link key={p.id} to="/profiel/$id" params={{ id: p.id }} className="surface flex items-center gap-3 p-3">
              <UserAvatar path={p.avatar_url} name={p.first_name} className="size-9" />
              <span className="text-sm font-semibold text-foreground">{p.first_name}</span>
              <span className="text-xs text-muted-foreground">{p.city}</span>
            </Link>
          ))}
      </div>
    </AppShell>
  );
}

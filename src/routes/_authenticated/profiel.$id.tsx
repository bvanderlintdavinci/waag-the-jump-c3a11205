import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, MessageCircle, Rainbow } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-auth";
import { ageFromBirthDate } from "@/lib/geo";
import { intentLabel } from "@/lib/pinguingo";
import { AppShell } from "@/components/AppShell";
import { UserAvatar } from "@/components/UserAvatar";
import { BlockDialog, ReportDialog } from "@/components/SafetyDialogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/profiel/$id")({
  head: () => ({
    meta: [
      { title: "Profiel — PinguinGo" },
      { name: "description", content: "Bekijk dit profiel en stuur een chatverzoek." },
      { property: "og:title", content: "Profiel — PinguinGo" },
      { property: "og:description", content: "Bekijk dit lid van PinguinGo." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { id } = Route.useParams();
  const { user } = useSession();
  const navigate = useNavigate();
  const isMe = user?.id === id;

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!user || isMe || !profile) return;
    void supabase.from("profile_visits").insert({ visitor_id: user.id, profile_id: id });
  }, [user, isMe, profile, id]);

  async function startChat() {
    if (!user) return;
    const { data: mine } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);
    const { data: theirs } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", id);
    const shared = (mine ?? []).find((m) => (theirs ?? []).some((t) => t.conversation_id === m.conversation_id));
    if (shared) {
      const { data: conv } = await supabase
        .from("conversations")
        .select("id, is_group")
        .eq("id", shared.conversation_id)
        .maybeSingle();
      if (conv && !conv.is_group) {
        navigate({ to: "/chats/$id", params: { id: conv.id } });
        return;
      }
    }
    const { data: conv, error } = await supabase
      .from("conversations")
      .insert({ is_group: false, created_by: user.id, title: profile?.first_name ?? null })
      .select("id")
      .single();
    if (error || !conv) {
      toast.error("Chat starten mislukt", { description: error?.message });
      return;
    }
    await supabase.from("conversation_participants").insert([
      { conversation_id: conv.id, user_id: user.id },
      { conversation_id: conv.id, user_id: id },
    ]);
    navigate({ to: "/chats/$id", params: { id: conv.id } });
  }

  if (isLoading) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Laden...</p>
      </AppShell>
    );
  }
  if (!profile) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Dit profiel is niet (meer) zichtbaar.</p>
      </AppShell>
    );
  }

  const age = ageFromBirthDate(profile.birth_date);

  return (
    <AppShell>
      <div className="surface p-6">
        <div className="flex flex-wrap items-center gap-4">
          <UserAvatar path={profile.avatar_url} name={profile.first_name} className="size-20" />
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold text-foreground">
              {profile.first_name}
              {age ? `, ${age}` : ""}
              {profile.lgbtq_badge ? (
                <Rainbow className="size-5 text-primary" aria-label="LHBTQIA+ community badge" />
              ) : null}
            </h1>
            <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-4" /> {profile.city}
            </p>
          </div>
          {!isMe ? (
            <div className="ml-auto flex flex-wrap gap-2">
              <Button onClick={startChat}>
                <MessageCircle /> Chatverzoek sturen
              </Button>
              <BlockDialog userId={profile.id} userName={profile.first_name} />
              <ReportDialog userId={profile.id} />
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Badge>{intentLabel(profile.intent)}</Badge>
          {profile.gender ? <Badge variant="outline">{profile.gender}</Badge> : null}
          {(profile.interests ?? []).map((i) => (
            <Badge key={i} variant="secondary">
              {i}
            </Badge>
          ))}
        </div>

        {profile.bio ? (
          <p className="mt-5 whitespace-pre-wrap text-sm text-foreground">{profile.bio}</p>
        ) : (
          <p className="mt-5 text-sm text-muted-foreground">Dit lid heeft nog niets over zichzelf geschreven.</p>
        )}
      </div>
    </AppShell>
  );
}

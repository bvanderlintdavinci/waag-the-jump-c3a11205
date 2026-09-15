import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Baby, BriefcaseBusiness, GraduationCap, Heart, House, Languages, MapPin, MessageCircle, Phone, Rainbow, Sparkles, UserCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-auth";
import { ageFromBirthDate } from "@/lib/geo";
import { intentLabel } from "@/lib/pinguingo";
import { readProfileVisibility, type ExtendedProfileKey } from "@/lib/profile-details";
import {
  connectionState,
  fetchConnection,
  removeConnection,
  requestConnection,
  respondConnection,
  toggleFavorite,
} from "@/lib/connections";
import { childLabel, useChildren } from "@/components/ChildrenEditor";
import { AppShell } from "@/components/AppShell";
import { UserAvatar } from "@/components/UserAvatar";
import { BlockDialog, ReportDialog } from "@/components/SafetyDialogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/profiel/$id")({
  head: () => ({
    meta: [
      { title: "Profiel | Dare2Meet" },
      { name: "description", content: "Bekijk dit profiel en stuur een chatverzoek." },
      { property: "og:title", content: "Profiel | Dare2Meet" },
      { property: "og:description", content: "Bekijk dit lid van Dare2Meet." },
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

  const qc = useQueryClient();
  const { data: children = [] } = useChildren(id);

  const { data: connection } = useQuery({
    queryKey: ["connection", user?.id, id],
    enabled: !!user && !isMe,
    queryFn: () => fetchConnection(user!.id, id),
  });

  const { data: isFavorite = false } = useQuery({
    queryKey: ["favorite", user?.id, id],
    enabled: !!user && !isMe,
    queryFn: async () => {
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("owner_id", user!.id)
        .eq("favorite_id", id)
        .maybeSingle();
      return !!data;
    },
  });

  const relation = connectionState(connection ?? null, user?.id ?? "");

  async function connectAction() {
    if (!user) return;
    try {
      if (relation === "none" || relation === "declined") {
        if (connection && relation === "declined") await removeConnection(connection.id);
        await requestConnection(user.id, id);
        toast.success("Connectieverzoek verstuurd");
      } else if (relation === "pending_in" && connection) {
        await respondConnection(connection.id, true);
        toast.success("Jullie zijn nu connecties");
      } else if (connection) {
        await removeConnection(connection.id);
        toast.success("Connectie verwijderd");
      }
      await qc.invalidateQueries({ queryKey: ["connection"] });
      await qc.invalidateQueries({ queryKey: ["connections"] });
    } catch (e) {
      toast.error("Actie mislukt", { description: e instanceof Error ? e.message : undefined });
    }
  }

  async function favoriteAction() {
    if (!user) return;
    try {
      await toggleFavorite(user.id, id, isFavorite);
      await qc.invalidateQueries({ queryKey: ["favorite"] });
      await qc.invalidateQueries({ queryKey: ["connections"] });
    } catch (e) {
      toast.error("Actie mislukt", { description: e instanceof Error ? e.message : undefined });
    }
  }

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
  const visibility = readProfileVisibility(profile.profile_visibility);
  const canShow = (key: ExtendedProfileKey) => isMe || visibility[key];
  const detailGroups = [
    {
      title: "Werk en achtergrond",
      icon: BriefcaseBusiness,
      items: [
        canShow("education_level") && profile.education_level ? { icon: GraduationCap, label: "Opleiding", value: profile.education_level } : null,
        canShow("occupation") && profile.occupation ? { icon: BriefcaseBusiness, label: "Beroep", value: profile.occupation } : null,
        canShow("industry") && profile.industry ? { icon: BriefcaseBusiness, label: "Branche", value: profile.industry } : null,
        canShow("languages") && profile.languages?.length ? { icon: Languages, label: "Talen", value: profile.languages.join(", ") } : null,
        canShow("living_situation") && profile.living_situation ? { icon: House, label: "Woonsituatie", value: profile.living_situation } : null,
      ].filter(Boolean),
    },
    {
      title: "Leven en vrije tijd",
      icon: Sparkles,
      items: [
        canShow("sports") && profile.sports?.length ? { icon: Sparkles, label: "Sport", value: profile.sports.join(", ") } : null,
        canShow("lifestyle") && profile.lifestyle ? { icon: Sparkles, label: "Levensstijl", value: profile.lifestyle } : null,
        canShow("favorite_activities") && profile.favorite_activities ? { icon: Sparkles, label: "Favoriete bezigheden", value: profile.favorite_activities } : null,
        canShow("appearance_style") && profile.appearance_style ? { icon: Sparkles, label: "Stijl", value: profile.appearance_style } : null,
        canShow("tattoos") && profile.tattoos ? { icon: Sparkles, label: "Tatoeages", value: profile.tattoos } : null,
        canShow("piercings") && profile.piercings ? { icon: Sparkles, label: "Piercings", value: profile.piercings } : null,
      ].filter(Boolean),
    },
    {
      title: "Dating en gezin",
      icon: Heart,
      items: [
        canShow("relationship_status") && profile.relationship_status ? { icon: Heart, label: "Relatiestatus", value: profile.relationship_status } : null,
        canShow("has_children") && profile.has_children ? { icon: Heart, label: "Kinderen", value: profile.has_children } : null,
        canShow("children_details") && profile.children_details ? { icon: Heart, label: "Over het gezin", value: profile.children_details } : null,
        canShow("child_wish") && profile.child_wish ? { icon: Heart, label: "Kinderwens", value: profile.child_wish } : null,
        canShow("dating_preferences") && profile.dating_preferences ? { icon: Heart, label: "Zoekt", value: profile.dating_preferences } : null,
      ].filter(Boolean),
    },
  ].filter((group) => group.items.length > 0);

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
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary" title="Vrijwillige LHBTQIA+ communitybadge voor herkenning en inclusiviteit">
                  <Rainbow className="size-5" aria-hidden="true" /> Community
                </span>
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
              <Button variant="outline" onClick={() => void connectAction()}>
                {relation === "accepted" ? (
                  <>
                    <UserCheck /> Connectie verwijderen
                  </>
                ) : relation === "pending_out" ? (
                  <>
                    <UserPlus /> Verzoek intrekken
                  </>
                ) : relation === "pending_in" ? (
                  <>
                    <UserCheck /> Verzoek accepteren
                  </>
                ) : (
                  <>
                    <UserPlus /> Connectie maken
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => void favoriteAction()}>
                <Heart /> {isFavorite ? "Uit favorieten" : "Favoriet"}
              </Button>
              <BlockDialog userId={profile.id} userName={profile.first_name} />
              <ReportDialog userId={profile.id} />
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Badge>{intentLabel(profile.intent)}</Badge>
          {profile.gender ? <Badge variant="outline">{profile.gender}</Badge> : null}
          {relation === "accepted" ? <Badge variant="outline">Connectie</Badge> : null}
          {(profile.interests ?? []).map((i) => (
            <Badge key={i} variant="secondary">
              {i}
            </Badge>
          ))}
        </div>

        {children.length ? (
          <div className="mt-5 rounded-xl bg-muted p-4">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <Baby className="size-4 text-primary" /> Kinderen
            </h2>
            <p className="mt-1 text-sm text-foreground">{children.map(childLabel).join(" · ")}</p>
          </div>
        ) : null}

        {profile.phone &&
        (isMe || (profile.phone_visibility !== "none" && relation === "accepted")) ? (
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-foreground">
            <Phone className="size-4 text-primary" /> {profile.phone}
          </p>
        ) : null}

        {profile.bio ? (
          <div className="mt-6 border-t border-border pt-5">
            <h2 className="text-xl text-foreground">Over {profile.first_name}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{profile.bio}</p>
          </div>
        ) : (
          <p className="mt-5 text-sm text-muted-foreground">Dit lid heeft nog niets over zichzelf geschreven.</p>
        )}

        {detailGroups.length ? (
          <div className="mt-6 grid gap-6 border-t border-border pt-5 sm:grid-cols-2">
            {detailGroups.map((group) => (
              <section key={group.title}>
                <h2 className="flex items-center gap-2 text-lg text-foreground"><group.icon className="size-5 text-primary" /> {group.title}</h2>
                <dl className="mt-3 grid gap-3">
                  {group.items.map((item) => item ? (
                    <div key={item.label}>
                      <dt className="text-xs font-semibold uppercase text-muted-foreground">{item.label}</dt>
                      <dd className="mt-0.5 whitespace-pre-wrap text-sm text-foreground">{item.value}</dd>
                    </div>
                  ) : null)}
                </dl>
              </section>
            ))}
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

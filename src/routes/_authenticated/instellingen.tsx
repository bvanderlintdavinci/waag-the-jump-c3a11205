import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Coffee, Eye, Trash2, UserCheck } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useMyProfile, useSession } from "@/hooks/use-auth";
import { guardText } from "@/lib/moderation-guard";
import { resolveLocation } from "@/lib/geo";
import { CATEGORIES, GENDERS, INTENTS } from "@/lib/pinguingo";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/instellingen")({
  head: () => ({
    meta: [
      { title: "Account & instellingen | Dare2Meet" },
      { name: "description", content: "Beheer je profiel, geblokkeerde leden, profielbezoekers en je account." },
      { property: "og:title", content: "Account & instellingen | Dare2Meet" },
      { property: "og:description", content: "Beheer je Dare2Meet-account en privacy-instellingen." },
    ],
  }),
  component: Settings,
});

function Settings() {
  return (
    <AppShell>
      <h1 className="mb-5 text-2xl font-extrabold text-foreground">Account</h1>
      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">Profiel</TabsTrigger>
          <TabsTrigger value="blocked">Geblokkeerde leden</TabsTrigger>
          <TabsTrigger value="visitors">Profielbezoekers</TabsTrigger>
          <TabsTrigger value="danger">Account verwijderen</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-5">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="blocked" className="mt-5">
          <BlockedList />
        </TabsContent>
        <TabsContent value="visitors" className="mt-5">
          <Visitors />
        </TabsContent>
        <TabsContent value="danger" className="mt-5">
          <DangerZone />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function ProfileForm() {
  const { user } = useSession();
  const { data: profile } = useMyProfile();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});
  const [interests, setInterests] = useState<string[] | null>(null);
  const [badge, setBadge] = useState<boolean | null>(null);
  const [consent, setConsent] = useState<boolean | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  if (!profile) return <p className="text-sm text-muted-foreground">Laden...</p>;

  const val = (key: string) =>
    form[key] ?? ((profile as unknown as Record<string, string | null>)[key] ?? "");
  const currentInterests = interests ?? profile.interests ?? [];
  const currentBadge = badge ?? profile.lgbtq_badge;
  const currentConsent = consent ?? profile.lgbtq_consent;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (currentBadge && !currentConsent) {
      toast.error("Geef expliciet toestemming om de community-badge te tonen.");
      return;
    }
    const bio = val("bio");
    if (!(await guardText("bio", bio, user.id))) return;
    setBusy(true);
    let avatarPath = profile!.avatar_url;
    if (file) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) {
        setBusy(false);
        toast.error("Uploaden mislukt", { description: upErr.message });
        return;
      }
      avatarPath = path;
    }
    const city = val("city");
    const postcode = val("postcode");
    const place = resolveLocation(postcode || city);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: val("first_name"),
        city,
        postcode: postcode || null,
        bio,
        gender: val("gender") || null,
        intent: (form["intent"] ?? profile!.intent) as "friendship" | "dating" | "both",
        interests: currentInterests,
        lgbtq_badge: currentBadge && currentConsent,
        lgbtq_consent: currentConsent,
        lat: place?.lat ?? profile!.lat,
        lng: place?.lng ?? profile!.lng,
        avatar_url: avatarPath,
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) {
      toast.error("Opslaan mislukt", { description: error.message });
      return;
    }
    await qc.invalidateQueries();
    toast.success("Profiel bijgewerkt");
  }

  return (
    <form onSubmit={save} className="surface grid gap-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="s-fn">Voornaam</Label>
          <Input
            id="s-fn"
            maxLength={60}
            value={val("first_name")}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="s-city">Woonplaats</Label>
          <Input
            id="s-city"
            maxLength={80}
            value={val("city")}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="s-pc">Postcode</Label>
          <Input
            id="s-pc"
            maxLength={10}
            value={val("postcode")}
            onChange={(e) => setForm({ ...form, postcode: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Gender (optioneel)</Label>
          <Select value={val("gender")} onValueChange={(v) => setForm({ ...form, gender: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Niet ingevuld" />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="s-photo">Nieuwe profielfoto</Label>
        <Input
          id="s-photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="s-bio">Over jou</Label>
        <Textarea
          id="s-bio"
          rows={4}
          maxLength={800}
          value={val("bio")}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
      </div>

      <div className="grid gap-1.5">
        <Label>Zoekdoel</Label>
        <Select
          value={form["intent"] ?? profile.intent}
          onValueChange={(v) => setForm({ ...form, intent: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {INTENTS.map((i) => (
              <SelectItem key={i.value} value={i.value}>
                {i.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label>Interesses</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() =>
                setInterests(
                  currentInterests.includes(c)
                    ? currentInterests.filter((i) => i !== c)
                    : [...currentInterests, c],
                )
              }
            >
              <Badge variant={currentInterests.includes(c) ? "default" : "outline"} className="cursor-pointer">
                {c}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox id="s-badge" checked={currentBadge} onCheckedChange={(v) => setBadge(v === true)} className="mt-0.5" />
        <Label htmlFor="s-badge" className="text-sm font-normal">
          Toon de LHBTQIA+ community badge op mijn profiel.
        </Label>
      </div>
      <div className="flex items-start gap-2">
        <Checkbox
          id="s-consent"
          checked={currentConsent}
          onCheckedChange={(v) => setConsent(v === true)}
          className="mt-0.5"
        />
        <Label htmlFor="s-consent" className="text-xs font-normal text-muted-foreground">
          Ik geef expliciete toestemming om mijn geaardheid/identiteit en het bijbehorende icoon zichtbaar te
          maken voor andere leden.
        </Label>
      </div>

      <Button type="submit" disabled={busy}>
        Opslaan
      </Button>
    </form>
  );
}

function BlockedList() {
  const { user } = useSession();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["blocked-list", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: blocks } = await supabase
        .from("blocks")
        .select("id, blocked_id, reason, created_at")
        .eq("blocker_id", user!.id);
      const ids = (blocks ?? []).map((b) => b.blocked_id);
      const { data: profiles } = ids.length
        ? await supabase.from("profiles").select("id, first_name").in("id", ids)
        : { data: [] };
      const names = new Map((profiles ?? []).map((p) => [p.id, p.first_name]));
      return (blocks ?? []).map((b) => ({ ...b, name: names.get(b.blocked_id) ?? "Lid" }));
    },
  });

  async function unblock(blockId: string) {
    const { error } = await supabase.from("blocks").delete().eq("id", blockId);
    if (error) {
      toast.error("Deblokkeren mislukt", { description: error.message });
      return;
    }
    await qc.invalidateQueries();
    toast.success("Lid gedeblokkeerd");
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Laden...</p>;
  if (!data?.length) return <EmptyState title="Je hebt niemand geblokkeerd" />;

  return (
    <div className="grid gap-2">
      {data.map((b) => (
        <div key={b.id} className="surface flex flex-wrap items-center gap-3 p-4">
          <div>
            <p className="font-semibold text-foreground">{b.name}</p>
            <p className="text-xs text-muted-foreground">Reden: {b.reason}</p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => unblock(b.id)}>
            <UserCheck /> Deblokkeren
          </Button>
        </div>
      ))}
    </div>
  );
}

function Visitors() {
  const { user } = useSession();

  const { data: unlocked } = useQuery({
    queryKey: ["unlock", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("visit_unlocks").select("id").eq("user_id", user!.id).limit(1);
      return !!data?.length;
    },
  });

  const { data: visits } = useQuery({
    queryKey: ["visits", user?.id, unlocked],
    enabled: !!user && unlocked === true,
    queryFn: async () => {
      const { data: rows } = await supabase
        .from("profile_visits")
        .select("id, visitor_id, created_at")
        .eq("profile_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(100);
      const ids = [...new Set((rows ?? []).map((r) => r.visitor_id))];
      const { data: profiles } = ids.length
        ? await supabase.from("profiles").select("id, first_name, city").in("id", ids)
        : { data: [] };
      const map = new Map((profiles ?? []).map((p) => [p.id, p]));
      return (rows ?? []).map((r) => ({ ...r, profile: map.get(r.visitor_id) }));
    },
  });

  return (
    <div className="grid gap-4">
      <div className="surface flex flex-wrap items-center gap-4 p-5">
        <Coffee className="size-6 text-primary" />
        <div className="min-w-52 flex-1">
          <p className="font-bold text-foreground">Buy Me a Coffee</p>
          <p className="text-sm text-muted-foreground">
            Het basisaccount is gratis. Een vrijwillige donatie houdt Dare2Meet draaiend.
          </p>
        </div>
        <Button asChild>
          <a href="/api/public/doneer" target="_blank" rel="noreferrer noopener">
            Doneer een koffie
          </a>
        </Button>
      </div>

      <div className="surface p-5">
        <p className="font-bold text-foreground">Jouw gegevens en privacy</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Download een kopie van alles wat we van je bewaren, of lees hoe we met je gegevens omgaan.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={async () => {
              if (!user) return;
              const uid = user.id;
              const [profile, activities, joins, blocks, reports, feedback] = await Promise.all([
                supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
                supabase.from("activities").select("*").eq("creator_id", uid),
                supabase.from("activity_participants").select("*").eq("user_id", uid),
                supabase.from("blocks").select("*").eq("blocker_id", uid),
                supabase.from("reports").select("*").eq("reporter_id", uid),
                supabase.from("feedback_messages").select("id, kind, message, created_at").eq("user_id", uid),
              ]);
              const payload = {
                geexporteerd_op: new Date().toISOString(),
                account: { id: uid, email: user.email },
                profiel: profile.data,
                geplaatste_uitjes: activities.data ?? [],
                aanmeldingen: joins.data ?? [],
                blokkades: blocks.data ?? [],
                meldingen: reports.data ?? [],
                feedback: feedback.data ?? [],
              };
              const url = URL.createObjectURL(
                new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
              );
              const a = document.createElement("a");
              a.href = url;
              a.download = "dare2meet-mijn-gegevens.json";
              a.click();
              URL.revokeObjectURL(url);
              toast.success("Je gegevens zijn gedownload.");
            }}
          >
            Download mijn gegevens
          </Button>
          <a href="/privacy" className="text-sm underline text-muted-foreground hover:text-foreground">
            Privacybeleid
          </a>
          <a href="/cookies" className="text-sm underline text-muted-foreground hover:text-foreground">
            Cookies
          </a>
          <a href="/voorwaarden" className="text-sm underline text-muted-foreground hover:text-foreground">
            Voorwaarden
          </a>
          <a href="/disclaimer" className="text-sm underline text-muted-foreground hover:text-foreground">
            Disclaimer
          </a>
        </div>
      </div>


      {!unlocked ? (
        <div className="surface flex flex-wrap items-center gap-4 p-5">
          <Eye className="size-6 text-primary" />
          <div className="min-w-52 flex-1">
            <p className="font-bold text-foreground">Profielbezoekers ontgrendelen</p>
            <p className="text-sm text-muted-foreground">
              Eenmalig € 2,99 om te zien wie je profiel de afgelopen periode bezocht. Geen abonnement.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              toast.info("Betaalprovider koppelen", {
                description: "Stripe of Mollie moet nog gekoppeld worden om deze micro-transactie live te zetten.",
              })
            }
          >
            Ontgrendel € 2,99
          </Button>
        </div>
      ) : !visits?.length ? (
        <EmptyState description="Nog geen profielbezoekers om te tonen." />
      ) : (
        <div className="grid gap-2">
          {visits.map((v) => (
            <div key={v.id} className="surface flex items-center gap-3 p-4">
              <span className="font-semibold text-foreground">{v.profile?.first_name ?? "Lid"}</span>
              <span className="text-xs text-muted-foreground">{v.profile?.city}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {new Date(v.created_at).toLocaleDateString("nl-NL")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DangerZone() {
  const { user } = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function requestDeletion() {
    if (!user) return;
    const purge = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
    await supabase.from("deletion_requests").insert({ user_id: user.id, purge_after: purge });
    const { error } = await supabase
      .from("profiles")
      .update({ deleted_at: new Date().toISOString(), purge_after: purge })
      .eq("id", user.id);
    if (error) {
      toast.error("Verwijderverzoek mislukt", { description: error.message });
      return;
    }
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Je profiel is direct onzichtbaar gemaakt.");
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="surface p-5">
      <h2 className="text-base font-bold text-foreground">Account verwijderen</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Je profiel wordt direct onzichtbaar voor alle leden. Om te voorkomen dat sporen na ongepast of strafbaar
        gedrag snel worden gewist, bewaren we je gegevens, chats en logs nog 30 dagen voor eventuele lopende
        meldingen of politie-onderzoeken. Daarna worden ze definitief verwijderd.
      </p>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="mt-4">
            <Trash2 /> Verwijderverzoek indienen
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Weet je het zeker?</AlertDialogTitle>
            <AlertDialogDescription>
              Je profiel verdwijnt direct uit de app. Na 30 dagen worden alle gegevens definitief gewist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={requestDeletion}>Ja, verwijderen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

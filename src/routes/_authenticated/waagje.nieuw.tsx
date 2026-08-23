import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useMyProfile, useSession } from "@/hooks/use-auth";
import { guardText } from "@/lib/moderation-guard";
import { resolveLocation } from "@/lib/geo";
import { CATEGORIES } from "@/lib/pinguingo";
import { ACTIVITY_TEMPLATES, type ActivityTemplate } from "@/lib/activity-templates";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/waagje/nieuw")({
  head: () => ({
    meta: [
      { title: "Een Waagje plaatsen | Dare2Meet" },
      { name: "description", content: "Plaats een oproepje voor een activiteit of date bij jou in de buurt." },
      { property: "og:title", content: "Een Waagje plaatsen | Dare2Meet" },
      { property: "og:description", content: "Nodig anderen uit om samen iets te ondernemen." },
    ],
  }),
  component: NewActivity,
});

function NewActivity() {
  const { user } = useSession();
  const { data: profile } = useMyProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [kind, setKind] = useState<"friendship" | "date">("friendship");
  const [startsAt, setStartsAt] = useState("");
  const [locationName, setLocationName] = useState(profile?.city ?? "");
  const [imageKey, setImageKey] = useState<string>("social");
  const [locationHint, setLocationHint] = useState("Waar spreken we af?");
  const [withKids, setWithKids] = useState(false);
  const [kidsCount, setKidsCount] = useState("1");
  const [kidsAges, setKidsAges] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  function pickTemplate(t: ActivityTemplate) {
    setImageKey(t.key);
    setCategory(t.category);
    setLocationHint(t.locationHint);
    if (t.title) setTitle(t.title);
    if (t.description) setDescription(t.description);
    if (!t.kidsFriendly) setWithKids(false);
  }

  const { data: postedThisMonth = 0 } = useQuery({
    queryKey: ["my-monthly-activities", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("activities")
        .select("id", { count: "exact", head: true })
        .eq("creator_id", user!.id)
        .gte("created_at", monthStart.toISOString());
      return count ?? 0;
    },
  });
  const remaining = Math.max(0, 2 - postedThisMonth);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !startsAt) {
      toast.error("Titel en datum/tijd zijn verplicht.");
      return;
    }
    if (!(await guardText("activity", `${title} ${description}`, user.id))) return;

    setBusy(true);
    const place = resolveLocation(locationName);
    const { data: activity, error } = await supabase
      .from("activities")
      .insert({
        creator_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        kind,
        starts_at: new Date(startsAt).toISOString(),
        location_name: locationName.trim(),
        image_key: imageKey,
        with_kids: withKids,
        kids_count: withKids && kidsCount ? Number(kidsCount) : null,
        kids_ages: withKids ? kidsAges.trim() : "",
        notes: notes.trim(),
        lat: place?.lat ?? profile?.lat ?? null,
        lng: place?.lng ?? profile?.lng ?? null,
      })
      .select("id")
      .single();

    if (error || !activity) {
      setBusy(false);
      const limitHit = error?.message?.includes("maximaal 2 Waagjes");
      toast.error(limitHit ? "Maandlimiet bereikt" : "Plaatsen mislukt", {
        description: limitHit
          ? "Je kunt maximaal 2 keer per maand zelf een Waagje plaatsen. Sluit ondertussen gerust aan bij de agenda."
          : error?.message,
      });
      return;
    }

    const { data: conv } = await supabase
      .from("conversations")
      .insert({ activity_id: activity.id, is_group: true, title: title.trim(), created_by: user.id })
      .select("id")
      .single();
    if (conv) {
      await supabase.from("conversation_participants").insert({ conversation_id: conv.id, user_id: user.id });
    }
    await supabase.from("activity_participants").insert({ activity_id: activity.id, user_id: user.id });

    setBusy(false);
    await qc.invalidateQueries();
    toast.success("Je Waagje staat online!");
    navigate({ to: "/waagje/$id", params: { id: activity.id } });
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-extrabold text-foreground">Een Waagje plaatsen</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Wie zich aanmeldt komt automatisch in een besloten groepschat. Je kunt maximaal 2 Waagjes per maand
        plaatsen, je hebt er deze maand nog {remaining} over.
      </p>

      <form onSubmit={submit} className="surface mt-5 grid gap-4 p-5">
        <div className="grid gap-2">
          <Label>Kies een sfeerbeeld en startpunt</Label>
          <p className="text-xs text-muted-foreground">
            Je vult daarna alles zelf aan: eigen locatie, tijd, met of zonder kinderen en opmerkingen.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ACTIVITY_TEMPLATES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => pickTemplate(t)}
                aria-pressed={imageKey === t.key}
                className={`overflow-hidden rounded-xl border text-left transition-shadow ${
                  imageKey === t.key
                    ? "border-primary shadow-[var(--shadow-lift)]"
                    : "border-border hover:shadow-[var(--shadow-soft)]"
                }`}
              >
                <img
                  src={t.image}
                  alt={t.label}
                  loading="lazy"
                  width={1024}
                  height={640}
                  className="h-20 w-full object-cover"
                />
                <span className="block px-2 py-1.5 text-xs font-semibold text-foreground">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="title">Titel</Label>
          <Input
            id="title"
            required
            maxLength={120}
            placeholder="Zondag koffie in het park"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="desc">Omschrijving</Label>
          <Textarea
            id="desc"
            rows={4}
            maxLength={1000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Categorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="when">Datum en tijd</Label>
            <Input
              id="when"
              type="datetime-local"
              required
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="loc">Locatie (zelf invullen)</Label>
          <Input
            id="loc"
            maxLength={120}
            placeholder={locationHint}
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Geef gerust een exacte plek op, bijvoorbeeld een markt, zwembad of verzamelpunt.
          </p>
        </div>

        <div className="grid gap-3 rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label htmlFor="kids">Met kinderen erbij</Label>
              <p className="text-xs text-muted-foreground">Handig voor andere ouders om te weten.</p>
            </div>
            <Switch id="kids" checked={withKids} onCheckedChange={setWithKids} />
          </div>
          {withKids ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="kids-count">Aantal kinderen</Label>
                <Input
                  id="kids-count"
                  type="number"
                  min={1}
                  max={10}
                  value={kidsCount}
                  onChange={(e) => setKidsCount(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="kids-ages">Leeftijden</Label>
                <Input
                  id="kids-ages"
                  maxLength={60}
                  placeholder="Bijvoorbeeld 4, 6 en 9 jaar"
                  value={kidsAges}
                  onChange={(e) => setKidsAges(e.target.value)}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="notes">Opmerkingen (optioneel)</Label>
          <Textarea
            id="notes"
            rows={3}
            maxLength={400}
            placeholder="Bijvoorbeeld: kosten deelt iedereen zelf, honden welkom, neem sportkleding mee."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Type oproep</Label>
          <RadioGroup value={kind} onValueChange={(v) => setKind(v as "friendship" | "date")} className="gap-2">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="friendship" id="k-f" />
              <Label htmlFor="k-f" className="font-normal">
                Vriendschappelijk
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="date" id="k-d" />
              <Label htmlFor="k-d" className="font-normal">
                Date-oproep
              </Label>
            </div>
          </RadioGroup>
        </div>
        <Button type="submit" size="lg" disabled={busy}>
          Waagje plaatsen
        </Button>
      </form>
    </AppShell>
  );
}

import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import waag from "@/assets/waag-penguin.png";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile, useSession } from "@/hooks/use-auth";
import { guardText } from "@/lib/moderation-guard";
import { resolveLocation } from "@/lib/geo";
import { CATEGORIES, GENDERS, INTENTS } from "@/lib/pinguingo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Je profiel opbouwen — Dare2Meet" },
      { name: "description", content: "Vul je profiel aan zodat leden bij jou in de buurt je kunnen vinden." },
      { property: "og:title", content: "Je profiel opbouwen — Dare2Meet" },
      { property: "og:description", content: "Vertel wie je bent en waar je voor openstaat." },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const { user } = useSession();
  const { data: profile } = useMyProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [firstName, setFirstName] = useState(profile?.first_name ?? "");
  const [birthDate, setBirthDate] = useState(profile?.birth_date ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [postcode, setPostcode] = useState(profile?.postcode ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [gender, setGender] = useState<string>(profile?.gender ?? "");
  const [intent, setIntent] = useState<string>(profile?.intent ?? "both");
  const [interests, setInterests] = useState<string[]>(profile?.interests ?? []);
  const [lgbtqBadge, setLgbtqBadge] = useState(false);
  const [lgbtqConsent, setLgbtqConsent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  function toggleInterest(c: string) {
    setInterests((prev) => (prev.includes(c) ? prev.filter((i) => i !== c) : [...prev, c]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!firstName.trim() || !birthDate || !city.trim()) {
      toast.error("Voornaam, geboortedatum en woonplaats zijn verplicht.");
      return;
    }
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    if (age < 18) {
      toast.error("Je moet minimaal 18 jaar zijn om mee te doen.");
      return;
    }
    if (!profile?.avatar_url && !file) {
      toast.error("Upload een echte profielfoto (geen avatar of tekening).");
      return;
    }
    if (lgbtqBadge && !lgbtqConsent) {
      toast.error("Geef expliciet toestemming om de community-badge te tonen.");
      return;
    }
    if (!(await guardText("bio", `${firstName} ${bio}`, user.id))) return;

    setBusy(true);
    let avatarPath = profile?.avatar_url ?? null;
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

    const place = resolveLocation(postcode || city);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        birth_date: birthDate,
        city: city.trim(),
        postcode: postcode.trim() || null,
        lat: place?.lat ?? null,
        lng: place?.lng ?? null,
        bio: bio.trim(),
        gender: gender || null,
        intent: intent as "friendship" | "dating" | "both",
        interests,
        lgbtq_badge: lgbtqBadge && lgbtqConsent,
        lgbtq_consent: lgbtqConsent,
        avatar_url: avatarPath,
        onboarded: true,
      })
      .eq("id", user.id);
    setBusy(false);

    if (error) {
      toast.error("Opslaan mislukt", { description: error.message });
      return;
    }
    await qc.invalidateQueries();
    toast.success("Welkom bij Dare2Meet!");
    navigate({ to: "/feed" });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <img src={waag} alt="Waag de pinguïn" width={1024} height={1024} className="size-12 object-contain" />
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Bouw je profiel op</h1>
          <p className="text-sm text-muted-foreground">Nog even, dan sta je op de rand van de ijsberg.</p>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-5">
        <section className="surface grid gap-4 p-5">
          <h2 className="text-base font-bold">Basis (verplicht)</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="fn">Voornaam</Label>
              <Input id="fn" required maxLength={60} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bd">Geboortedatum</Label>
              <Input id="bd" type="date" required value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="city">Woonplaats / regio</Label>
              <Input id="city" required maxLength={80} value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pc">Postcode (voor afstandsberekening)</Label>
              <Input id="pc" maxLength={10} value={postcode} onChange={(e) => setPostcode(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="photo">Echte profielfoto (geen avatars of tekeningen)</Label>
            <Input
              id="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="bio">Over jou</Label>
            <Textarea
              id="bio"
              maxLength={800}
              rows={4}
              placeholder="Waar word je blij van? Wat zou je graag samen doen?"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </section>

        <section className="surface grid gap-4 p-5">
          <h2 className="text-base font-bold">Waar sta je voor open?</h2>
          <RadioGroup value={intent} onValueChange={setIntent} className="gap-2">
            {INTENTS.map((i) => (
              <div key={i.value} className="flex items-center gap-2">
                <RadioGroupItem value={i.value} id={`intent-${i.value}`} />
                <Label htmlFor={`intent-${i.value}`} className="font-normal">
                  {i.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="grid gap-1.5">
            <Label>Interesses</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button type="button" key={c} onClick={() => toggleInterest(c)}>
                  <Badge variant={interests.includes(c) ? "default" : "outline"} className="cursor-pointer">
                    {c}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="surface grid gap-4 p-5">
          <div>
            <h2 className="text-base font-bold">Identiteit (volledig optioneel)</h2>
            <p className="text-xs text-muted-foreground">
              Dit zijn bijzondere persoonsgegevens. Je hoeft niets in te vullen en kunt het later altijd wissen.
            </p>
          </div>
          <div className="grid gap-1.5">
            <Label>Gender</Label>
            <Select value={gender} onValueChange={setGender}>
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
          <div className="flex items-start gap-2">
            <Checkbox
              id="badge"
              checked={lgbtqBadge}
              onCheckedChange={(v) => setLgbtqBadge(v === true)}
              className="mt-0.5"
            />
            <Label htmlFor="badge" className="text-sm font-normal leading-snug">
              Toon een discrete regenboog-pinguïn (LHBTQIA+ community badge) op mijn profiel.
            </Label>
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              id="badge-consent"
              checked={lgbtqConsent}
              onCheckedChange={(v) => setLgbtqConsent(v === true)}
              className="mt-0.5"
            />
            <Label htmlFor="badge-consent" className="text-xs font-normal leading-snug text-muted-foreground">
              Ik geef expliciete toestemming om mijn geaardheid/identiteit en het bijbehorende icoon op mijn
              profiel zichtbaar te maken voor andere leden.
            </Label>
          </div>
        </section>

        <Button type="submit" size="lg" disabled={busy}>
          Profiel opslaan en beginnen
        </Button>
      </form>
    </div>
  );
}

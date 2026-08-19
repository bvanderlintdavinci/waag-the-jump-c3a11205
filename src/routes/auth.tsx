import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import waag from "@/assets/waag-penguin.png";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Inloggen of registreren — Dare2Meet" },
      {
        name: "description",
        content: "Maak een gratis Dare2Meet-basisaccount en ontmoet maatjes of een date bij jou in de buurt.",
      },
      { property: "og:title", content: "Inloggen of registreren — Dare2Meet" },
      { property: "og:description", content: "Waag de sprong en ga er samen op uit met Dare2Meet." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [visibility, setVisibility] = useState(false);
  const [law, setLaw] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });
    setBusy(false);
    if (error) {
      toast.error("Inloggen mislukt", { description: error.message });
      return;
    }
    navigate({ to: "/feed" });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    if (!terms || !privacy || !visibility || !law) {
      toast.error("Vink alle verplichte akkoorden aan om verder te gaan.");
      return;
    }
    if (password.length < 8) {
      toast.error("Kies een wachtwoord van minimaal 8 tekens.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { first_name: firstName.trim() },
      },
    });
    setBusy(false);
    if (error) {
      toast.error("Registreren mislukt", { description: error.message });
      return;
    }
    if (data.session) {
      navigate({ to: "/onboarding" });
      return;
    }
    toast.success("Bijna klaar!", {
      description: "Bevestig je e-mailadres via de link die we je stuurden.",
    });
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Google inloggen mislukt");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/feed" });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <Link to="/" className="mb-6 flex items-center gap-2">
        <img src={waag} alt="Waag de pinguïn" width={1024} height={1024} className="size-10 object-contain" />
        <span className="text-2xl font-extrabold text-primary">Dare2Meet</span>
      </Link>

      <div className="surface w-full max-w-md p-6">
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Inloggen</TabsTrigger>
            <TabsTrigger value="signup">Registreren</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-5">
            <form onSubmit={signIn} className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="login-email">E-mailadres</Label>
                <Input
                  id="login-email"
                  type="email"
                  required
                  maxLength={255}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="login-password">Wachtwoord</Label>
                <Input
                  id="login-password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={busy}>
                Inloggen
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-5">
            <form onSubmit={signUp} className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="first-name">Voornaam</Label>
                <Input
                  id="first-name"
                  required
                  maxLength={60}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">E-mailadres</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  maxLength={255}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="password">Wachtwoord (min. 8 tekens)</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="grid gap-3 rounded-xl bg-muted p-4">
                <ConsentRow
                  id="terms"
                  checked={terms}
                  onChange={setTerms}
                  text="Ik ga akkoord met de Algemene Voorwaarden."
                />
                <ConsentRow
                  id="privacy"
                  checked={privacy}
                  onChange={setPrivacy}
                  text="Ik ga akkoord met het Privacybeleid (AVG)."
                />
                <ConsentRow
                  id="visibility"
                  checked={visibility}
                  onChange={setVisibility}
                  text="Mijn profiel mag zichtbaar zijn voor andere ingelogde leden."
                />
                <ConsentRow
                  id="law"
                  checked={law}
                  onChange={setLaw}
                  text="Bij ernstige overtredingen of misdrijven (bedreiging, intimidatie, oplichting) mogen relevante accountgegevens en logs gedeeld worden met officiële meldpunten en de politie."
                />
              </div>

              <Button type="submit" disabled={busy}>
                Ik waag de sprong!
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> of <span className="h-px flex-1 bg-border" />
        </div>
        <Button variant="outline" className="w-full" onClick={google}>
          Doorgaan met Google
        </Button>
      </div>
    </div>
  );
}

function ConsentRow({
  id,
  checked,
  onChange,
  text,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  text: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} className="mt-0.5" />
      <Label htmlFor={id} className="text-xs font-normal leading-snug text-muted-foreground">
        {text}
      </Label>
    </div>
  );
}

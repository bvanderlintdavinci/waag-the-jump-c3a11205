import { createFileRoute, Link } from "@tanstack/react-router";

import waag from "@/assets/waag-penguin.png";
import heroImage from "@/assets/iceberg-leap.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/verhaal")({
  head: () => ({
    meta: [
      { title: "Ons verhaal — Dare2Meet.nl" },
      {
        name: "description",
        content:
          "Waarom Dare2Meet bestaat: na een verhuizing, een gezin en een drukke baan is nieuwe mensen ontmoeten niet vanzelfsprekend meer.",
      },
      { property: "og:title", content: "Ons verhaal — Dare2Meet.nl" },
      {
        property: "og:description",
        content: "Een eerlijk, veilig en gratis initiatief om mensen samen dingen te laten ondernemen.",
      },
    ],
  }),
  component: Story,
});

function Story() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
        <Link to="/" className="flex items-center gap-2">
          <img src={waag} alt="Waag de pinguïn" width={1024} height={1024} className="size-8 object-contain" />
          <span className="text-lg font-extrabold text-primary">Dare2Meet</span>
        </Link>
        <Link to="/auth">
          <Button size="sm">Meedoen</Button>
        </Link>
      </header>

      <article className="mx-auto max-w-3xl px-4 pb-20">
        <h1 className="text-4xl font-extrabold leading-tight text-foreground">
          Waarom ik Dare2Meet begon
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Waggel uit je comfortzone, waag de sprong en ontmoet maatjes of een date.
        </p>

        <img
          src={heroImage}
          alt="Pinguïns op een ijsberg terwijl de eerste springt"
          loading="lazy"
          width={1536}
          height={1024}
          className="mt-8 w-full rounded-xl border border-border"
        />

        <div className="mt-8 space-y-5 text-base leading-relaxed text-foreground">
          <p>
            Na een verhuizing naar een nieuwe plaats, het stichten van een gezin en een drukke fulltime baan
            merkte ik iets wat veel mensen herkennen: spontaan nieuwe vrienden maken gaat niet meer vanzelf. En
            een partner ontmoeten al helemaal niet. Je agenda zit vol, je kent nog niemand in de straat, en de
            avonden gaan op aan opruimen en slapen.
          </p>
          <p>
            Tegelijkertijd zag ik overal mensen die precies hetzelfde wilden: even koffie, een rondje
            motorrijden, samen naar de dierenweide met de kids, of gewoon een eerste date zonder maandenlang
            zwiepen op een app.
          </p>
          <h2 className="pt-2 text-2xl font-extrabold">De missie</h2>
          <p>
            Dare2Meet is een eerlijk, veilig en gratis initiatief om mensen uit hun comfortzone te laten stappen
            en bij elkaar te brengen. Niet via eindeloos chatten op de bank, maar door samen dingen te
            ondernemen. Iemand moet als eerste van de ijsberg springen — de rest volgt vanzelf.
          </p>
          <h2 className="pt-2 text-2xl font-extrabold">Transparantie</h2>
          <p>
            Geen verplichte maandelijkse abonnementen, geen premium-accounts en geen verborgen kosten. Alle
            kernfuncties zijn en blijven 100% gratis voor iedereen. Wil je het platform steunen? Dan kun je
            vrijwillig een koffie doneren. Dat is alles.
          </p>
        </div>

        <div className="surface mt-10 flex flex-wrap items-center justify-between gap-4 p-6">
          <p className="text-base font-semibold text-foreground">Klaar om de sprong te wagen?</p>
          <Link to="/auth">
            <Button size="lg">Ik waag de sprong!</Button>
          </Link>
        </div>
      </article>
    </div>
  );
}

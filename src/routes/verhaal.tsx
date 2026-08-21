import { createFileRoute, Link } from "@tanstack/react-router";

import { Dare2MeetLogo } from "@/components/Dare2MeetLogo";
import heroImage from "@/assets/iceberg-leap.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/verhaal")({
  head: () => ({
    meta: [
      { title: "Het ontstaan van Dare2Meet | Dare2Meet.nl" },
      {
        name: "description",
        content:
          "Hoe Dare2Meet ontstond: een druk gezin, weinig vrije tijd en de wens om laagdrempelig en zonder verdienmodel nieuwe mensen te ontmoeten.",
      },
      { property: "og:title", content: "Het ontstaan van Dare2Meet" },
      {
        property: "og:description",
        content: "Een eerlijk en open platform om mensen ongedwongen samen dingen te laten ondernemen.",
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
          <Dare2MeetLogo className="size-8" />
          <span className="text-lg font-extrabold text-primary">Dare2Meet</span>
        </Link>
        <Link to="/auth">
          <Button size="sm">Meedoen</Button>
        </Link>
      </header>

      <article className="mx-auto max-w-3xl px-4 pb-20">
        <h1 className="text-4xl font-extrabold leading-tight text-foreground">Het ontstaan van Dare2Meet</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Waggel uit je comfortzone, waag de sprong en ontmoet nieuwe mensen of een date.
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
            Met een druk gezin vol school, sportclubjes, uitstapjes en alles wat daarbij komt kijken, vliegen
            mijn weken voorbij. Het vaderschap is de absoluut grootste en mooiste tijdsopslokker in mijn leven,
            en gecombineerd met een baan in het onderwijs, een eigen bedrijf en een woning waar altijd wel aan
            geklust moet worden, blijft er simpelweg weinig vrije tijd over. Juist door die drukte zie ik hoe
            waardevol, maar ook hoe lastig het kan zijn om op een laagdrempelige manier nieuwe contacten te
            leggen.
          </p>
          <p>
            Veel platforms beloven verbinding, maar vragen na registratie direct om een duur abonnement. De
            transparantie ontbreekt vaak, terwijl het verbinden van mensen volgens mij helemaal geen
            verdienmodel hoeft mee te brengen. Toegankelijk contact moet voor iedereen mogelijk zijn.
          </p>
          <p>
            Als enthousiaste maker bouw en sleutel ik graag aan technische projecten, en ik sta net zo graag in
            de keuken om wat goeds op tafel te zetten. Maar het mooiste is wanneer je energie inzet om iets
            waardevols te maken voor een ander. Dare2Meet is ontstaan vanuit die gedachte. Het is een eerlijk
            platform dat puur bedoeld is om een veilige en open plek te bieden waar mensen elkaar ongedwongen
            kunnen vinden, zonder abonnementen en zonder verborgen kosten.
          </p>
          <p>
            Of het nu gaat om een gezinsuitstapje naar de speeltuin, samen sporten, koken, een specifieke hobby
            delen of gewoon een goede kop koffie, het draait om de echte klik.
          </p>

          <h2 className="pt-2 text-2xl font-extrabold">De missie</h2>
          <p>
            Dare2Meet is een transparant initiatief om mensen uit hun dagelijkse bubbel te halen en bij elkaar
            te brengen. Niet via eindeloos swipen of verstopte kosten, maar door gewoon samen dingen te
            ondernemen. Iemand moet de eerste stap durven zetten, de rest volgt vanzelf.
          </p>
          <p>
            Wil je ons steunen? Dat mag vrijwillig met{" "}
            <a href="/api/public/doneer" className="font-semibold text-primary underline">
              een kop koffie
            </a>
            . Dat is alles.
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

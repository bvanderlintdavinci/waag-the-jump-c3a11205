import { createFileRoute, Link } from "@tanstack/react-router";
import { Baby, Bike, Camera, Coffee, Footprints, Gamepad2, Heart, Palette, UtensilsCrossed, Users } from "lucide-react";

import { Dare2MeetLogo } from "@/components/Dare2MeetLogo";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";

export const Route = createFileRoute("/ideeen")({
  head: () => ({
    meta: [
      { title: "Ideeën voor een eerste ontmoeting of uitje | Dare2Meet.nl" },
      {
        name: "description",
        content:
          "Meer dan vijftig ideeën voor een eerste ontmoeting, vriendschappelijk uitje of date: van koffie drinken tot samen wandelen, koken of een museum bezoeken.",
      },
      { property: "og:title", content: "Ideeën voor een eerste ontmoeting of uitje" },
      {
        property: "og:description",
        content: "Inspiratie voor een laagdrempelige eerste ontmoeting in jouw buurt.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://www.dare2meet.nl/ideeen" },
      { property: "og:image", content: "https://dare2meet.nl/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://dare2meet.nl/og-image.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.dare2meet.nl/ideeen" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Ideeën voor een eerste ontmoeting of uitje",
          description:
            "Inspiratie voor een laagdrempelige eerste ontmoeting: van koffie tot wandelen, koken of een museum.",
          inLanguage: "nl",
        }),
      },
    ],
  }),
  component: Ideas,
});

const CATEGORIES = [
  {
    icon: Coffee,
    title: "Laagdrempelig kennismaken",
    ideas: [
      "Koffie drinken in een druk café in het centrum",
      "Samen een ijsje halen en een rondje lopen",
      "Lunchen op een markt of in een eetcafé",
      "Een terrasje pakken en mensen kijken",
      "Samen naar een boekwinkel en elkaar een boektip geven",
      "Een kop thee in een theetuin of bij een kinderboerderij",
    ],
  },
  {
    icon: Footprints,
    title: "Actief naar buiten",
    ideas: [
      "Een wandeling door een park of natuurgebied in de buurt",
      "Een rondje fietsen met een koffiestop onderweg",
      "Samen een fotowandeling maken door de stad",
      "Een strandwandeling, in elk seizoen",
      "Geocaching: samen schatten zoeken in de buurt",
      "Een rondje hardlopen op een rustig tempo",
    ],
  },
  {
    icon: Palette,
    title: "Cultuur en creativiteit",
    ideas: [
      "Een museum of kunsthal bezoeken",
      "Naar een lokaal optreden, open mic of voorstelling",
      "Een schilder- of pottenbakworkshop volgen",
      "Samen naar een rommelmarkt of kunstmarkt",
      "Een film kijken en er daarna over napraten",
      "Een stadswandeling met een gids of audiotour",
    ],
  },
  {
    icon: UtensilsCrossed,
    title: "Eten en koken",
    ideas: [
      "Samen koken: ieder brengt een ingrediënt mee",
      "Een foodmarket of foodtruckfestival bezoeken",
      "Een nieuw restaurant uitproberen dat jullie allebei nog niet kennen",
      "Samen bakken: taart, brood of koekjes",
      "Een picknick in het park met zelfgemaakte hapjes",
      "Een proeverij: koffie, thee, kaas of bier uit de streek",
    ],
  },
  {
    icon: Gamepad2,
    title: "Spel en ontspanning",
    ideas: [
      "Een bordspel spelen in een spelletjescafé",
      "Samen bowlen, midgetgolfen of poolen",
      "Een pubquiz in een lokaal café",
      "Naar een arcade- of speelhal",
      "Een escaperoom met een groepje",
      "Samen een puzzel of LEGO-project doen",
    ],
  },
  {
    icon: Baby,
    title: "Met kinderen",
    ideas: [
      "Samen naar de speeltuin of kinderboerderij",
      "Een kabouterpad of speurtocht in het bos",
      "Samen zwemmen in een zwembad of recreatieplas",
      "Een bezoek aan de dierentuin of een boerderij",
      "Pannenkoeken eten met de kids",
      "Een knutselmiddag bij iemand thuis of in een buurthuis",
    ],
  },
  {
    icon: Heart,
    title: "Voor een eerste date",
    ideas: [
      "Koffie in een café waar je makkelijk weer weg kunt",
      "Een wandeling met een duidelijk begin- en eindpunt",
      "Samen iets actiefs doen, zoals midgetgolf: het breekt het ijs",
      "Een markt of braderie bezoeken: altijd gespreksstof",
      "Een museum: je hebt meteen iets om over te praten",
      "Houd de eerste date kort: een uur is lang genoeg om te voelen of er een tweede komt",
    ],
  },
  {
    icon: Users,
    title: "Met een groepje",
    ideas: [
      "Een gezamenlijke wandeling met meerdere leden uit de buurt",
      "Een spelletjesavond in een buurthuis of café",
      "Samen vrijwilligerswerk doen voor een lokaal goed doel",
      "Een gezamenlijke barbecue of picknick in het park",
      "Met een groepje naar een lokaal evenement of festival",
      "Een opruimwandeling: samen de buurt mooier maken",
    ],
  },
];

function Ideas() {
  return (
    <div className="min-h-screen bg-background">
      <header data-google-query-build="false" className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
        <Link to="/" className="flex items-center gap-2">
          <Dare2MeetLogo className="size-8" />
          <span className="text-lg font-extrabold text-primary">Dare2Meet</span>
        </Link>
        <Link to="/auth" search={{ tab: "signup" }}>
          <Button size="sm">Meedoen</Button>
        </Link>
      </header>

      <article className="mx-auto max-w-3xl px-4 pb-20">
        <p className="eyebrow">Inspiratie</p>
        <h1 className="mt-2 text-4xl font-extrabold leading-tight text-foreground">
          Ideeën voor een eerste ontmoeting of uitje
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Geen inspiratie voor je eerste Waagje of date? Hier vind je tientallen ideeën, van laagdrempelig koffie
          drinken tot actief naar buiten. Kies iets dat bij jullie past en spreek af op een openbare plek.
        </p>

        <div className="mt-10 grid gap-6">
          {CATEGORIES.map((category) => (
            <section key={category.title} className="surface rounded-[1.5rem] p-6">
              <div className="flex items-center gap-3">
                <span className="gradient-primary inline-flex size-10 items-center justify-center rounded-xl">
                  <category.icon className="size-5" />
                </span>
                <h2 className="text-xl font-bold text-foreground">{category.title}</h2>
              </div>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-sm leading-relaxed text-muted-foreground">
                {category.ideas.map((idea) => (
                  <li key={idea}>{idea}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-[1.5rem] bg-mint p-6">
          <h2 className="text-xl font-bold text-mint-foreground">Zet je idee op Dare2Meet</h2>
          <p className="mt-2 text-sm leading-relaxed text-mint-foreground/80">
            Heb je een leuk idee? Plaats een Waagje en nodig mensen uit je buurt uit. Met een gratis basisaccount
            plaats je twee Waagjes per maand; reageren op anderen is altijd kosteloos.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/auth" search={{ tab: "signup" }}>
              <Button className="cta-glow">Plaats een Waagje</Button>
            </Link>
            <Link to="/veilig-afspreken">
              <Button variant="outline">Tips voor veilig afspreken</Button>
            </Link>
          </div>
        </section>

        <AdSpace className="mt-8" />

        <p className="mt-8 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Bike className="size-3.5" /> <Camera className="size-3.5" /> Van wandelen tot fotograferen: er is altijd
          iets dat bij jou past.
        </p>
      </article>
    </div>
  );
}

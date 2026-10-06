import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Coffee, MapPin, MessageCircle, ShieldCheck, Users } from "lucide-react";

import { Dare2MeetLogo } from "@/components/Dare2MeetLogo";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";

export const Route = createFileRoute("/veilig-afspreken")({
  head: () => ({
    meta: [
      { title: "Veilig afspreken met nieuwe mensen | Dare2Meet.nl" },
      {
        name: "description",
        content:
          "Praktische tips om veilig af te spreken met mensen die je online hebt leren kennen: van de eerste chat tot de eerste ontmoeting.",
      },
      { property: "og:title", content: "Veilig afspreken met nieuwe mensen" },
      {
        property: "og:description",
        content: "Praktische tips voor een veilige eerste ontmoeting via Dare2Meet.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://www.dare2meet.nl/veilig-afspreken" },
      { property: "og:image", content: "https://dare2meet.nl/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://dare2meet.nl/og-image.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.dare2meet.nl/veilig-afspreken" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Veilig afspreken met nieuwe mensen",
          description:
            "Praktische tips om veilig af te spreken met mensen die je online hebt leren kennen.",
          inLanguage: "nl",
        }),
      },
    ],
  }),
  component: SafetyGuide,
});

const SECTIONS = [
  {
    icon: MessageCircle,
    title: "Leer elkaar eerst kennen via de chat",
    points: [
      "Chat eerst een tijdje via Dare2Meet voordat je afspreekt. Zo krijg je een gevoel bij de ander.",
      "Je hoeft je telefoonnummer niet te delen. Dat kan later altijd nog, als je dat zelf wilt.",
      "Vraag gerust door: wat zoekt iemand, waarom wil die mee? Echte mensen vinden dat normaal.",
      "Voelt iets raar of te opdringerig? Dan hoef je niet af te spreken. Je bent niemand een uitleg verschuldigd.",
    ],
  },
  {
    icon: MapPin,
    title: "Spreek af op een openbare plek",
    points: [
      "Kies voor de eerste ontmoeting een drukke, openbare plek: een café, een park, een markt of een evenement.",
      "Spreek overdag af of in de vroege avond, op een plek die je kent of makkelijk kunt bereiken.",
      "Ga niet meteen mee naar iemands huis en nodig niemand bij jou thuis uit bij een eerste ontmoeting.",
      "Regel je eigen vervoer heen en terug, zodat je altijd zelf weg kunt wanneer jij dat wilt.",
    ],
  },
  {
    icon: Users,
    title: "Laat iemand weten waar je bent",
    points: [
      "Vertel een vriend of familielid met wie je afspreekt, waar en hoe laat.",
      "Spreek af dat je even een berichtje stuurt als het goed gaat.",
      "Deel eventueel je live locatie met iemand die je vertrouwt.",
      "Bij een groepsuitje via Dare2Meet ben je nooit alleen: er zijn altijd meerdere deelnemers.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Vertrouw op je gevoel",
    points: [
      "Voelt het niet goed? Dan mag je altijd afzeggen of eerder weggaan. Dat is niet onbeleefd, dat is verstandig.",
      "Geef nooit geld, bankgegevens of cadeaukaarten aan iemand die je via internet kent.",
      "Wees terughoudend met persoonlijke gegevens zoals je exacte adres of werkplek in het begin.",
      "Echte leden van Dare2Meet respecteren een 'nee' en dringen nooit iets op.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Herken waarschuwingssignalen",
    points: [
      "Iemand die heel snel heel intiem of emotioneel wordt, of direct om geld vraagt.",
      "Iemand die het gesprek meteen buiten de site wil verplaatsen en weigert eerst via de chat te praten.",
      "Verhalen die niet kloppen of steeds veranderen.",
      "Druk om af te spreken op een afgelegen plek of bij iemand thuis.",
    ],
  },
];

function SafetyGuide() {
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
        <p className="eyebrow">Gids</p>
        <h1 className="mt-2 text-4xl font-extrabold leading-tight text-foreground">
          Veilig afspreken met nieuwe mensen
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Nieuwe mensen ontmoeten is leuk en spannend tegelijk. Met een paar simpele gewoontes maak je het ook veilig.
          Deze gids helpt je van de eerste chat tot de eerste ontmoeting.
        </p>

        <div className="mt-10 grid gap-6">
          {SECTIONS.map((section) => (
            <section key={section.title} className="surface rounded-[1.5rem] p-6">
              <div className="flex items-center gap-3">
                <span className="gradient-primary inline-flex size-10 items-center justify-center rounded-xl">
                  <section.icon className="size-5" />
                </span>
                <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
              </div>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-sm leading-relaxed text-muted-foreground">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-[1.5rem] border border-destructive/30 bg-destructive/5 p-6">
          <h2 className="text-xl font-bold text-foreground">Ongewenst gedrag? Meld het</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Maakt iemand zich schuldig aan ongewenst gedrag, intimidatie of oplichting? Meld het via de meldknop op
            het profiel of in de chat. De beheerder kijkt elke melding na en kan accounts blokkeren.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Bij bedreiging, afpersing of ander strafbaar gedrag kun je ook de politie bellen via{" "}
            <strong className="text-foreground">0900-8844</strong> of aangifte doen via{" "}
            <a href="https://www.politie.nl/aangifte-of-melding-doen" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
              politie.nl
            </a>
            . Bij acute dreiging bel je <strong className="text-foreground">112</strong>.
          </p>
        </section>

        <AdSpace className="mt-8" />

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link to="/ideeen">
            <Button variant="outline">Lees ook: ideeën voor een eerste ontmoeting</Button>
          </Link>
          <Link to="/auth" search={{ tab: "signup" }}>
            <Button className="cta-glow">Maak een gratis account</Button>
          </Link>
        </div>

        <p className="mt-8 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Coffee className="size-3.5" /> Dare2Meet is een particulier initiatief, van mensen voor mensen.
        </p>
      </article>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookies en lokale opslag | Dare2Meet.nl" },
      {
        name: "description",
        content:
          "Dare2Meet gebruikt alleen functionele opslag om je ingelogd te houden. Geen trackers, geen advertentiecookies.",
      },
      { property: "og:title", content: "Cookies en lokale opslag | Dare2Meet.nl" },
      { property: "og:description", content: "Alleen functionele opslag, geen tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Cookies,
});

function Cookies() {
  return (
    <LegalPage
      title="Cookies en lokale opslag"
      intro="Kort samengevat: we plaatsen geen tracking- of advertentiecookies. Alleen wat nodig is om de site te laten werken."
    >
      <h2>Wat we opslaan</h2>
      <ul>
        <li>Inlogsessie: je sessietoken staat in de lokale opslag van je browser zodat je ingelogd blijft.</li>
        <li>Voorkeuren: of je deze cookiemelding hebt gelezen, en kleine weergavekeuzes zoals gekozen filters.</li>
      </ul>

      <h2>Wat we niet doen</h2>
      <p>
        Geen Google Analytics, geen advertentiepixels, geen profilering voor derden en geen doorverkoop van
        gegevens. Daarom is een toestemmingsbanner met keuzeknoppen niet verplicht: functionele opslag valt
        onder de uitzondering in de Telecommunicatiewet.
      </p>

      <h2>Externe diensten</h2>
      <p>
        Bij het inloggen met Google verloopt de authenticatie via Google. Daarbij gelden ook de voorwaarden van
        Google. Bij een donatie word je doorgestuurd naar PayPal; die transactie verloopt volledig bij PayPal en
        wij ontvangen geen betaalgegevens.
      </p>

      <h2>Zelf wissen</h2>
      <p>
        Je verwijdert de opslag door in je browser de sitegegevens van dare2meet.nl te wissen. Je wordt dan
        uitgelogd, verder blijft je account gewoon bestaan.
      </p>

      <h2>Als dit verandert</h2>
      <p>
        Voegen we ooit statistieken of andere niet-functionele technieken toe, dan vragen we vooraf om je
        toestemming via een keuzevenster en passen we deze pagina aan.
      </p>
    </LegalPage>
  );
}

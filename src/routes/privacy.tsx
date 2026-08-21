import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacybeleid | Dare2Meet.nl" },
      {
        name: "description",
        content:
          "Welke gegevens Dare2Meet verwerkt, waarom, hoe lang we ze bewaren en welke rechten je hebt onder de AVG.",
      },
      { property: "og:title", content: "Privacybeleid | Dare2Meet.nl" },
      { property: "og:description", content: "Transparant over welke gegevens we verwerken en waarom." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalPage
      title="Privacybeleid"
      intro="Dare2Meet verwerkt zo min mogelijk gegevens, alleen om je te laten vinden en ontmoeten. Hieronder lees je precies wat we bewaren en waarom."
    >
      <h2>Wie is verantwoordelijk</h2>
      <p>
        Dare2Meet.nl is een particulier initiatief en is de verwerkingsverantwoordelijke voor de gegevens die
        je op het platform achterlaat. Je kunt contact opnemen via het contactformulier op de site (de knop
        "Idee of advies voor de website").
      </p>

      <h2>Welke gegevens verwerken we</h2>
      <ul>
        <li>Accountgegevens: e-mailadres en wachtwoord (versleuteld opgeslagen door onze inlogdienst).</li>
        <li>Profielgegevens: voornaam, geboortedatum, woonplaats of postcode, globale coördinaten, korte tekst over jezelf, interesses, profielfoto en waar je voor openstaat (vriendschap, dating of beide).</li>
        <li>Activiteiten: uitjes die je plaatst of waar je je voor aanmeldt.</li>
        <li>Berichten: de inhoud van je 1 op 1 gesprekken en groepschats.</li>
        <li>Veiligheid en moderatie: blokkades met reden, meldingen, en logregels van de woordenfilter.</li>
        <li>Profielbezoeken: wie jouw profiel bekeek en wanneer.</li>
        <li>Technische gegevens: minimale logbestanden van onze hostingpartij om misbruik te voorkomen.</li>
      </ul>

      <h2>Waarom en op welke grondslag</h2>
      <ul>
        <li>Uitvoering van de overeenkomst: je account, je profiel, de agenda en de chats.</li>
        <li>Toestemming: het tonen van je profiel aan andere ingelogde leden, een eventuele LHBTIQ+ vermelding en je locatie.</li>
        <li>Gerechtvaardigd belang: veiligheid, moderatie en het voorkomen van misbruik.</li>
        <li>Wettelijke plicht: het delen van gegevens met politie of officiële meldpunten bij ernstige overtredingen.</li>
      </ul>

      <h2>Hoe lang bewaren we het</h2>
      <p>
        Je gegevens blijven staan zolang je account bestaat. Vraag je verwijdering aan, dan wordt je profiel
        direct onzichtbaar en na 30 dagen definitief verwijderd. Moderatie- en meldingslogs bewaren we maximaal
        twaalf maanden, omdat we anders herhaald misbruik niet kunnen aanpakken.
      </p>

      <h2>Wie ziet je gegevens</h2>
      <p>
        Andere ingelogde leden zien je profiel, je uitjes en de berichten die je aan hen stuurt. Verder werken
        we met verwerkers voor hosting, database, opslag van foto's en e-mail. Zij verwerken gegevens alleen in
        onze opdracht en binnen de Europese Unie, tenzij er passende waarborgen gelden. We verkopen nooit
        gegevens en gebruiken geen advertentienetwerken.
      </p>

      <h2>Je rechten</h2>
      <ul>
        <li>Inzage in de gegevens die we van je hebben.</li>
        <li>Correctie: je profiel pas je zelf aan bij Account.</li>
        <li>Verwijdering: via Account vraag je verwijdering aan (30 dagen bedenktijd).</li>
        <li>Dataportabiliteit: bij Account download je al je gegevens als bestand.</li>
        <li>Bezwaar en beperking van de verwerking, en het intrekken van toestemming.</li>
        <li>Klacht indienen bij de Autoriteit Persoonsgegevens.</li>
      </ul>

      <h2>Beveiliging</h2>
      <p>
        Alle verbindingen verlopen versleuteld. Toegang tot gegevens is per gebruiker afgeschermd op
        databaseniveau, foto's staan in een afgeschermde opslag en beheerders zien alleen wat nodig is voor
        moderatie.
      </p>
    </LegalPage>
  );
}

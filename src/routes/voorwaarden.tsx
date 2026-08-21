import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/voorwaarden")({
  head: () => ({
    meta: [
      { title: "Algemene voorwaarden | Dare2Meet.nl" },
      {
        name: "description",
        content:
          "De spelregels van Dare2Meet: wie mee mag doen, wat we van elkaar verwachten en wat er gebeurt bij misbruik.",
      },
      { property: "og:title", content: "Algemene voorwaarden | Dare2Meet.nl" },
      { property: "og:description", content: "Duidelijke spelregels voor een veilig en open platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <LegalPage
      title="Algemene voorwaarden"
      intro="Door een account aan te maken ga je akkoord met deze spelregels. Ze zijn er om het voor iedereen prettig en veilig te houden."
    >
      <h2>1. Deelname</h2>
      <ul>
        <li>Je bent 18 jaar of ouder en maakt één account op eigen naam aan.</li>
        <li>Je gebruikt een herkenbare, recente foto van jezelf en geen foto's van anderen of van internet.</li>
        <li>Je gegevens zijn juist; nepprofielen worden verwijderd.</li>
      </ul>

      <h2>2. Gedrag</h2>
      <ul>
        <li>Geen intimidatie, discriminatie, bedreiging, haatzaaien, spam of commerciële werving.</li>
        <li>Geen seksueel expliciet materiaal en geen ongevraagde intieme berichten of foto's.</li>
        <li>Geen oplichting, geen verzoeken om geld en geen doorverwijzing naar betaalde diensten.</li>
        <li>Respecteer een nee, en respecteer een blokkade.</li>
      </ul>

      <h2>3. Uitjes plaatsen</h2>
      <p>
        Je mag maximaal twee uitjes per kalendermaand plaatsen. Een uitje is echt en uitvoerbaar, en je bent
        zelf verantwoordelijk voor de organisatie, eventuele kosten en de veiligheid van de locatie.
      </p>

      <h2>4. Kosten</h2>
      <p>
        Een basisaccount is gratis en er zijn geen abonnementen of verborgen kosten. Sommige extra functies
        kunnen eenmalig te ontgrendelen zijn; dat staat altijd vooraf duidelijk vermeld. Doneren mag vrijwillig
        en geeft geen extra rechten.
      </p>

      <h2>5. Moderatie</h2>
      <p>
        Berichten en profielteksten gaan door een automatische woordenfilter. Bij een melding of een ernstige
        overtreding kunnen we een profiel tijdelijk onzichtbaar maken, functies beperken of het account
        verwijderen. Bij strafbare feiten kunnen relevante gegevens en logs gedeeld worden met de politie of
        officiële meldpunten.
      </p>

      <h2>6. Jouw inhoud</h2>
      <p>
        Je blijft eigenaar van je teksten en foto's. Je geeft ons alleen het recht om ze binnen het platform te
        tonen aan andere leden, zolang je account bestaat.
      </p>

      <h2>7. Beëindigen</h2>
      <p>
        Je kunt op elk moment stoppen via Account. Je profiel wordt direct onzichtbaar en na 30 dagen definitief
        verwijderd. Wij kunnen een account beëindigen bij herhaalde of ernstige schending van deze voorwaarden.
      </p>

      <h2>8. Wijzigingen en recht</h2>
      <p>
        We kunnen deze voorwaarden aanpassen; belangrijke wijzigingen melden we in de app. Op deze voorwaarden
        is Nederlands recht van toepassing.
      </p>
    </LegalPage>
  );
}

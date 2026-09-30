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
      { property: "og:url", content: "https://www.dare2meet.nl/voorwaarden" },
      { property: "og:image", content: "https://dare2meet.nl/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://dare2meet.nl/og-image.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.dare2meet.nl/voorwaarden" }],
  }),
  component: Terms,
});

function Terms() {
  return (
    <LegalPage
      title="Algemene voorwaarden"
      intro="Door een account aan te maken ga je akkoord met deze spelregels. Ze zijn er om het voor iedereen prettig en veilig te houden."
    >
      <h2>Over Dare2Meet: van mensen, voor mensen</h2>
      <p>
        Dare2Meet is een open, particulier initiatief zonder commercieel doel, ontstaan om mensen bij elkaar in
        de buurt te laten ontmoeten. Het wordt vrijwillig en naar beste kunnen beheerd door een privépersoon, niet
        door een bedrijf met personeel of een klantenservice. De site wordt aangeboden zoals hij is ("as is"),
        zonder garanties over beschikbaarheid, juistheid of geschiktheid voor een bepaald doel. Alle profielen zijn
        van echte leden; de beheerder maakt geen nepprofielen aan.
      </p>

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
        Een basisaccount is kosteloos te gebruiken en er zijn geen abonnementen of verborgen kosten. Met een
        basisaccount plaats je maximaal twee Waagjes per kalendermaand; reageren op anderen en chatten is
        onbeperkt en kosteloos. Bepaalde premiumfuncties zijn tegen een eenmalige vergoeding beschikbaar om de
        server- en onderhoudskosten te dekken; dat staat altijd vooraf duidelijk vermeld. Doneren mag vrijwillig
        en geeft geen extra rechten.
      </p>
      <p>
        <strong>Premium "Wie bekeek mijn profiel?"</strong> kost eenmalig € 2,99 en toont de laatste 5 bezoekers
        van je profiel op het moment van aankoop. Een nieuwe aankoop is alleen mogelijk als er sinds je vorige
        momentopname nieuwe bezoekers zijn. Omdat de inhoud direct na betaling wordt geleverd, vragen we je vooraf
        uitdrukkelijk af te zien van je herroepingsrecht (bedenktijd van 14 dagen); zonder die bevestiging kun je
        niet afrekenen. Wordt een betaling terugbetaald of betwist, dan vervalt de bijbehorende momentopname.
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

      <h2>8. Aansprakelijkheid</h2>
      <p>
        Dare2Meet is alleen een platform dat leden met elkaar in contact brengt. De beheerder organiseert geen
        uitjes of dates, controleert leden niet vooraf en is geen partij bij afspraken tussen leden. Je neemt
        volledig op eigen risico en verantwoordelijkheid deel aan contact en ontmoetingen.
      </p>
      <p>
        Voor zover de wet dat toestaat, is de beheerder niet aansprakelijk voor schade, letsel, verlies of
        geschillen die voortkomen uit het gebruik van het platform, uit gedrag of uitingen van andere leden, uit
        ontmoetingen, uit onjuiste informatie van leden of derden, of uit storingen en onderbrekingen van de site.
        Mocht er toch aansprakelijkheid bestaan, dan is die beperkt tot het bedrag dat je in de twaalf maanden
        daarvoor aan Dare2Meet hebt betaald. Deze beperking geldt niet bij opzet of bewuste roekeloosheid.
      </p>

      <h2>Eigen verantwoordelijkheid van leden</h2>
      <ul>
        <li>Je bepaalt zelf met wie je contact hebt en of, waar en wanneer je iemand ontmoet.</li>
        <li>Je controleert zelf de identiteit en betrouwbaarheid van anderen; de beheerder doet dat niet.</li>
        <li>Strafbare feiten meld je bij de politie (112 bij nood, anders 0900-8844); meld het daarnaast via de site.</li>
        <li>De beheerder is niet verantwoordelijk voor kosten, reizen, tickets of eigendommen rond een uitje.</li>
        <li>Buiten de macht van de beheerder (overmacht), zoals storingen bij hosting of betaalpartners, geeft geen recht op vergoeding.</li>
      </ul>

      <h2>9. Vrijwaring</h2>
      <p>
        Je vrijwaart de beheerder van Dare2Meet voor aanspraken van derden, inclusief redelijke kosten, die
        ontstaan doordat jij deze voorwaarden of de wet overtreedt, of door wat jij plaatst, verstuurt of doet
        tijdens een ontmoeting.
      </p>

      <h2>10. Wijzigingen en recht</h2>
      <p>
        We kunnen deze voorwaarden aanpassen; belangrijke wijzigingen melden we in de app. Op deze voorwaarden
        is Nederlands recht van toepassing.
      </p>
    </LegalPage>
  );
}

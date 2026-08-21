import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer | Dare2Meet.nl" },
      {
        name: "description",
        content:
          "Dare2Meet brengt mensen samen maar organiseert de ontmoetingen niet zelf. Lees hier waar de verantwoordelijkheid ligt.",
      },
      { property: "og:title", content: "Disclaimer | Dare2Meet.nl" },
      { property: "og:description", content: "Waar de verantwoordelijkheid ligt bij ontmoetingen via Dare2Meet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Disclaimer,
});

function Disclaimer() {
  return (
    <LegalPage
      title="Disclaimer"
      intro="Dare2Meet is een ontmoetingsplek, geen organisator. Wat je met elkaar afspreekt, doe je op eigen initiatief."
    >
      <h2>Ontmoetingen</h2>
      <p>
        Uitjes en afspraken worden door leden zelf geplaatst en georganiseerd. Dare2Meet controleert leden niet
        vooraf, doet geen achtergrondonderzoek en is geen partij bij wat jullie afspreken. Deelname is op eigen
        risico en verantwoordelijkheid.
      </p>

      <h2>Veilig afspreken</h2>
      <ul>
        <li>Spreek de eerste keer af op een openbare plek.</li>
        <li>Laat iemand weten waar je bent en hoe laat je terug bent.</li>
        <li>Regel je eigen vervoer en deel je adres niet meteen.</li>
        <li>Voelt iets niet goed? Stop en gebruik de meld- of blokkeerknop.</li>
      </ul>

      <h2>Inhoud van derden</h2>
      <p>
        Profielteksten, foto's en beschrijvingen van uitjes komen van leden zelf. We modereren, maar kunnen niet
        garanderen dat alles juist, actueel of volledig is. Zie je iets dat niet klopt of niet hoort, meld het
        dan; we handelen meldingen zo snel mogelijk af.
      </p>

      <h2>Beschikbaarheid</h2>
      <p>
        We doen ons best om de site werkend te houden, maar kunnen geen ononderbroken beschikbaarheid of
        foutloze werking garanderen.
      </p>

      <h2>Aansprakelijkheid</h2>
      <p>
        Voor zover wettelijk toegestaan zijn wij niet aansprakelijk voor schade die voortkomt uit het gebruik
        van het platform, uit gedrag van andere leden of uit ontmoetingen die via Dare2Meet tot stand kwamen.
        Deze beperking geldt niet bij opzet of bewuste roekeloosheid van onze kant.
      </p>

      <h2>Rechten</h2>
      <p>
        De naam Dare2Meet, het pinguïnlogo, de teksten en de illustraties op deze site zijn eigendom van
        Dare2Meet.nl. Overnemen mag niet zonder toestemming. Denk je dat materiaal op de site jouw rechten
        schendt? Meld het en we verwijderen of vervangen het.
      </p>
    </LegalPage>
  );
}

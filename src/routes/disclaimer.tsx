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
      { property: "og:url", content: "https://www.dare2meet.nl/disclaimer" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.dare2meet.nl/disclaimer" }],
  }),
  component: Disclaimer,
});

function Disclaimer() {
  return (
    <LegalPage
      title="Disclaimer"
      intro="Dare2Meet is een ontmoetingsplek, geen organisator. Wat je met elkaar afspreekt, doe je op eigen initiatief."
    >
      <h2>Dienstverlening</h2>
      <p>
        Dare2Meet is uitsluitend een faciliterend platform dat mensen bij elkaar brengt. Dare2Meet organiseert zelf
        geen bijeenkomsten en is op geen enkele wijze partij bij onderlinge afspraken tussen gebruikers.
      </p>

      <h2>Uitsluiting van aansprakelijkheid</h2>
      <p>
        De beheerder of eigenaar van Dare2Meet kan op geen enkele wijze aansprakelijk worden gesteld voor directe of
        indirecte schade, letsel, geschillen, verlies of ongemak voortvloeiend uit onderling contact, afspraken of
        ontmoetingen tussen gebruikers, zowel online als offline.
      </p>

      <h2>Eigen verantwoordelijkheid</h2>
      <p>Deelnemers nemen volledig op eigen risico deel aan uitjes, dates en ontmoetingen.</p>

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

      <h2>Auteursrecht en intellectueel eigendom</h2>
      <p>
        De naam Dare2Meet, het pinguïnlogo, de vormgeving, de teksten, de illustraties, de foto's en de
        software van deze site zijn beschermd door auteursrecht, databankrecht en merkrecht en berusten bij
        Dare2Meet.nl of bij haar licentiegevers. Overnemen, kopiëren, verveelvoudigen, bewerken, publiceren of
        commercieel hergebruiken mag alleen met voorafgaande schriftelijke toestemming.
      </p>
      <p>
        Toegestaan zonder toestemming: een enkele kopie voor strikt persoonlijk gebruik, en een gewone
        hyperlink naar een pagina op deze site. Niet toegestaan: geautomatiseerd verzamelen van gegevens
        (scrapen), het aanleggen van kopieën van onze databank, het hergebruiken van profielgegevens of
        foto's van leden, en het tonen van onze site in een frame onder een andere naam.
      </p>

      <h2>Jouw eigen materiaal</h2>
      <p>
        Wat je zelf plaatst blijft van jou. Door te plaatsen geef je Dare2Meet een niet-exclusief, kosteloos en
        intrekbaar recht om jouw tekst en foto's binnen het platform te tonen aan andere leden, zolang je
        account bestaat. Je verklaart dat je zelf de rechten hebt op wat je plaatst: geen foto's van internet,
        geen foto's van anderen zonder hun toestemming, en geen muziek, logo's of teksten van derden.
      </p>

      <h2>Materiaal van derden en bronvermelding</h2>
      <p>
        Onze agenda bevat ook activiteiten die afkomstig zijn van openbare uitagenda's en websites van
        organisatoren. Die informatie blijft eigendom van de oorspronkelijke bron, wordt uitsluitend
        verwijzend weergegeven en kan afwijken of verouderd zijn. Controleer datum, tijd en prijs altijd bij de
        organisator zelf. Ben je rechthebbende en wil je niet dat jouw agenda-informatie of afbeelding hier
        verschijnt? Meld het en we verwijderen het.
      </p>

      <h2>Melding van inbreuk (notice and takedown)</h2>
      <p>
        Zie je materiaal op Dare2Meet dat jouw auteursrecht, portretrecht, merkrecht of privacy schendt? Meld
        het via de knop "Idee of advies" op de site en vermeld: om welke pagina of welk bericht het gaat,
        waarom het inbreuk maakt en op grond waarvan jij rechthebbende bent. We beoordelen elke melding en
        verwijderen of blokkeren onrechtmatig materiaal zo snel als redelijkerwijs mogelijk is, doorgaans
        binnen enkele werkdagen.
      </p>

      <h2>Portretrecht</h2>
      <p>
        Sta je herkenbaar op een foto die een ander plaatste en wil je dat niet? Dan verwijderen we die foto op
        jouw verzoek. Maak zelf ook geen foto's van andere leden en deel geen screenshots van profielen of
        gesprekken buiten het platform.
      </p>

      <h2>Privacy en gegevensbescherming</h2>
      <p>
        Dare2Meet verwerkt persoonsgegevens volgens de AVG. Welke gegevens we verwerken, waarom, hoe lang en
        welke rechten je hebt (inzage, correctie, verwijdering, overdraagbaarheid, bezwaar en klacht bij de
        Autoriteit Persoonsgegevens) staat in het privacybeleid. Gegevens van andere leden gebruik je alleen
        binnen het platform: niet kopiëren, niet bewaren, niet doorsturen en nooit gebruiken voor reclame,
        werving of onderzoek.
      </p>

      <h2>Cookies</h2>
      <p>
        We gebruiken alleen functionele opslag om je ingelogd te houden. Geen trackers en geen
        advertentiecookies. Details staan in de cookieverklaring.
      </p>

      <h2>Links naar andere websites</h2>
      <p>
        Deze site bevat links naar websites van derden, bijvoorbeeld van organisatoren of een donatiedienst.
        Wij hebben geen zeggenschap over die sites en zijn niet verantwoordelijk voor hun inhoud, hun
        beschikbaarheid of hun privacybeleid.
      </p>

      <h2>Geen advies</h2>
      <p>
        Informatie op deze site is algemeen van aard en is geen juridisch, medisch, financieel of
        veiligheidsadvies. Aan de inhoud kunnen geen rechten worden ontleend.
      </p>

      <h2>Wijzigingen en toepasselijk recht</h2>
      <p>
        We kunnen deze disclaimer aanpassen; de actuele versie staat altijd op deze pagina. Op het gebruik van
        Dare2Meet is Nederlands recht van toepassing. Geschillen leggen we voor aan de bevoegde Nederlandse
        rechter, onverminderd je rechten als consument.
      </p>
    </LegalPage>
  );
}

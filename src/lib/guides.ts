export type GuideSection = { title: string; paragraphs: string[]; tips?: string[] };
export type Guide = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  readMinutes: number;
  sections: GuideSection[];
};

export const GUIDES: Guide[] = [
  {
    slug: "vrienden-maken-als-volwassene",
    title: "Nieuwe vrienden maken als volwassene: zo pak je het aan",
    description:
      "Waarom vrienden maken na je dertigste lastiger voelt, en zeven praktische manieren om in je eigen buurt nieuwe vriendschappen op te bouwen.",
    intro:
      "Op school en tijdens je studie kwamen vriendschappen bijna vanzelf. Je zag elke dag dezelfde mensen, had tijd en deelde dezelfde dingen. Daarna verandert dat. Werk, verhuizen, een relatie of kinderen zorgen ervoor dat je vriendenkring kleiner wordt. Dat is heel normaal, maar je kunt er wel iets aan doen. In deze gids lees je hoe.",
    readMinutes: 6,
    sections: [
      {
        title: "Waarom het lastiger voelt dan vroeger",
        paragraphs: [
          "Onderzoekers noemen drie dingen die vriendschap laten groeien: je ziet elkaar vaak, het gebeurt zonder planning en je voelt je veilig genoeg om open te zijn. Als volwassene ontbreken die drie dingen vaak. Je agenda zit vol en elke afspraak moet worden gepland.",
          "Daar komt bij dat veel mensen denken dat iedereen al genoeg vrienden heeft. In werkelijkheid zegt een groot deel van de Nederlanders zich weleens eenzaam te voelen. De kans is dus groot dat de persoon naast je in de rij bij de bakker óók openstaat voor een nieuw contact.",
        ],
      },
      {
        title: "Kies terugkerende activiteiten",
        paragraphs: [
          "Eén keer ergens heen gaan levert zelden een vriendschap op. Het werkt beter om iets regelmatig te doen met dezelfde groep: een wandelclub, een kookcursus, een vaste pubquiz of een buurtmoestuin. Na drie of vier keer ken je gezichten en wordt een praatje vanzelf makkelijker.",
        ],
        tips: [
          "Kies iets wat je zelf echt leuk vindt, dan hou je het vol.",
          "Ga minstens vier keer voordat je beslist of het iets voor je is.",
          "Kom iets eerder of blijf iets langer: daar ontstaan de gesprekken.",
        ],
      },
      {
        title: "Neem zelf het eerste kleine initiatief",
        paragraphs: [
          "De meeste mensen wachten tot de ander iets voorstelt. Wie zelf een kleine stap zet, maakt het verschil. Dat hoeft niet groot te zijn. ‘Ik ga zaterdag naar de markt, zin om mee te lopen?’ is genoeg.",
          "Een afwijzing gaat bijna nooit over jou. Mensen hebben het druk of zijn verlegen. Probeer het later gewoon nog een keer, of met iemand anders.",
        ],
      },
      {
        title: "Gebruik je eigen buurt",
        paragraphs: [
          "Vriendschappen houden het langst stand als je dicht bij elkaar woont. Dan kun je makkelijk even koffie drinken zonder dat het een hele onderneming wordt. Daarom werkt Dare2Meet met afstand: je ziet uitjes en mensen binnen jouw straal, zodat een nieuw contact ook na de eerste keer haalbaar blijft.",
        ],
      },
      {
        title: "Geef het tijd",
        paragraphs: [
          "Een vriendschap groeit niet na één avond. Vaak zijn er tientallen uren samen nodig voordat iemand van kennis naar vriend gaat. Zie elke ontmoeting als een kleine stap. Plan na een leuk uitje meteen een volgende afspraak, dan blijft het contact warm.",
        ],
        tips: [
          "Stuur na een ontmoeting een kort berichtje: ‘Leuk was het, tot de volgende keer!’",
          "Onthoud kleine dingen die de ander vertelde en vraag er later naar.",
          "Wees niet bang om iets vaker voor te stellen. Regelmaat bouwt vertrouwen.",
        ],
      },
      {
        title: "Wees jezelf, ook online",
        paragraphs: [
          "Een eerlijk profiel trekt mensen aan die echt bij je passen. Vertel wat je graag doet, wat je zoekt en wat je liever niet wilt. Een echte foto en een paar zinnen over je hobby’s maken het voor een ander veel makkelijker om je aan te spreken.",
        ],
      },
    ],
  },
  {
    slug: "eerste-date-tips",
    title: "Eerste date: tips voor een ontspannen kennismaking",
    description:
      "Van de keuze van de plek tot het afronden: praktische en eerlijke tips voor een eerste date die voor beide partijen prettig voelt.",
    intro:
      "Een eerste date is spannend. Je wilt een goede indruk maken, maar vooral ontdekken of er een klik is. Met een goede voorbereiding houd je de spanning leuk in plaats van stressvol. Deze tips zijn gebaseerd op wat mensen zelf het prettigst vinden bij een eerste ontmoeting.",
    readMinutes: 5,
    sections: [
      {
        title: "Houd het kort en laagdrempelig",
        paragraphs: [
          "Plan voor de eerste keer iets van ongeveer een uur. Koffie drinken, een wandeling of een kort bezoek aan een markt werkt goed. Is het leuk, dan kun je altijd langer blijven. Valt het tegen, dan is er een natuurlijk einde.",
          "Een diner van drie gangen of een hele dag uit legt veel druk op een eerste kennismaking. Bewaar dat voor later.",
        ],
      },
      {
        title: "Kies een openbare plek met wat afleiding",
        paragraphs: [
          "Een plek waar iets te zien of te doen is, helpt bij stiltes. Denk aan een museum, een park met een terras of een rondje langs een kunstroute. Je hebt dan meteen gespreksstof. Zorg dat het een openbare plek is en regel je eigen vervoer.",
        ],
        tips: [
          "Wandelen naast elkaar voelt voor veel mensen minder spannend dan tegenover elkaar zitten.",
          "Kies een plek die jullie allebei makkelijk kunnen bereiken.",
        ],
      },
      {
        title: "Goede gespreksonderwerpen",
        paragraphs: [
          "Stel open vragen die uitnodigen om te vertellen. Niet ‘Wat voor werk doe je?’, maar ‘Waar word je op je werk blij van?’. Vraag naar een recente reis, een hobby, een favoriete plek in de stad of iets wat iemand graag nog eens wil leren.",
          "Luister echt en vraag door. Mensen onthouden vooral hoe ze zich voelden in het gesprek, niet wat je precies zei.",
        ],
        tips: [
          "Vermijd op de eerste date een uitgebreid gesprek over je ex.",
          "Politiek en geld kunnen, maar houd het luchtig.",
          "Telefoon weg: dat is het grootste compliment dat je kunt geven.",
        ],
      },
      {
        title: "Wees eerlijk over wat je zoekt",
        paragraphs: [
          "Zoek je iets serieus, of wil je eerst rustig kennismaken? Het is fijn als je dat allebei weet. Op Dare2Meet kun je je intentie al in je profiel aangeven, zodat dit gesprek minder ongemakkelijk wordt.",
        ],
      },
      {
        title: "Afronden zonder ongemak",
        paragraphs: [
          "Was het leuk? Zeg dat dan gewoon: ‘Ik vond het gezellig, zullen we nog eens afspreken?’. Voelde het niet goed, dan is ‘Bedankt voor de leuke middag, ik voelde niet echt een klik’ eerlijk en vriendelijk. Niemand hoeft zich te verplichten tot een tweede afspraak.",
          "Laat na afloop een vriend of familielid even weten dat je veilig thuis bent als je dat had afgesproken.",
        ],
      },
    ],
  },
  {
    slug: "alleen-naar-een-evenement",
    title: "Alleen naar een evenement gaan: zo wordt het leuk",
    description:
      "Alleen naar een concert, markt of workshop? Zo bereid je je voor, maak je makkelijk contact en geniet je er ook echt van.",
    intro:
      "Veel mensen laten leuke evenementen schieten omdat niemand mee kan. Zonde, want alleen gaan heeft juist voordelen: je bent flexibeler en mensen spreken je sneller aan. Met een paar trucs voelt het ook minder spannend.",
    readMinutes: 4,
    sections: [
      {
        title: "Kies een evenement dat bij je past",
        paragraphs: [
          "Activiteiten met een duidelijke bezigheid zijn ideaal om alleen naartoe te gaan: een workshop, een rondleiding, een sportieve les of een pubquiz. Je hebt meteen iets om over te praten en je staat nooit ‘zomaar’ ergens.",
        ],
      },
      {
        title: "Bereid je een beetje voor",
        paragraphs: [
          "Kijk van tevoren hoe laat het begint, waar je kunt parkeren of welke bus je neemt. Bedenk één of twee openingszinnen, zoals ‘Ben je hier al eens eerder geweest?’ of ‘Weet jij hoe laat het optreden begint?’. Dat maakt de eerste stap kleiner.",
        ],
        tips: [
          "Kom op tijd: het begin is het moment waarop mensen nog open staan voor een praatje.",
          "Ga bij de bar, de garderobe of de koffietafel staan: daar ontstaan gesprekken vanzelf.",
        ],
      },
      {
        title: "Ga samen met iemand die ook alleen gaat",
        paragraphs: [
          "Op Dare2Meet kun je je aanmelden voor uitjes in je buurt en zien dat er anderen meegaan. Je kunt vooraf al even chatten en bijvoorbeeld bij de ingang afspreken. Dan loop je niet in je eentje naar binnen en heb je meteen gezelschap.",
        ],
      },
      {
        title: "Geniet ook van je eigen tijd",
        paragraphs: [
          "Je hoeft niet de hele avond met mensen te praten. Even alleen genieten van de muziek of de sfeer is prima. Spreek met jezelf af dat je minstens één nieuw gesprek begint, en zie de rest als bonus.",
        ],
      },
      {
        title: "Veiligheid bij alleen uitgaan",
        paragraphs: [
          "Laat iemand weten waar je bent en hoe laat je ongeveer thuis bent. Houd je drankje in de gaten en regel je terugreis vooraf. Voelt een situatie niet goed, ga dan weg. Meer tips lees je in onze gids over veilig afspreken.",
        ],
      },
    ],
  },
  {
    slug: "eenzaamheid-doorbreken",
    title: "Eenzaamheid doorbreken: kleine stappen die echt helpen",
    description:
      "Eenzaamheid komt vaker voor dan je denkt. Lees wat het is, waarom het niet je eigen schuld is en welke kleine stappen je kunt zetten.",
    intro:
      "Je eenzaam voelen betekent niet dat er iets mis met je is. Het betekent dat je behoefte aan contact op dit moment niet vervuld wordt. Dat overkomt veel mensen, bijvoorbeeld na een verhuizing, een scheiding, pensioen of het verlies van iemand. Deze gids geeft je kleine, haalbare stappen.",
    readMinutes: 5,
    sections: [
      {
        title: "Je bent niet de enige",
        paragraphs: [
          "Uit landelijk onderzoek blijkt al jaren dat een groot deel van de volwassenen in Nederland zich weleens eenzaam voelt, in alle leeftijdsgroepen. Jongvolwassenen en ouderen geven het het vaakst aan. Het is dus geen teken van zwakte, maar iets heel menselijks.",
        ],
      },
      {
        title: "Begin klein",
        paragraphs: [
          "Je hoeft niet meteen een nieuwe vriendengroep te vinden. Begin met kleine contactmomenten: een praatje met een buurman, een groet in de supermarkt, een berichtje aan een oude bekende. Zulke korte momenten hebben al een merkbaar positief effect op hoe je je voelt.",
        ],
        tips: [
          "Stuur deze week één bericht aan iemand van wie je lang niets hoorde.",
          "Kies één activiteit per week buiten de deur, hoe klein ook.",
          "Ga naar een plek waar je vaker komt, zodat mensen je gaan herkennen.",
        ],
      },
      {
        title: "Doe iets voor een ander",
        paragraphs: [
          "Vrijwilligerswerk is een van de beste manieren om nieuwe mensen te leren kennen. Je werkt samen aan iets, hebt meteen iets gemeenschappelijks en voelt je nuttig. Denk aan een voedselbank, een buurthuis, een sportclub of een natuurorganisatie.",
        ],
      },
      {
        title: "Gebruik een buddy",
        paragraphs: [
          "Op Dare2Meet kun je aangeven dat je een buddy zoekt: iemand om samen mee naar een activiteit te gaan. Zo hoef je de eerste stap niet alleen te zetten. Je kiest zelf wat je deelt en met wie je afspreekt.",
        ],
      },
      {
        title: "Praat erover als het zwaar wordt",
        paragraphs: [
          "Houdt het eenzame gevoel lang aan of word je er somber van, praat er dan over met iemand die je vertrouwt of met je huisarts. Je kunt ook anoniem en gratis praten met de Luisterlijn via 088-0767000 of luisterlijn.nl, dag en nacht bereikbaar. Denk je aan zelfdoding, bel dan 113 of 0800-0113.",
        ],
      },
    ],
  },
];

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug);
}

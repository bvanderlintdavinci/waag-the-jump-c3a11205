import festivalImg from "@/assets/event-festival.jpg";
import coffeeImg from "@/assets/event-coffee.jpg";
import musicImg from "@/assets/event-music.jpg";
import motorImg from "@/assets/event-motor.jpg";
import natureImg from "@/assets/event-nature.jpg";
import socialImg from "@/assets/event-social.jpg";
import beachImg from "@/assets/event-beach.jpg";
import foodImg from "@/assets/event-food.jpg";
import sportImg from "@/assets/event-sport.jpg";
import familyImg from "@/assets/event-family.jpg";
import marketImg from "@/assets/event-market.jpg";
import craftImg from "@/assets/event-craft.jpg";
import tastingImg from "@/assets/event-tasting.jpg";
import shoppingImg from "@/assets/event-shopping.jpg";
import pancakeImg from "@/assets/event-pancake.jpg";
import squashImg from "@/assets/event-squash.jpg";
import swimImg from "@/assets/event-swim.jpg";
import citytripImg from "@/assets/event-citytrip.jpg";
import playgroundImg from "@/assets/event-playground.jpg";
import cinemaImg from "@/assets/event-cinema.jpg";
import gamesImg from "@/assets/event-games.jpg";
import danceImg from "@/assets/event-dance.jpg";
import dogwalkImg from "@/assets/event-dogwalk.jpg";
import bowlingImg from "@/assets/event-bowling.jpg";
import runningImg from "@/assets/event-running.jpg";
import picnicImg from "@/assets/event-picnic.jpg";
import booksImg from "@/assets/event-books.jpg";
import winterImg from "@/assets/event-winter.jpg";
import volunteerImg from "@/assets/event-volunteer.jpg";
import cyclingImg from "@/assets/event-cycling.jpg";
import yogaImg from "@/assets/event-yoga.jpg";
import gardeningImg from "@/assets/event-gardening.jpg";
import museumImg from "@/assets/event-museum.jpg";
import cookingImg from "@/assets/event-cooking.jpg";
import outdoorMarketImg from "@/assets/event-outdoor-market.jpg";
import antiqueBooksMarketImg from "@/assets/event-antique-books-market.jpg";
import vinylMarketImg from "@/assets/event-vinyl-market.jpg";
import theatreCabaretImg from "@/assets/event-theatre-cabaret.jpg";
import foodtruckMarketImg from "@/assets/event-foodtruck-market.jpg";
import cityTourImg from "@/assets/event-city-tour.jpg";
import fleaMarketImg from "@/assets/event-flea-market.jpg";
import expoFairImg from "@/assets/event-expo-fair.jpg";
import scienceImg from "@/assets/event-science.jpg";
import animalsImg from "@/assets/event-animals.jpg";

/** Alle beschikbare sfeerbeelden, gedeeld door de agenda en het plaatsformulier. */
export const ACTIVITY_IMAGES: Record<string, string> = {
  festival: festivalImg,
  coffee: coffeeImg,
  music: musicImg,
  motor: motorImg,
  nature: natureImg,
  social: socialImg,
  beach: beachImg,
  food: foodImg,
  sport: sportImg,
  family: familyImg,
  market: marketImg,
  craft: craftImg,
  tasting: tastingImg,
  shopping: shoppingImg,
  pancake: pancakeImg,
  squash: squashImg,
  swim: swimImg,
  citytrip: citytripImg,
  playground: playgroundImg,
  cinema: cinemaImg,
  games: gamesImg,
  dance: danceImg,
  dogwalk: dogwalkImg,
  bowling: bowlingImg,
  running: runningImg,
  picnic: picnicImg,
  books: booksImg,
  winter: winterImg,
  volunteer: volunteerImg,
  cycling: cyclingImg,
  yoga: yogaImg,
  gardening: gardeningImg,
  museum: museumImg,
  cooking: cookingImg,
  "outdoor-market": outdoorMarketImg,
  "antique-books-market": antiqueBooksMarketImg,
  "vinyl-market": vinylMarketImg,
  "theatre-cabaret": theatreCabaretImg,
  "foodtruck-market": foodtruckMarketImg,
  "city-tour": cityTourImg,
  "flea-market": fleaMarketImg,
  "expo-fair": expoFairImg,
  science: scienceImg,
  animals: animalsImg,
};

export type ActivityTemplate = {
  key: string;
  label: string;
  image: string;
  category: string;
  title: string;
  description: string;
  locationHint: string;
  kidsFriendly: boolean;
};

/** Startpunten die de gebruiker daarna helemaal zelf invult. */
export const ACTIVITY_TEMPLATES: ActivityTemplate[] = [
  {
    key: "market",
    label: "Naar de markt",
    image: marketImg,
    category: "Eten & Koken",
    title: "Samen naar de markt",
    description: "Rondje over de markt, verse dingen scoren en daarna koffie op een terrasje.",
    locationHint: "Welke markt en welk plein?",
    kidsFriendly: true,
  },
  {
    key: "squash",
    label: "Squashen",
    image: squashImg,
    category: "Sport & Bewegen",
    title: "Squashen, niveau maakt niet uit",
    description: "Baan gereserveerd, we wisselen elk kwartier. Rackets zijn meestal te huur.",
    locationHint: "Welke sporthal of squashcentrum?",
    kidsFriendly: false,
  },
  {
    key: "swim",
    label: "Zwemmen",
    image: swimImg,
    category: "Sport & Bewegen",
    title: "Zwemmen in het recreatiebad",
    description: "Baantjes trekken of lekker glijbaan, daarna samen wat drinken.",
    locationHint: "Welk zwembad?",
    kidsFriendly: true,
  },
  {
    key: "citytrip",
    label: "Citytrip",
    image: citytripImg,
    category: "Muziek & Cultuur",
    title: "Dagje citytrip",
    description: "Met de trein een dagje op pad, slenteren, lunchen en terug voor het donker.",
    locationHint: "Vanaf welk station en naar welke stad?",
    kidsFriendly: true,
  },
  {
    key: "playground",
    label: "Speeltuin",
    image: playgroundImg,
    category: "Gezin & Kinderen",
    title: "Speeltuin en koffie voor de ouders",
    description: "De kinderen spelen, wij kletsen bij met een koffie erbij.",
    locationHint: "Welke speeltuin of welk park?",
    kidsFriendly: true,
  },
  {
    key: "coffee",
    label: "Koffie of borrel",
    image: coffeeImg,
    category: "Koffie & Borrel",
    title: "Koffie drinken en kennismaken",
    description: "Gewoon een uurtje koffie, geen verplichtingen, wel echte gesprekken.",
    locationHint: "Welk café of welke plek?",
    kidsFriendly: true,
  },
  {
    key: "nature",
    label: "Wandelen",
    image: natureImg,
    category: "Wandelen & Natuur",
    title: "Rondje wandelen in de natuur",
    description: "Stevig doorstappen of juist rustig aan, we passen ons aan elkaar aan.",
    locationHint: "Welk bos, park of startpunt?",
    kidsFriendly: true,
  },
  {
    key: "shopping",
    label: "Shoppen",
    image: shoppingImg,
    category: "Overig",
    title: "Samen shoppen in de stad",
    description: "Winkelen, etalages kijken en tussendoor iets eten.",
    locationHint: "Welke winkelstraat of welk centrum?",
    kidsFriendly: true,
  },
  {
    key: "food",
    label: "Uit eten of koken",
    image: foodImg,
    category: "Eten & Koken",
    title: "Samen eten",
    description: "Uit eten of samen koken, iedereen betaalt het eigen deel.",
    locationHint: "Welk restaurant of bij wie thuis?",
    kidsFriendly: true,
  },
  {
    key: "pancake",
    label: "Pannenkoekenhuis",
    image: pancakeImg,
    category: "Gezin & Kinderen",
    title: "Pannenkoeken eten met de kinderen",
    description: "Grote tafel, veel stroop en genoeg ruimte om te spelen.",
    locationHint: "Welk pannenkoekenhuis?",
    kidsFriendly: true,
  },
  {
    key: "motor",
    label: "Motorrijden",
    image: motorImg,
    category: "Motorrijden",
    title: "Rondje rijden",
    description: "Mooie route, koffiestop halverwege, rustig tempo.",
    locationHint: "Waar verzamelen we?",
    kidsFriendly: false,
  },
  {
    key: "music",
    label: "Muziek of cultuur",
    image: musicImg,
    category: "Muziek & Cultuur",
    title: "Samen naar muziek of museum",
    description: "Kaartjes regelt iedereen zelf, we gaan samen heen en terug.",
    locationHint: "Welke zaal, welk museum?",
    kidsFriendly: true,
  },
  {
    key: "sport",
    label: "Sporten",
    image: sportImg,
    category: "Sport & Bewegen",
    title: "Samen sporten",
    description: "Padel, hardlopen of fitness, plezier boven prestatie.",
    locationHint: "Welke club of welk park?",
    kidsFriendly: false,
  },
  {
    key: "beach",
    label: "Strand",
    image: beachImg,
    category: "Wandelen & Natuur",
    title: "Dagje strand",
    description: "Wandelen langs de vloedlijn en daarna iets drinken bij een strandtent.",
    locationHint: "Welk strand of welke opgang?",
    kidsFriendly: true,
  },
  {
    key: "tasting",
    label: "Proeverij",
    image: tastingImg,
    category: "Eten & Koken",
    title: "Proeverij avond",
    description: "Whisky, wijn of speciaalbier proeven, rustig en gezellig.",
    locationHint: "Welke locatie?",
    kidsFriendly: false,
  },
  {
    key: "craft",
    label: "Klussen of creatief",
    image: craftImg,
    category: "Klussen & Creatief",
    title: "Samen klussen of knutselen",
    description: "Iets maken, repareren of creatief bezig zijn met elkaar.",
    locationHint: "Waar komen we samen?",
    kidsFriendly: true,
  },
  {
    key: "social",
    label: "Iets anders",
    image: socialImg,
    category: "Overig",
    title: "",
    description: "",
    locationHint: "Waar spreken we af?",
    kidsFriendly: true,
  },
];

/** Trefwoorden per sfeerbeeld, gebruikt om events zonder eigen beeld te verdelen. */
const IMAGE_KEYWORDS: Array<[string, string[]]> = [
  ["flea-market", ["vlooienmarkt", "curiosamarkt", "curiosabeurs", "rommelmarkt", "snuffelmarkt"]],
  ["antique-books-market", ["antiek- en boekenmarkt", "antiek en boekenmarkt", "boekenmarkt", "antiekmarkt", "boekenbeurs"]],
  ["vinyl-market", ["vinylmarkt", "platenmarkt", "platenbeurs", "vinylbeurs"]],
  ["foodtruck-market", ["foodtruck", "food truck", "culinaire markt", "foodfestival", "food festival"]],
  ["theatre-cabaret", ["cabaret", "stand-up", "stand up", "comedy", "toneel", "theatervoorstelling"]],
  ["city-tour", ["stadswandeling", "stadsrondleiding", "city tour", "wandeltour", "architectuurwandeling"]],
  ["outdoor-market", ["weekmarkt", "buitenmarkt", "braderie", "jaarmarkt", "streekmarkt", "warenmarkt"]],
  ["cinema", ["filmfestival", "film festival", "filmavond", "filmvertoning", "cinekid"]],
  ["science", ["science week", "wetenschapsfestival", "wetenschap", "techniekfestival", "sterrenkijk", "planetarium"]],
  ["animals", ["dierendag", "dierenmarkt", "dierenfestival", "hondenshow", "paardenshow", "boerderijdag", "schaapskudde"]],
  ["running", ["marathon", "halve marathon", "hardloopevenement", "singelloop", "city run", "trailrun"]],
  ["craft", ["ambachtsmarkt", "ambachtsroute", "kunstroute", "atelierroute", "open atelier", "handwerkmarkt"]],
  ["tasting", ["bierroute", "wijnroute", "bockbier", "speciaalbier", "bierfestival", "wijnfestival"]],
  ["family", ["kinderactiviteit", "kinderfestival", "familiedag", "familiefestival", "voor kinderen"]],
  ["expo-fair", ["woonbeurs", "vakbeurs", "publieksbeurs", "consumentenbeurs", "expo", "expositiehal"]],
  ["festival", ["festival", "kermis", "feest", "carnaval", "dance"]],
  ["music", ["muziek", "concert", "band", "koor", "orkest", "dj", "theater", "podium"]],
  ["market", ["markt", "fair", "marktkraam"]],
  ["cooking", ["kookworkshop", "kookles", "samen koken", "keukenworkshop"]],
  ["food", ["eten", "food", "diner", "restaurant", "kook", "bbq", "barbecue", "lunch"]],
  ["tasting", ["proeverij", "wijn", "bier", "whisky", "whiskey", "borrel", "tasting"]],
  ["coffee", ["koffie", "café", "cafe", "thee", "high tea", "ontbijt"]],
  ["museum", ["museum", "kunsthal", "galerie", "tentoonstelling", "expositie", "kunst bekijken"]],
  ["craft", ["creatief", "knutselen", "handwerk", "klus", "atelier", "maakworkshop"]],
  ["cinema", ["film", "bioscoop", "cinema", "movie", "première"]],
  ["games", ["spel", "spelletjes", "bordspel", "quiz", "kaarten", "darten", "game"]],
  ["dance", ["dans", "salsa", "stijldans", "disco", "bal"]],
  ["dogwalk", ["hond", "baas", "uitlaten", "hondenveld"]],
  ["bowling", ["bowl", "kegel", "biljart", "poolen"]],
  ["running", ["hardlopen", "hardloop", "rondje rennen", "rennen", "jogging", "trimloop"]],
  ["picnic", ["picknick", "picknicken", "kleedje"]],
  ["books", ["boek", "lezen", "leesclub", "bibliotheek", "schrijf", "poëzie"]],
  ["winter", ["schaats", "ijsbaan", "winter", "sneeuw", "kerst", "glühwein"]],
  ["volunteer", ["vrijwillig", "opruim", "buurt", "helpen", "goede doel", "zwerfafval"]],
  ["gardening", ["tuinieren", "moestuin", "buurttuin", "planten", "groenonderhoud"]],
  ["cycling", ["fietsen", "fietsrit", "fietstocht", "wielrennen", "e-bike"]],
  ["nature", ["natuur", "wandeling", "wandelen", "bos", "park", "wandeltocht"]],
  ["beach", ["strand", "zee", "duin", "kust"]],
  ["yoga", ["yoga", "pilates", "meditatie", "stretching"]],
  ["sport", ["sport", "voetbal", "fitness", "tennis"]],
  ["swim", ["zwem", "zwembad", "sauna", "water"]],
  ["squash", ["squash", "padel", "badminton"]],
  ["motor", ["motor", "auto", "oldtimer", "rit", "toer"]],
  ["family", ["gezin", "kinderen", "familie", "kids", "jeugd"]],
  ["playground", ["speeltuin", "speel", "kinderboerderij"]],
  ["pancake", ["pannenkoek", "poffertjes"]],
  ["shopping", ["shop", "winkel", "koopavond", "mode"]],
  ["citytrip", ["stad", "citytrip", "rondleiding", "tour", "historisch", "wetenschap"]],
];

/**
 * Kiest eerst op specifieke inhoud en gebruikt daarna pas de handmatige keuze.
 * Zonder betrouwbare match tonen we bewust een neutraal sociaal beeld.
 */
export function pickImageKey(input: {
  imageKey?: string | null;
  category?: string | null;
  title?: string | null;
  id?: string | null;
}): string {
  const haystack = `${input.category ?? ""} ${input.title ?? ""}`.toLocaleLowerCase("nl-NL");
  for (const [image, words] of IMAGE_KEYWORDS) {
    if (words.some((word) => containsTerm(haystack, word))) return image;
  }

  const key = input.imageKey ?? "";
  if (key && key !== "social" && ACTIVITY_IMAGES[key]) return key;
  return "social";
}

function containsTerm(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`, "iu").test(text);
}

function validSourceImage(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export type ActivityImageInput = {
  imageKey?: string | null;
  imageUrl?: string | null;
  source?: string | null;
  category?: string | null;
  title?: string | null;
  description?: string | null;
  id?: string | null;
};

/** Eén betrouwbare fotokeuze voor alle agenda-, plaats- en detailweergaven. */
export function resolveActivityImage(input: ActivityImageInput): { src: string; fallbackSrc: string } {
  const localKey = pickImageKey({
    imageKey: input.imageKey,
    category: input.category,
    title: `${input.title ?? ""} ${input.description ?? ""}`,
    id: input.id,
  });
  const fallbackSrc = ACTIVITY_IMAGES[localKey] ?? ACTIVITY_IMAGES.social;
  const sourceImage = input.source ? validSourceImage(input.imageUrl) : null;
  return { src: sourceImage ?? fallbackSrc, fallbackSrc };
}

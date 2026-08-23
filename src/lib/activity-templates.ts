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

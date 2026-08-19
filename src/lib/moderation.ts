// Nederlandse content-filter: ernstige ziekten/scheldwoorden en bedreigingen.
// Wordt gebruikt op alle vrije invoervelden (titels, omschrijvingen, bio, chat).

const DISEASE_SLURS = [
  "kanker",
  "kankerlijer",
  "kankerhoer",
  "tyfus",
  "tering",
  "teringlijer",
  "pleuris",
  "cholera",
  "pokke",
  "hoer",
  "hoerenzoon",
  "slet",
  "sletje",
  "kut",
  "kutwijf",
  "flikker",
  "homo(?=\\s*(lul|kut))",
  "mongool",
  "spast",
  "spastisch",
  "debiel",
  "achterlijke",
  "vieze\\s+jood",
  "neger",
];

const THREATS = [
  "doodmaken",
  "dood\\s*maken",
  "vermoorden",
  "afmaken",
  "kelen",
  "wurgen",
  "neersteken",
  "steken",
  "snijden",
  "in\\s*elkaar\\s*slaan",
  "verkrachten",
  "aanranden",
  "pijn\\s*doen",
  "kapot\\s*maken",
  "opzoeken\\s*en\\s*pakken",
  "ik\\s*weet\\s*waar\\s*je\\s*woont",
  "bedreig",
  "molesteren",
  "kinderporno",
  "oplichten",
];

const PATTERNS: { term: string; regex: RegExp }[] = [...DISEASE_SLURS, ...THREATS].map((term) => ({
  term: term.replace(/\\s\*|\\s\+/g, " ").replace(/[()?=]/g, ""),
  regex: new RegExp(`(^|[^a-z0-9])${term}`, "i"),
}));

export type ModerationResult = { ok: boolean; matches: string[] };

export function checkText(input: string): ModerationResult {
  const normalized = (input ?? "")
    .toLowerCase()
    .replace(/[0@]/g, (c) => (c === "0" ? "o" : "a"))
    .replace(/[^\p{L}\p{N}\s]/gu, " ");
  const matches = PATTERNS.filter((p) => p.regex.test(normalized)).map((p) => p.term);
  return { ok: matches.length === 0, matches: [...new Set(matches)] };
}

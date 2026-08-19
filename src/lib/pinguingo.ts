export const CATEGORIES = [
  "Gezin & Kinderen",
  "Motorrijden",
  "Sport & Bewegen",
  "Koffie & Borrel",
  "Wandelen & Natuur",
  "Muziek & Cultuur",
  "Gamen & Tech",
  "Eten & Koken",
  "Klussen & Creatief",
  "Overig",
] as const;

export const GENDERS = ["Man", "Vrouw", "Non-binair", "Anders / Zeg ik liever niet"] as const;

export const INTENTS = [
  { value: "friendship", label: "Vriendschap & Maatjes" },
  { value: "dating", label: "Dating & Partner zoeken" },
  { value: "both", label: "Beide / Ik zie wel wat er ontstaat" },
] as const;

export const BLOCK_REASONS = [
  "Ongepast gedrag",
  "Intimidatie of bedreiging",
  "Oplichting of spam",
  "Nepprofiel",
  "Geen interesse",
] as const;

export const REPORT_REASONS = [
  "Ongepaste inhoud",
  "Intimidatie of bedreiging",
  "Oplichting of spam",
  "Nepprofiel",
  "Anders",
] as const;

export const RADIUS_OPTIONS = [5, 10, 25, 50, 100] as const;

export function intentLabel(value: string): string {
  return INTENTS.find((i) => i.value === value)?.label ?? value;
}

import type { Tables } from "@/integrations/supabase/types";

export type MessageRow = Tables<"messages">;

export type MeetupStatus = "pending" | "accepted" | "declined" | "rescheduled";

export interface MeetupPayload {
  type: string;
  location: string;
  proposed_at: string | null;
  proposed_by: string;
  status: MeetupStatus;
  responded_by?: string;
  responded_at?: string;
}

export const MEETUP_TYPES = ["Koffie drinken", "Wandelen", "Borrelen", "Lunchen", "Museum bezoeken"];

export function readMeetup(m: Pick<MessageRow, "kind" | "meetup">): MeetupPayload | null {
  if (m.kind !== "meetup" || !m.meetup || typeof m.meetup !== "object" || Array.isArray(m.meetup)) return null;
  return m.meetup as unknown as MeetupPayload;
}

const SENSITIVE_PATTERNS: { label: string; re: RegExp }[] = [
  { label: "telefoonnummer", re: /(\+31|0031|\b0)[\s-]?6?[\s-]?(\d[\s-]?){8}\b/ },
  { label: "e-mailadres", re: /[\w.+-]+@[\w-]+\.[\w.]{2,}/ },
  { label: "bankrekening", re: /\bNL\d{2}\s?[A-Z]{4}(\s?\d){10}\b/i },
  { label: "adres", re: /\b[1-9]\d{3}\s?[A-Z]{2}\b/ },
  { label: "wachtwoord of code", re: /\b(wachtwoord|password|pincode|inlogcode|bsn)\b/i },
];

/** Geeft de soorten gevoelige gegevens terug die in de tekst lijken voor te komen. */
export function detectSensitive(text: string): string[] {
  return SENSITIVE_PATTERNS.filter((p) => p.re.test(text)).map((p) => p.label);
}

const ICEBREAKERS: Record<string, string> = {
  wandelen: "Wat is jouw favoriete wandelroute hier in de buurt?",
  koken: "Wat is het lekkerste gerecht dat jij kunt maken?",
  muziek: "Welk concert of welke band zou je nog eens live willen zien?",
  sport: "Welke sport doe je het liefst, en hoe ben je ermee begonnen?",
  film: "Welke film kun je eindeloos opnieuw kijken?",
  lezen: "Welk boek heeft jou het meest geraakt?",
  reizen: "Wat is de mooiste plek waar je ooit bent geweest?",
  koffie: "Waar drink je in jouw stad de beste koffie?",
  fietsen: "Heb je een favoriete fietsroute?",
  dansen: "Welke dansstijl zou je nog eens willen leren?",
  natuur: "Bos, strand of heide: waar laad jij het best op?",
  spelletjes: "Welk bord- of kaartspel win jij altijd?",
};

const GENERIC = [
  "Wat zou jij graag eens samen ondernemen in de buurt?",
  "Waar word jij op een vrije zondag blij van?",
  "Wat staat er nog op jouw lijstje om dit jaar te doen?",
];

export function buildIcebreakers(shared: string[]): string[] {
  const out: string[] = [];
  for (const i of shared) {
    const key = Object.keys(ICEBREAKERS).find((k) => i.toLowerCase().includes(k));
    out.push(key && ICEBREAKERS[key] ? ICEBREAKERS[key] : `Jullie houden allebei van ${i.toLowerCase()}. Hoe ben jij daarmee begonnen?`);
    if (out.length === 3) return out;
  }
  for (const g of GENERIC) {
    if (out.length === 3) break;
    out.push(g);
  }
  return out;
}

export function sharedInterests(a: string[] | null | undefined, b: string[] | null | undefined): string[] {
  const set = new Set((a ?? []).map((x) => x.toLowerCase()));
  return (b ?? []).filter((x) => set.has(x.toLowerCase()));
}

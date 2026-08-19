export type Place = { name: string; lat: number; lng: number };

// Compacte set Nederlandse plaatsen voor het bepalen van het middelpunt van een zoekopdracht.
export const PLACES: Place[] = [
  { name: "Amsterdam", lat: 52.3676, lng: 4.9041 },
  { name: "Rotterdam", lat: 51.9244, lng: 4.4777 },
  { name: "Den Haag", lat: 52.0705, lng: 4.3007 },
  { name: "Utrecht", lat: 52.0907, lng: 5.1214 },
  { name: "Eindhoven", lat: 51.4416, lng: 5.4697 },
  { name: "Groningen", lat: 53.2194, lng: 6.5665 },
  { name: "Tilburg", lat: 51.5555, lng: 5.0913 },
  { name: "Almere", lat: 52.3508, lng: 5.2647 },
  { name: "Breda", lat: 51.5719, lng: 4.7683 },
  { name: "Nijmegen", lat: 51.8126, lng: 5.8372 },
  { name: "Apeldoorn", lat: 52.2112, lng: 5.9699 },
  { name: "Haarlem", lat: 52.3874, lng: 4.6462 },
  { name: "Arnhem", lat: 51.9851, lng: 5.8987 },
  { name: "Enschede", lat: 52.2215, lng: 6.8937 },
  { name: "Amersfoort", lat: 52.1561, lng: 5.3878 },
  { name: "Zaanstad", lat: 52.4531, lng: 4.8134 },
  { name: "Zwolle", lat: 52.5168, lng: 6.0830 },
  { name: "Leiden", lat: 52.1601, lng: 4.4970 },
  { name: "Maastricht", lat: 50.8514, lng: 5.6910 },
  { name: "Dordrecht", lat: 51.8133, lng: 4.6901 },
  { name: "Ede", lat: 52.0402, lng: 5.6649 },
  { name: "Alphen aan den Rijn", lat: 52.1290, lng: 4.6553 },
  { name: "Alkmaar", lat: 52.6324, lng: 4.7534 },
  { name: "Emmen", lat: 52.7792, lng: 6.9069 },
  { name: "Delft", lat: 52.0116, lng: 4.3571 },
  { name: "Venlo", lat: 51.3704, lng: 6.1724 },
  { name: "Deventer", lat: 52.2661, lng: 6.1552 },
  { name: "Leeuwarden", lat: 53.2012, lng: 5.7999 },
  { name: "Helmond", lat: 51.4793, lng: 5.6570 },
  { name: "Hilversum", lat: 52.2292, lng: 5.1669 },
  { name: "Assen", lat: 52.9925, lng: 6.5649 },
  { name: "Middelburg", lat: 51.4988, lng: 3.6136 },
  { name: "Lelystad", lat: 52.5185, lng: 5.4714 },
  { name: "Roermond", lat: 51.1942, lng: 5.9873 },
  { name: "Hoorn", lat: 52.6425, lng: 5.0597 },
  { name: "Gouda", lat: 52.0116, lng: 4.7106 },
];

// Grove postcode -> coördinaten benadering op basis van het eerste cijfer.
const POSTCODE_ZONES: Record<string, { lat: number; lng: number }> = {
  "1": { lat: 52.37, lng: 4.9 },
  "2": { lat: 52.09, lng: 4.4 },
  "3": { lat: 51.95, lng: 4.7 },
  "4": { lat: 51.55, lng: 4.4 },
  "5": { lat: 51.5, lng: 5.3 },
  "6": { lat: 51.6, lng: 5.9 },
  "7": { lat: 52.3, lng: 6.4 },
  "8": { lat: 52.9, lng: 5.8 },
  "9": { lat: 53.15, lng: 6.4 },
};

export function resolveLocation(input: string): Place | null {
  const q = input.trim().toLowerCase();
  if (!q) return null;
  const byName = PLACES.find((p) => p.name.toLowerCase() === q) ?? PLACES.find((p) => p.name.toLowerCase().startsWith(q));
  if (byName) return byName;
  const digits = q.replace(/\D/g, "");
  if (digits.length >= 4) {
    const zone = POSTCODE_ZONES[digits[0]!];
    if (zone) return { name: digits.slice(0, 4), lat: zone.lat, lng: zone.lng };
  }
  return null;
}

export function distanceKm(
  a: { lat?: number | null; lng?: number | null },
  b: { lat?: number | null; lng?: number | null },
): number | null {
  if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) return null;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(s)) * 10) / 10;
}

export function ageFromBirthDate(birth?: string | null): number | null {
  if (!birth) return null;
  const d = new Date(birth);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

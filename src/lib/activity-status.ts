export const CROWDED_THRESHOLD = 12;

export type CapacityState = "open" | "crowded" | "full";

export function capacityState(count: number, max: number | null | undefined): CapacityState {
  if (max != null && count >= max) return "full";
  if (count >= CROWDED_THRESHOLD) return "crowded";
  return "open";
}

export function capacityLabel(count: number, max: number | null | undefined): string {
  const state = capacityState(count, max);
  if (state === "full") return "Vol";
  if (state === "crowded") return "Bijna vol";
  return "Er is plek";
}

export function activityStatusLabel(status: string | null | undefined): string | null {
  if (status === "fulfilled") return "Vervuld";
  if (status === "expired") return "Verlopen";
  return null;
}

/** Uurblokken waaruit je kunt kiezen bij een tijdvak. */
export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`);

/** Geeft de uurblokken binnen een tijdvak, bijv. 10:00-13:00 -> ["10:00", "11:00", "12:00"]. */
export function slotsBetween(startsAt: string, endsAt: string | null): string[] {
  const start = new Date(startsAt);
  if (!endsAt) return [];
  const end = new Date(endsAt);
  if (!(end > start)) return [];
  const slots: string[] = [];
  const cursor = new Date(start);
  while (cursor < end && slots.length < 24) {
    slots.push(
      cursor.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" }),
    );
    cursor.setHours(cursor.getHours() + 1);
  }
  return slots;
}

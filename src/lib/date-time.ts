const DATE_ONLY_UTC = /^\d{4}-\d{2}-\d{2}T00:00:00(?:\.\d+)?(?:Z|\+00:00)$/;

export function hasKnownEventTime(startsAt: string): boolean {
  return !DATE_ONLY_UTC.test(startsAt);
}

export function formatEventTime(startsAt: string): string {
  if (!hasKnownEventTime(startsAt)) return "Tijd nog niet bekend";
  return new Date(startsAt).toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Amsterdam",
  });
}

export function formatEventDateTime(startsAt: string): string {
  const date = new Date(startsAt).toLocaleDateString("nl-NL", {
    dateStyle: "full",
    timeZone: "Europe/Amsterdam",
  });
  return hasKnownEventTime(startsAt) ? `${date} om ${formatEventTime(startsAt)}` : `${date}, tijd nog niet bekend`;
}
/** Source end times must be explicit, timezone-qualified and after the start. */
export function knownEventEnd(value: unknown, startsAt: string): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(raw)) return null;
  const end = Date.parse(raw);
  if (!Number.isFinite(end) || end <= Date.parse(startsAt)) return null;
  return new Date(end).toISOString();
}
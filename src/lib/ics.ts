export type CalendarEvent = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: string | Date;
  durationMinutes?: number;
};

function stamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function buildIcs(event: CalendarEvent) {
  const start = new Date(event.startsAt);
  const end = new Date(start.getTime() + (event.durationMinutes ?? 120) * 60 * 1000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dare2Meet//NL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@dare2meet.nl`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(event.title)}`,
    `DESCRIPTION:${escape(event.description ?? "Aangemeld via Dare2Meet")}`,
    `LOCATION:${escape(event.location ?? "")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function googleCalendarUrl(event: CalendarEvent) {
  const start = new Date(event.startsAt);
  const end = new Date(start.getTime() + (event.durationMinutes ?? 120) * 60 * 1000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: event.description ?? "Aangemeld via Dare2Meet",
    location: event.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcs(event: CalendarEvent) {
  if (typeof window === "undefined") return;
  const blob = new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.replace(/[^\w\s-]/g, "").trim() || "dare2meet"}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

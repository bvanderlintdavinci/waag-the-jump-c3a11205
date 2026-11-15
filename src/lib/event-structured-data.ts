import type { PublicActivity } from "@/lib/public-activities.functions";
import { cityFromLocation, SITE_URL } from "@/lib/public-activities";
import { hasKnownEventTime } from "@/lib/date-time";

/** Only publish facts present in the event; unknown prices and performers stay omitted. */
export function buildEventStructuredData(activity: PublicActivity, imageSrc: string, description: string) {
  const city = cityFromLocation(activity.location_name);
  const endIsValid = activity.ends_at && hasKnownEventTime(activity.ends_at)
    && Number.isFinite(Date.parse(activity.ends_at))
    && Date.parse(activity.ends_at) > Date.parse(activity.starts_at);
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: activity.title,
    startDate: hasKnownEventTime(activity.starts_at) ? activity.starts_at : activity.starts_at.slice(0, 10),
    ...(endIsValid ? { endDate: activity.ends_at } : {}),
    image: [new URL(imageSrc, SITE_URL).href],
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    description,
    location: { "@type": "Place", name: activity.location_name, address: { "@type": "PostalAddress", addressLocality: city, addressCountry: "NL" } },
    url: `${SITE_URL}/uitje/${activity.id}`,
  };
}
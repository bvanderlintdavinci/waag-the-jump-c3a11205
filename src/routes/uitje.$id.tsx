import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, MapPin, Users } from "lucide-react";

import { Dare2MeetLogo } from "@/components/Dare2MeetLogo";
import { Button } from "@/components/ui/button";
import { ACTIVITY_IMAGES, pickImageKey } from "@/lib/activity-templates";
import { formatEventRange } from "@/lib/date-time";
import { getPublicActivity } from "@/lib/public-activities.functions";
import { cityFromLocation, citySlug, shortSummary, SITE_URL } from "@/lib/public-activities";
import { useSession } from "@/hooks/use-auth";

export const Route = createFileRoute("/uitje/$id")({
  loader: async ({ params }) => {
    const activity = await getPublicActivity({ data: { id: params.id } });
    if (!activity) throw notFound();
    return { activity };
  },
  head: ({ params, loaderData }) => {
    const url = `${SITE_URL}/uitje/${params.id}`;
    if (!loaderData) {
      return { meta: [{ title: "Uitje niet gevonden | Dare2Meet" }, { name: "robots", content: "noindex" }] };
    }
    const { activity } = loaderData;
    const city = cityFromLocation(activity.location_name);
    const title = `${activity.title}${city ? ` in ${city}` : ""} | Dare2Meet`;
    const description = shortSummary(
      activity.description || `Ga samen naar ${activity.title}${city ? ` in ${city}` : ""} en ontmoet nieuwe mensen.`,
    );
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: "https://dare2meet.nl/og-image.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: "https://dare2meet.nl/og-image.png" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: activity.title,
            startDate: activity.starts_at,
            ...(activity.ends_at ? { endDate: activity.ends_at } : {}),
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            eventStatus: "https://schema.org/EventScheduled",
            description,
            location: { "@type": "Place", name: activity.location_name, address: { "@type": "PostalAddress", addressLocality: city, addressCountry: "NL" } },
            url,
            organizer: { "@type": "Organization", name: "Dare2Meet", url: `${SITE_URL}/` },
          }),
        },
      ],
    };
  },
  component: PublicActivityPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-foreground">Dit uitje staat niet meer online</h1>
      <p className="mt-2 text-sm text-muted-foreground">Bekijk de agenda voor wat er de komende weken te doen is.</p>
      <Link to="/" className="mt-6 inline-block"><Button>Naar de agenda</Button></Link>
    </div>
  ),
});

function PublicActivityPage() {
  const { activity } = Route.useLoaderData();
  const { user } = useSession();
  const city = cityFromLocation(activity.location_name);
  const image = ACTIVITY_IMAGES[pickImageKey({ imageKey: activity.image_key, category: activity.category, title: activity.title, id: activity.id })];

  return (
    <div className="penguin-texture min-h-screen bg-background">
      <header data-google-query-build="false" className="glass-nav sticky top-0 z-40 w-full">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Dare2MeetLogo className="size-10" />
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">Dare2Meet</span>
          </Link>
          {user ? (
            <Link to="/feed"><Button size="sm">Naar mijn omgeving</Button></Link>
          ) : (
            <Link to="/auth" search={{ tab: "signup" }}><Button size="sm">Gratis account</Button></Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="eyebrow">{activity.category}</p>
        <h1 className="text-balance-title mt-2 text-[2rem] leading-tight text-ink sm:text-[2.6rem]">{activity.title}</h1>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" />{formatEventRange(activity.starts_at, activity.ends_at)}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" />{activity.location_name}</span>
        </div>

        {image ? (
          <img src={image} alt={activity.title} width={1200} height={630} className="mt-6 aspect-[16/9] w-full rounded-2xl object-cover" loading="lazy" />
        ) : null}

        {activity.description ? (
          <p className="mt-6 whitespace-pre-line text-[1.0625rem] leading-relaxed text-foreground">{activity.description}</p>
        ) : null}

        <div className="surface mt-8 grid gap-3 p-5">
          <h2 className="text-lg font-bold text-foreground">Samen naar dit uitje?</h2>
          <p className="text-sm text-muted-foreground">
            Meld je aan bij Dare2Meet en laat zien dat je gaat. Andere leden bij jou in de buurt kunnen dan aanhaken.
            Een basisaccount is gratis.
          </p>
          <div className="flex flex-wrap gap-2">
            {user ? (
              <Link to="/waagje/$id" params={{ id: activity.id }}><Button size="lg" className="cta-glow"><Users className="size-4" />Aanmelden</Button></Link>
            ) : (
              <Link to="/auth" search={{ tab: "signup" }}><Button size="lg" className="cta-glow"><Users className="size-4" />Gratis aanmelden en meegaan</Button></Link>
            )}
            {city ? (
              <Link to="/uitjes/$stad" params={{ stad: citySlug(city) }}>
                <Button size="lg" variant="outline">Meer uitjes in {city}</Button>
              </Link>
            ) : null}
          </div>
        </div>

        {activity.source_url ? (
          <p className="mt-6 text-xs text-muted-foreground">
            Bron: <a href={activity.source_url} rel="nofollow noreferrer noopener" target="_blank" className="underline">{activity.source ?? "externe agenda"}</a>
          </p>
        ) : null}
      </main>
    </div>
  );
}

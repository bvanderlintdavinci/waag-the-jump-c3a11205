import { createFileRoute, Link } from "@tanstack/react-router";

import { Dare2MeetLogo } from "@/components/Dare2MeetLogo";
import { Button } from "@/components/ui/button";
import { listPublicActivities } from "@/lib/public-activities.functions";
import { cityFromLocation, citySlug, SITE_URL } from "@/lib/public-activities";
import { useSession } from "@/hooks/use-auth";

export const Route = createFileRoute("/uitjes/")({
  loader: async () => {
    const activities = await listPublicActivities();
    const counts = new Map<string, { city: string; slug: string; count: number }>();
    for (const a of activities) {
      const city = cityFromLocation(a.location_name);
      if (!city) continue;
      const slug = citySlug(city);
      const entry = counts.get(slug) ?? { city, slug, count: 0 };
      entry.count += 1;
      counts.set(slug, entry);
    }
    return { cities: [...counts.values()].sort((a, b) => b.count - a.count || a.city.localeCompare(b.city)) };
  },
  head: () => {
    const url = `${SITE_URL}/uitjes`;
    const title = "Uitjes per plaats | Dare2Meet";
    const description = "Bekijk per plaats wat er de komende weken te doen is en ga er samen op uit met mensen bij jou in de buurt.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:image", content: "https://dare2meet.nl/og-image.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: "https://dare2meet.nl/og-image.png" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: CityIndex,
});

function CityIndex() {
  const { cities } = Route.useLoaderData();
  const { user } = useSession();

  return (
    <div className="penguin-texture min-h-screen bg-background">
      <header data-google-query-build="false" className="glass-nav sticky top-0 z-40 w-full">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
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

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-balance-title text-[2rem] leading-tight text-ink sm:text-[2.6rem]">Uitjes per plaats</h1>
        <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-muted-foreground">
          Kies je plaats en zie wat er de komende vier weken te doen is. Aanmelden is gratis.
        </p>
        <ul className="mt-8 flex flex-wrap gap-2">
          {cities.map((c) => (
            <li key={c.slug}>
              <Link
                to="/uitjes/$stad"
                params={{ stad: c.slug }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
              >
                {c.city}
                <span className="text-xs font-normal text-muted-foreground">{c.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

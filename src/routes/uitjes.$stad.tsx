import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, MapPin } from "lucide-react";

import { Dare2MeetLogo } from "@/components/Dare2MeetLogo";
import { Button } from "@/components/ui/button";
import { ACTIVITY_IMAGES, pickImageKey } from "@/lib/activity-templates";
import { formatEventDateTime } from "@/lib/date-time";
import { getCityActivities } from "@/lib/public-activities.functions";
import { cityLabelFromSlug, SITE_URL } from "@/lib/public-activities";
import { useSession } from "@/hooks/use-auth";

export const Route = createFileRoute("/uitjes/$stad")({
  loader: async ({ params }) => ({
    activities: await getCityActivities({ data: { slug: params.stad } }),
    city: cityLabelFromSlug(params.stad),
  }),
  head: ({ params, loaderData }) => {
    const city = loaderData?.city ?? cityLabelFromSlug(params.stad);
    const count = loaderData?.activities.length ?? 0;
    const url = `${SITE_URL}/uitjes/${params.stad}`;
    const title = `Samen op stap in ${city} | Dare2Meet`;
    const description = `${count > 0 ? `${count} uitjes` : "Uitjes"} in en rond ${city} om samen naartoe te gaan. Vind mensen bij jou in de buurt en ga er samen op uit.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary" },
        ...(count === 0 ? [{ name: "robots", content: "noindex, follow" }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: CityPage,
});

function CityPage() {
  const { activities, city } = Route.useLoaderData();
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
        <h1 className="text-balance-title text-[2rem] leading-tight text-ink sm:text-[2.6rem]">Samen op stap in {city}</h1>
        <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-muted-foreground">
          Dit staat er de komende weken op de agenda in en rond {city}. Kies een uitje, meld je gratis aan en ga er samen
          op uit met andere leden uit de buurt.
        </p>

        {activities.length === 0 ? (
          <div className="surface mt-8 grid gap-3 p-6">
            <h2 className="text-lg font-bold text-foreground">Nog geen uitjes in {city}</h2>
            <p className="text-sm text-muted-foreground">
              Wees de eerste: plaats zelf een Waagje in {city} en nodig de buurt uit.
            </p>
            <div>
              <Link to={user ? "/waagje/nieuw" : "/auth"} search={user ? undefined : { tab: "signup" }}>
                <Button className="cta-glow">Plaats het eerste uitje</Button>
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {activities.map((a) => {
              const image = ACTIVITY_IMAGES[pickImageKey({ imageKey: a.image_key, category: a.category, title: a.title, id: a.id })];
              return (
                <li key={a.id} className="surface overflow-hidden">
                  <Link to="/uitje/$id" params={{ id: a.id }} className="block">
                    {image ? <img src={image} alt={a.title} className="aspect-[16/9] w-full object-cover" loading="lazy" /> : null}
                    <div className="grid gap-1.5 p-4">
                      <h2 className="text-base font-bold leading-snug text-foreground">{a.title}</h2>
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" />{formatEventDateTime(a.starts_at)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5" />{a.location_name}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-10">
          <Link to="/uitjes" className="text-sm font-semibold text-primary underline">Bekijk alle plaatsen</Link>
        </div>
      </main>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";

import { Dare2MeetLogo } from "@/components/Dare2MeetLogo";
import { Button } from "@/components/ui/button";
import { GUIDES } from "@/lib/guides";

export const Route = createFileRoute("/gidsen")({
  head: () => ({
    meta: [
      { title: "Gidsen over vriendschap, daten en nieuwe mensen ontmoeten | Dare2Meet.nl" },
      {
        name: "description",
        content:
          "Praktische gidsen over nieuwe vrienden maken, een eerste date, alleen uitgaan, eenzaamheid en veilig afspreken met mensen uit je buurt.",
      },
      { property: "og:title", content: "Gidsen van Dare2Meet" },
      { property: "og:description", content: "Praktische tips om nieuwe mensen te ontmoeten in je eigen buurt." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.dare2meet.nl/gidsen" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.dare2meet.nl/gidsen" }],
  }),
  component: GuidesIndex,
});

const EXTRA = [
  { to: "/veilig-afspreken" as const, title: "Veilig afspreken met nieuwe mensen", description: "Van de eerste chat tot de eerste ontmoeting: zo spreek je veilig af." },
  { to: "/ideeen" as const, title: "Ideeën voor een eerste ontmoeting", description: "Laagdrempelige uitjes om samen met nieuwe mensen te doen." },
];

function GuidesIndex() {
  return (
    <div className="min-h-screen bg-background">
      <header data-google-query-build="false" className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5">
        <Link to="/" className="flex items-center gap-2">
          <Dare2MeetLogo className="size-8" />
          <span className="text-lg font-extrabold text-primary">Dare2Meet</span>
        </Link>
        <Link to="/auth" search={{ tab: "signup" }}><Button size="sm">Meedoen</Button></Link>
      </header>
      <main className="mx-auto max-w-4xl px-4 pb-20">
        <p className="eyebrow">Gidsen</p>
        <h1 className="mt-2 text-4xl font-extrabold text-foreground">Tips om nieuwe mensen te ontmoeten</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Eerlijke, praktische artikelen over vriendschap, daten en samen op stap gaan in je eigen buurt.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {GUIDES.map((g) => (
            <Link key={g.slug} to="/gids/$slug" params={{ slug: g.slug }} className="surface block rounded-[1.5rem] p-6 transition hover:-translate-y-0.5">
              <h2 className="text-lg font-bold text-foreground">{g.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{g.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">{g.readMinutes} minuten lezen</p>
            </Link>
          ))}
          {EXTRA.map((g) => (
            <Link key={g.to} to={g.to} className="surface block rounded-[1.5rem] p-6 transition hover:-translate-y-0.5">
              <h2 className="text-lg font-bold text-foreground">{g.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{g.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

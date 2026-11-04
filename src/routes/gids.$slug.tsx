import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Clock, Coffee } from "lucide-react";

import { Dare2MeetLogo } from "@/components/Dare2MeetLogo";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";
import { GUIDES, getGuide } from "@/lib/guides";

export const Route = createFileRoute("/gids/$slug")({
  loader: ({ params }) => {
    const guide = getGuide(params.slug);
    if (!guide) throw notFound();
    return { guide };
  },
  head: ({ loaderData }) => {
    const g = loaderData?.guide;
    if (!g) return { meta: [{ title: "Gids | Dare2Meet.nl" }] };
    const url = `https://www.dare2meet.nl/gids/${g.slug}`;
    return {
      meta: [
        { title: `${g.title} | Dare2Meet.nl` },
        { name: "description", content: g.description },
        { property: "og:title", content: g.title },
        { property: "og:description", content: g.description },
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
            "@type": "Article",
            headline: g.title,
            description: g.description,
            inLanguage: "nl",
            mainEntityOfPage: url,
            author: { "@type": "Organization", name: "Dare2Meet" },
            publisher: { "@type": "Organization", name: "Dare2Meet" },
          }),
        },
      ],
    };
  },
  component: GuidePage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Deze gids bestaat niet</h1>
      <Link to="/gidsen" className="mt-4 inline-block underline">Bekijk alle gidsen</Link>
    </div>
  ),
});

function GuidePage() {
  const { guide } = Route.useLoaderData();
  const others = GUIDES.filter((g) => g.slug !== guide.slug);
  return (
    <div className="min-h-screen bg-background">
      <header data-google-query-build="false" className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
        <Link to="/" className="flex items-center gap-2">
          <Dare2MeetLogo className="size-8" />
          <span className="text-lg font-extrabold text-primary">Dare2Meet</span>
        </Link>
        <Link to="/auth" search={{ tab: "signup" }}>
          <Button size="sm">Meedoen</Button>
        </Link>
      </header>

      <article className="mx-auto max-w-3xl px-4 pb-20">
        <Link to="/gidsen" className="eyebrow hover:underline">Gidsen</Link>
        <h1 className="mt-2 text-4xl font-extrabold leading-tight text-foreground">{guide.title}</h1>
        <p className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-3.5" /> {guide.readMinutes} minuten lezen
        </p>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{guide.intro}</p>

        <div className="mt-10 space-y-8">
          {guide.sections.map((s, i) => (
            <section key={s.title}>
              <h2 className="text-2xl font-bold text-foreground">{s.title}</h2>
              {s.paragraphs.map((p) => (
                <p key={p.slice(0, 40)} className="mt-3 leading-relaxed text-muted-foreground">{p}</p>
              ))}
              {s.tips && (
                <ul className="surface mt-4 list-disc space-y-2 rounded-[1.25rem] p-5 pl-10 text-sm leading-relaxed text-muted-foreground">
                  {s.tips.map((t) => <li key={t}>{t}</li>)}
                </ul>
              )}
              {i === 1 && <AdSpace className="mt-8" />}
            </section>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-bold text-foreground">Lees ook</h2>
          <ul className="mt-3 space-y-2">
            {others.map((g) => (
              <li key={g.slug}>
                <Link to="/gids/$slug" params={{ slug: g.slug }} className="underline hover:text-foreground">{g.title}</Link>
              </li>
            ))}
            <li><Link to="/veilig-afspreken" className="underline hover:text-foreground">Veilig afspreken met nieuwe mensen</Link></li>
            <li><Link to="/ideeen" className="underline hover:text-foreground">Ideeën voor een eerste ontmoeting</Link></li>
          </ul>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/uitjes"><Button variant="outline">Uitjes bij jou in de buurt</Button></Link>
          <Link to="/auth" search={{ tab: "signup" }}><Button className="cta-glow">Maak een gratis account</Button></Link>
        </div>

        <p className="mt-8 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Coffee className="size-3.5" /> Dare2Meet is een particulier initiatief, van mensen voor mensen.
        </p>
      </article>
    </div>
  );
}

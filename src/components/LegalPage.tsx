import { Link } from "@tanstack/react-router";

import { Dare2MeetLogo } from "@/components/Dare2MeetLogo";
import { Button } from "@/components/ui/button";

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
        <Link to="/" className="flex items-center gap-2">
          <Dare2MeetLogo className="size-8" />
          <span className="text-lg font-extrabold text-primary">Dare2Meet</span>
        </Link>
        <Link to="/auth">
          <Button size="sm">Meedoen</Button>
        </Link>
      </header>

      <article className="mx-auto max-w-3xl px-4 pb-20">
        <h1 className="text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-3 text-base text-muted-foreground">{intro}</p>
        <div className="mt-8 space-y-5 text-sm leading-relaxed text-foreground [&_h2]:pt-3 [&_h2]:text-xl [&_h2]:font-extrabold [&_li]:ml-5 [&_li]:list-disc">
          {children}
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          Laatst bijgewerkt op 21 augustus 2026. Vragen? Gebruik de knop "Idee of advies" onderaan de site.
        </p>
        <nav className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link to="/privacy" className="underline hover:text-foreground">
            Privacybeleid
          </Link>
          <Link to="/cookies" className="underline hover:text-foreground">
            Cookies
          </Link>
          <Link to="/voorwaarden" className="underline hover:text-foreground">
            Voorwaarden
          </Link>
          <Link to="/disclaimer" className="underline hover:text-foreground">
            Disclaimer
          </Link>
        </nav>
      </article>
    </div>
  );
}

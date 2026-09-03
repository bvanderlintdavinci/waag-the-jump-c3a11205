import { createFileRoute, Link } from "@tanstack/react-router";
import { Coffee, HeartHandshake, MapPin, ShieldCheck, Sparkles, Users } from "lucide-react";

import heroImage from "@/assets/iceberg-leap.jpg";
import { EventAgenda } from "@/components/EventAgenda";

import { Dare2MeetLogo } from "@/components/Dare2MeetLogo";
import { FeedbackButtons } from "@/components/FeedbackButtons";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dare2Meet.nl | Waag de sprong en ga er samen op uit" },
      {
        name: "description",
        content:
          "Lokaal sociaal netwerk voor vriendschap, samen dingen ondernemen en daten. Gratis basisaccount, premium functies eenmalig.",
      },
      { property: "og:title", content: "Dare2Meet.nl | Waag de sprong" },
      {
        property: "og:description",
        content: "Ontmoet nieuwe mensen of een date bij jou in de buurt. Waag de sprong en ga er samen op uit!",
      },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  {
    icon: Users,
    title: "Mensen ontmoeten",
    text: "Nieuw in de stad, jonge ouders, hobbyisten of gewoon toe aan nieuwe gezichten.",
  },
  {
    icon: HeartHandshake,
    title: "Of juist een date",
    text: "Geef aan waar je voor openstaat: vriendschap, dating of allebei.",
  },
  {
    icon: MapPin,
    title: "Altijd dichtbij",
    text: "Zoek op plaatsnaam of postcode en stel zelf je afstandscirkel in.",
  },
];

function Landing() {
  return (
    <div className="feather-texture min-h-screen bg-background">
      <header className="glass-nav sticky top-0 z-40 mb-1 w-full">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-3">
          <Dare2MeetLogo className="size-10" />
          <span className="flex flex-col leading-tight">
            <span className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-foreground">
              Dare2Meet
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              Basisaccount 100% gratis · Premium functies eenmalig
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/verhaal" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block">
            Het verhaal
          </Link>

          <Link to="/auth">
            <Button size="sm">Inloggen</Button>
          </Link>
        </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl items-center gap-8 px-4 pb-4 pt-6 lg:grid-cols-2 lg:pt-14">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1 text-xs font-semibold text-mint-foreground">
            <Sparkles className="size-3.5" /> Gratis basisaccount · geen abonnementen
          </span>
          <h1 className="text-balance-title mt-5 text-[2.6rem] leading-[1.03] text-ink sm:text-[3.4rem]">
            Dare2Meet: waag de sprong, breek het ijs en ontmoet mensen bij jou in de buurt!
          </h1>
          <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-muted-foreground">
            Net als pinguïns op de rand van het ijs: iemand moet als eerste springen. Plaats een{" "}
            <strong className="font-semibold text-terracotta">Waagje</strong>, haak aan bij uitjes in de{" "}
            <strong className="font-semibold text-terracotta">4-weken agenda</strong> en ontmoet nieuwe mensen,{" "}
            <strong className="font-semibold text-terracotta">buddy's</strong> of een{" "}
            <strong className="font-semibold text-terracotta">date</strong>.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/auth">
              <Button size="lg" className="cta-glow">Ik waag de sprong!</Button>
            </Link>
            <Link to="/verhaal">
              <Button size="lg" variant="outline">
                Lees het verhaal
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-mint/70 blur-[2px]" aria-hidden="true" />
          <img
          src={heroImage}
          alt="Pinguïns op een ijsberg terwijl de eerste de sprong waagt"
          width={1536}
          height={1024}
          className="hero-float w-full rounded-[1.75rem] border border-border object-cover"
          />
        </div>
      </section>

      <EventAgenda />


      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.title} className="surface-lift p-6">
              <span className="gradient-primary inline-flex size-11 items-center justify-center rounded-2xl">
                <p.icon className="size-5" />
              </span>
              <h2 className="mt-4 text-xl text-foreground">{p.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="surface grid gap-8 rounded-[1.75rem] p-6 sm:grid-cols-2 sm:p-10">
          <div>
            <p className="eyebrow">Zo werkt het</p>
            <h2 className="mt-2 text-3xl text-foreground">Hoe werkt een Waagje?</h2>
            <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">1. Plaats een Waagje.</strong> Een oproepje voor koffie, een
                rondje motorrijden of een uitje met de kids.
              </li>
              <li>
                <strong className="text-foreground">2. Iemand waagt de sprong.</strong> Bij aanmelding opent
                automatisch een besloten groepschat.
              </li>
              <li>
                <strong className="text-foreground">3. Jullie gaan er echt op uit.</strong> Niet eindeloos
                chatten op de bank, maar samen iets doen.
              </li>
            </ol>
          </div>
          <div className="rounded-[1.5rem] bg-mint p-6">
            <ShieldCheck className="size-6 text-mint-foreground" />
            <h3 className="mt-3 text-lg font-bold text-mint-foreground">Veilig en eerlijk</h3>
            <p className="mt-1 text-sm text-mint-foreground/80">
              Echte profielfoto's, een automatische woordenfilter, blokkeren met reden, meldknoppen en een
              beheerder die meekijkt. Bij ernstige overtredingen kunnen gegevens worden gedeeld met officiële
              meldpunten.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Dare2MeetLogo className="size-8" />
            <span className="font-bold text-foreground">Dare2Meet.nl</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <Coffee className="size-4" />{" "}
            <a href="/api/public/doneer" className="underline hover:text-foreground">
              Steun Dare2Meet met een kop koffie
            </a>
          </span>

          <FeedbackButtons floating={false} />
          <span>© {new Date().getFullYear()} Dare2Meet.nl</span>
        </div>
        <div className="mx-auto flex max-w-5xl flex-wrap gap-4 border-t border-border px-4 py-4 text-xs text-muted-foreground">
          <Link to="/privacy" className="underline hover:text-foreground">
            Privacybeleid
          </Link>
          <Link to="/cookies" className="underline hover:text-foreground">
            Cookies
          </Link>
          <Link to="/voorwaarden" className="underline hover:text-foreground">
            Algemene voorwaarden
          </Link>
          <Link to="/disclaimer" className="underline hover:text-foreground">
            Disclaimer
          </Link>
          <Link to="/verhaal" className="underline hover:text-foreground">
            Het verhaal
          </Link>

        </div>
      </footer>

    </div>
  );
}

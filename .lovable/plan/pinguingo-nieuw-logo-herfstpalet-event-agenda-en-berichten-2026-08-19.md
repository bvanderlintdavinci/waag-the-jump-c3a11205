# PinguinGo: nieuw logo, herfstpalet, event-agenda en berichten

## 1. Logo en merkidentiteit

- Nieuw component `PinguinGoLogo` met exact de aangeleverde SVG (inclusief achtergrondcirkel, gradients en oog).
- Vervangt de pinguïn-afbeelding overal: header van de app, landingspagina, verhaalpagina, inlogpagina en onboarding.
- Dezelfde SVG komt als `public/pinguingo-logo.svg` in de browser-tab (favicon) en als deelafbeelding-icoon, gekoppeld in de root van de site.

## 2. Volwassen herfstpalet

Het huidige mint/teal-thema wordt volledig vervangen door het warme charcoal/koper-palet:

- Tekst en donkere elementen: `#1C1917`
- Knoppen en badges: verloop `#EA580C` → `#9A3412`
- Achtergrond: `#FAFAF9`
- Randen en scheidingslijnen: `#E7E5E4`
- Gedempte tekst (datums, afstanden): `#78716C`

Dit gebeurt centraal in het design-systeem, zodat elke pagina (feed, leden, profiel, chats, instellingen, admin) meteen meekleurt. De donkere modus krijgt een bijpassende warme variant. De badge boven de hoofdtitel op de homepage krijgt de tekst: "Basisaccount 100% gratis · Premium functies eenmalig".

## 3. 3-weken event-agenda op de homepage

- Nieuwe sectie direct onder de hero: alle events van vandaag t/m 21 dagen vooruit, gegroepeerd per week (Deze week / Volgende week / Over 2 weken).
- Ik zet circa 14 gevarieerde demo-events in de database, verspreid over de 21 dagen: festivals, koffie-hotspots, live muziek, motorritten, wandelingen, spontane ontmoetingen, gezinsuitjes.
- Elke event-card toont: afbeelding, titel, datum, tijd, locatie en afstand, categorie-badge in de koperkleur, een avatar-stack van aangemelde deelnemers plus het aantal, en de knop **"Aansluiten / Ik ga ook"**.
- Klikken op de knop meldt je aan; de knop wordt **"Aangemeld ✓"** en je avatar verschijnt direct in de deelnemersstack. Niet ingelogd? Dan ga je eerst naar de inlogpagina en kom je terug bij het event.
- De agenda is voor iedereen zichtbaar zonder account (alleen demo-/publieke events); aanmelden vereist inloggen.
- Zes sfeerbeelden worden gegenereerd en hergebruikt per categorie.

## 4. Direct messaging tussen deelnemers

- Op het profiel van een mede-deelnemer van een event waarvoor jij bent aangemeld verschijnt de knop **"Bericht sturen"**: die opent (of maakt) een 1-op-1 privégesprek voor afspreken, ontmoetingspunt of carpoolen.
- Vanaf de deelnemerslijst/avatar-stack van een event klik je direct door naar dat profiel.
- Nieuwe tab **"Berichten"** in de navigatie (desktop en mobiel) en in het accountmenu: alle 1-op-1 gesprekken bij elkaar. De bestaande "Chats"-tab wordt de groepschats van waagjes.

## Technische details

- `src/components/PinguinGoLogo.tsx` (inline SVG), `public/pinguingo-logo.svg` + `<link rel="icon">` in `src/routes/__root.tsx`.
- Palet in `src/styles.css` (oklch-tokens: background, foreground, primary, border, muted-foreground) plus een `--gradient-primary` token voor knoppen/badges; `mint`/`ice` tokens worden hergedefinieerd naar warme amber-tinten zodat bestaande componenten blijven werken.
- Migratie: `activities` krijgt `image_key text`, `is_public boolean default false`, en `creator_id` wordt nullable met `host_name`/`host_avatar` voor demo-hosts; anon SELECT-policy + GRANT op `activities` en `activity_participants` beperkt tot `is_public = true`. Bestaande policies blijven ongewijzigd.
- Seed via insert-statements: ~14 events met datums relatief aan nu, verdeeld over 21 dagen.
- Nieuwe route `src/routes/_authenticated/berichten.tsx` (1-op-1) en filtering van `chats.index.tsx` op groepen; `AppShell` navigatie uitgebreid.
- "Bericht sturen" hergebruikt de bestaande conversatie-logica uit `profiel.$id.tsx`, met een check op gedeeld event-deelnemerschap.

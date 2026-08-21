# Dare2Meet

Bouw een moderne, responsieve Web App / PWA genaamd "PinguinGo" (domein: pinguingo.nl). Het is een lokaal sociaal netwerk gericht op het maken van vrienden, het organiseren van gezamenlijke activiteiten én het zoeken naar een partner/date (bijv. voor mensen die nieuw zijn in een stad, ouders die samen iets willen doen met kinderen, hobbyisten, of singles).



De visuele identiteit draait om de mascotte 'Waag de Pinguïn': pinguïns staan op de rand van de ijsberg te twijfelen, totdat de eerste springt en de rest volgt.



### 1. Brand Identity & Mascotte ("Waag" de Pinguïn)

- Mascotte: Een strakke, minimalistische pinguïn-illustratie (in Deep Teal / Mint stijl, optioneel met een sjawltje of duikbril op).

- Micro-copy & App-taal:

  - Activiteit aanmaken -> "Een Waagje plaatsen"

  - Actieknop voor deelnemen -> "Ik waag de sprong!"

  - Vrienden / Connecties -> "IJsbrekers" of "Waaggenoten"

  - Lege schermen (empty states) -> Illustratie van Waag de pinguïn die op een ijsberg staat met de tekst: "Nog geen ijsbrekers hier..."

  - Landingspagina Tagline: "PinguinGo.nl — Waggel uit je comfortzone, waag de sprong en ontmoet maatjes of een date!"



### 2. Gebruikersbeheer, Gender/Identiteit & Profielen (AVG Compliant)

- Authenticatie: Inloggen/registreren via E-mail + Wachtwoord (met e-mailverificatie) of Google.

- Onboarding & Profielopbouw:

  - Verplicht: Voornaam, Leeftijd/Geboortedatum, Woonplaats/Regio (met exacte locatie/postcode voor afstandsberekening).

  - Identiteit & Gender (Optioneel & AVG Proof - Bijzondere Persoonsgegevens):

    * Vrijwillige optie voor gender: Man, Vrouw, Non-binair, Anders / Zeg ik liever niet.

    * Optie 'LHBTQIA+ Community Badge': Gebruiker kan optioneel kiezen voor het tonen van een discreet regenboog-icoontje (of regenboog-pinguïn) op het profiel.

    * Aparte Expliciete Consent Checkbox: "Ik geef expliciete toestemming om mijn geaardheid/identiteit en het bijbehorende icoon op mijn profiel zichtbaar te maken voor andere leden."

  - Intentie/Zoekdoel (Essentieel): Gebruiker geeft aan waar hij/zij voor openstaat:

    * 'Vriendschap & Maatjes' (bijv. motorrijden, gezinsuitjes, sporten, koffie)

    * 'Dating & Partner zoeken'

    * 'Beide / Ik zie wel wat er ontstaat'

  - Profielfoto: Uploaden van een echte profielfoto (geen karikaturen, avatars of fictieve afbeeldingen).

- Privacy & Consent:

  - Bij registratie verplichte vinkjes voor Akkoord Algemene Voorwaarden, Privacybeleid en zichtbaarheid voor andere ingelogde leden.

  - Expliciete juridische toestemming (Consent Checkbox): Gebruiker geeft akkoord dat bij ernstige overtredingen, misdrijven of kwalijke zaken (zoals bedreiging, intimidatie of oplichting) relevante accountgegevens en logs gedeeld kunnen worden met officiële meldpunten en de politie.



### 3. Geavanceerde Zoek- & Filterfunctionaliteit (Plaatsnaam & Afstandscirkel)

- Locatiegebaseerd zoeken: Gebruikers kunnen overal op het platform filteren op:

  - **Plaatsnaam / Postcode:** Bepaal het middelpunt van de zoekopdracht.

  - **Afstandscirkel (Straal in KM):** Een slider waarmee de gebruiker de maximale afstand kan instellen (bijv. binnen 5 km, 10 km, 25 km, 50 km).

  - **Type verbinding:** Filteren op 'Alleen Vrienden/Activiteiten', 'Alleen Dating' of 'Alles'.

  - **Interesses & Categorieën:** Filteren op specifieke tags ('Gezin & Kinderen', 'Motorrijden', 'Sport', etc.).



### 4. Veiligheid, Blokkeren, Deblokkeren & Misbruik Preventie

- **Blokkeren & Deblokkeren van Gebruikers:**

  - Gebruikers kunnen een andere gebruiker blokkeren via diens profiel of de chat.

  - Bij blokkeren verschijnt een pop-up met een verplicht invoerveld voor de **reden van blokkade** (bijv. 'Ongepast gedrag', 'Intimidatie', 'Geen interesse').

  - **Direct effect:** De geblokkeerde gebruiker verdwijnt direct uit de zoekresultaten, chatlijst en activiteitenfeed van de blokkeerder (en vice versa).

  - **Admin melding:** De opgegeven reden van de blokkade wordt automatisch doorgestuurd naar de Admin Logs voor de beheerder.

  - **Beheer:** Gebruikers hebben in hun accountinstellingen een pagina 'Geblokkeerde Leden' met de optie om iemand te deblokkeren.

- **Account Verwijdering (30 dagen Retention / Soft-delete):**

  - Om te voorkomen dat kwaadwillenden snel sporen uitwissen na ongepast of strafbaar gedrag, wordt bij een verwijderverzoek het profiel direct onzichtbaar gemaakt.

  - De data (logs, chats, accountgegevens) blijft 30 dagen bewaard voor eventuele lopende meldingen of politie-onderzoeken, waarna het definitief wordt gewist.



### 5. Activiteiten, Dates & Oproepen Feed

- Dashboard/Feed: Een overzicht van 'Waagjes' (oproepjes) geordend op datum en afstand tot de gebruiker.

- Oproep aanmaken ('Waagje plaatsen'):

  - Titel, Omschrijving, Categorie, Type ('Vriendschappelijk' of 'Date-oproep'), Datum/Tijd, en Locatie.

- Interactie:

  - Leden kunnen reageren met de knop 'Ik waag de sprong!'.

  - Bij aanmelding wordt automatisch een besloten groepschat geopend voor die specifieke activiteit.

- 1-op-1 Chat: Mogelijkheid om via iemands profiel een chatverzoek te sturen.



### 6. Personal Story Landing Page

- Een toegankelijke, persoonlijke landingspagina met de visie achter PinguinGo:

  - **Het verhaal:** Na verhuizen naar een nieuwe plaats, het stichten van een gezin en het combineren van een drukke fulltime baan merk je dat spontaan nieuwe vrienden maken of een partner ontmoeten niet meer zo makkelijk gaat.

  - **De missie:** Een eerlijk, veilig en gratis initiatief om mensen uit hun comfortzone te laten stappen en bij elkaar te brengen — niet via eindeloos chatten op de bank, maar door samen dingen te ondernemen (zoals naar de dierenweide met de kids, een stuk motorrijden of een eerste date).

  - **Transparantie:** Geen verplichte maandelijkse abonnementen of verborgen kosten.



### 7. Moderatie & Ingebouwde Woorden-Check

- Geautomatiseerde Content-Filter (Blacklist & Regex Scanning):

  - Alle invoervelden (titels van oproepen, beschrijvingen, profielteksten, chats en 1-op-1 berichten) worden realtime gecontroleerd op ongepaste of bedreigende taal.

  - De filter bevat een uitgebreide Nederlandse woordenlijst gericht op:

    1. **Ernstige ziekten & scheldwoorden** (bijv. 'kanker', 'hoer', 'slet', etc.).

    2. **Bedreigingen & geweldstermen** (bijv. 'doodmaken', 'dood maken', 'kelen', 'afmaken', 'snijden', 'steken', 'neersteken', 'pijn doen', etc.).

  - **Systeemactie bij detectie:** Bericht wordt geblokkeerd en de poging wordt als 'High Risk' opgeslagen in de admin dashboard logs.

- Meldknop (Reporting System): Een vlagsymbool op elk profiel, bericht en chatbericht.

- Automatische Noodrem: Bij 2 of meer meldingen over dezelfde gebruiker wordt het account automatisch tijdelijk stilgezet (shadowban) voor herziening.



### 8. Admin Dashboard & Monetarisatie

- Admin omgeving: Overzicht van aangemelde gebruikers, actieve meldingen, **overzicht van doorgegeven blokkeer-redenen**, geschorste accounts, geblokkeerde woorden-pogingen en accounts in de 30-dagen verwijderwachtrij.

- **GEEN Premium Account Status:** Iedereen is gelijk en heeft 100% gratis toegang tot de kernfuncties.

- **Vrijwillige Donatieknop:** 'Buy Me a Coffee (€2,99)' integratie via Stripe/Mollie.

- **Micro-transactie:** **Profielbezoekers Ontgrendelen (€2,99)** eenmalig/los via Stripe/Mollie om te zien wie je profiel de afgelopen periode heeft bezocht.



### 9. UI/UX Design, Typografie & Kleurenpalet (Pinguïn Mint Fresh)

- Stijl: Strak, opgeruimd en ruim opgezet. Veel witruimte, zachte afgeronde hoeken (`rounded-xl`) en speelse pinguïn-accenten.

- Typografie: Modern schreefloos lettertype (Inter of Plus Jakarta Sans).

- Kleurenpalet:

  - Background: Off-White / Soft Gray (`#FAFAFA`)

  - Cards / Containers: White (`#FFFFFF`) met subtiele border (`#E2E8F0`)

  - Primary Accent: Deep Teal (`#115E59`) voor actieknoppen (CTA's)

  - Secondary Accent: Soft Sage / Mint (`#E6F4F1`) voor badges

  - Text Primary: Dark Slate (`#1E293B`) | Text Muted: Cool Gray (`#64748B`)

  - Warning / Alert: Muted Amber (`#D97706`)



### Technical Stack Voorkeur:

- Frontend: React / Next.js (Tailwind CSS)

- Backend/Database: Supabase of Firebase (met PostGIS / Ge

olocation ondersteuning, Row Level Security en Realtime Chat)

- Betalingen: Stripe of Mollie

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://waag-the-jump.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ec3b2c0f-620f-4296-86f7-4a51ac9e3ea4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

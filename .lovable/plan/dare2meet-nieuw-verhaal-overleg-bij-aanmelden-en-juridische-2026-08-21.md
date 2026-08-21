# Dare2Meet: nieuw verhaal, overleg bij aanmelden en juridische basis

## 1. Verhaalpagina herschrijven
De pagina "Ons verhaal" krijgt jouw nieuwe tekst, letterlijk zoals aangeleverd:
- Kop "Het ontstaan van Dare2Meet" met de drie alinea's (druk gezin, transparantie/geen verdienmodel, maker en echte klik).
- Sectie "De missie" met de nieuwe missietekst.
- Geen lange streepjes, dezelfde herfststijl, logo en foto blijven staan.
- Meta-titel/omschrijving van de pagina aangepast op de nieuwe inhoud.

Let op: de tekst zegt "zonder winstoogmerk", terwijl elders op de site "premium functies eenmalig" staat. Ik zet in het verhaal een neutrale formulering die bij beide past ("geen abonnementen, geen verborgen kosten"), tenzij je liever alle betaalde functies eruit haalt.

## 2. Overleggen na aanmelding
Nu opent bij een waagje wel een groepschat, maar bij een agenda-event ("Aansluiten / Ik ga ook") niet altijd, en er is geen plek om tijd/locatie samen af te stemmen.
- Elke deelname zet je automatisch in de groepschat van dat event, ook vanuit de agenda.
- Op de waagje-pagina komt een blok "Afspraken": voorstel voor tijd, plek en wie er meegaan, met een knop "Voorstel plaatsen" die als bericht in de groepschat verschijnt.
- De organisator kan tijd en locatie bijwerken; deelnemers zien de wijziging in de chat en kunnen een nieuw .ics-bestand downloaden.
- Knop "Naar de groepschat" direct zichtbaar op de agendakaart zodra je bent aangesloten.

## 3. AVG, cookies en rechten
Nieuwe openbare pagina's, gelinkt in de footer en bij registratie:
- **Privacybeleid**: welke gegevens (naam, foto, woonplaats/coördinaten, interesses, berichten, meldingen), waarom, hoe lang, wie ze verwerkt, en jouw rechten (inzage, correctie, verwijderen, bezwaar, dataportabiliteit). Inclusief verwerkers (hosting/database, e-mail) en contactadres.
- **Cookie- en opslagverklaring**: de app gebruikt alleen functionele opslag voor inloggen. Er komt een korte cookiemelding die dit uitlegt; een toestemmingsbanner met keuzes is alleen nodig zodra er analytics of tracking bijkomt.
- **Algemene voorwaarden** en **Disclaimer**: gedragsregels, minimumleeftijd 18, eigen verantwoordelijkheid bij fysieke ontmoetingen, geen aansprakelijkheid voor gedrag of schade tussen leden, moderatie en verwijderingsbeleid, en dat gegevens bij ernstige overtredingen met meldpunten kunnen worden gedeeld.
- Data-export en accountverwijdering: verwijderen bestaat al (30 dagen); ik voeg in Instellingen een knop "Download mijn gegevens" toe.
- De akkoordvinkjes bij registratie gaan naar deze pagina's linken en het moment van akkoord wordt vastgelegd.

## 4. Wat ik verder zie
- **Veiligheidstips vóór een eerste ontmoeting**: korte melding bij aanmelden (openbare plek, laat iemand weten waar je bent).
- **Leeftijdscontrole**: nu alleen een vinkje; een geboortedatum bij registratie is sterker.
- **E-mail**: bevestigingen en meldingen naar de beheerder gaan nu niet echt de deur uit. Voor echte e-mail moet het domein dare2meet.nl gekoppeld worden.
- **Foto's van derden**: melden dat je alleen eigen foto's mag uploaden, plus meldknop bij profielfoto's.

## Technisch
- `src/routes/verhaal.tsx`: tekst en meta vervangen.
- Nieuwe routes `src/routes/privacy.tsx`, `voorwaarden.tsx`, `cookies.tsx`, `disclaimer.tsx` met eigen `head()`; links in footer, `auth.tsx` en instellingen.
- `src/components/CookieNotice.tsx`, keuze opgeslagen in localStorage, gemount in `__root.tsx`.
- `src/components/EventAgenda.tsx` en `waagje.$id.tsx`: bij deelname ook `conversation_participants` invullen, plus voorstel-/afsprakenblok dat een bericht in de bestaande `messages`-tabel schrijft.
- Migratie: kolommen voor akkoordmoment op `profiles` en eventueel `activities.location_note` voor bijgewerkte afspraken; met GRANTs en RLS.
- Instellingen: gegevens-export als JSON-download uit de eigen rijen.

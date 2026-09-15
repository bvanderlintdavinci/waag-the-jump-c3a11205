# Rustiger tellen, dating met beheer, tijdvakken, kinderen en connecties

## 1. Geen aantallen meer tonen

- Op de overzichtspagina en op een Waagje verdwijnt het deelnemersgetal.
- In plaats daarvan: "Er is plek" of "Bijna vol" (vanaf 12 aanmeldingen) en "Vol" als de limiet bereikt is.
- De plaatser ziet wel de echte lijst met namen van zijn eigen Waagje; anderen niet.
- Ook bij leden en de agenda staan nergens tellers.

## 2. Dating: één-op-één en de plaatser beslist

- Een date-oproep werkt niet meer met een groepschat. Wie wil aansluiten stuurt een kort bericht als aanvraag.
- De plaatser krijgt een lijst met aanvragen en kan per persoon accepteren of overslaan.
- Bij een accept opent een privéchat tussen die twee en sluit de oproep automatisch (staat daarna op "vervuld", verdwijnt uit de zoeklijst).
- Overgeslagen aanvragers krijgen een nette melding, zonder te zien wie wel gekozen is.
- De plaatser kan mensen die reageerden op een eigen favorietenlijst zetten, terug te vinden op zijn profielpagina.
- De grens van 2 plaatsingen per maand blijft ongewijzigd gelden voor alle oproepen samen.

## 3. Tijdvak in plaats van één tijdstip

- Bij het plaatsen van een gewone activiteit geef je een begin- en eindtijd op, te kiezen per uur.
- Op de kaart staat bijvoorbeeld "zondag 10:00 - 13:00".
- Wie zich aanmeldt kan kiezen binnen welk uurblok hij aansluit, en aangeven "ik kom graag, maar liefst met niet meer dan X personen erbij".
- Die voorkeur is zichtbaar voor de plaatser, zodat hij de groep klein kan houden.

## 4. Kinderen in het profiel

- Iedere gebruiker kan zijn kinderen opgeven: per kind geslacht (jongen / meisje / anders) en geboortejaar.
- Dit staat in het profiel en bij het aanmaken van je account, en is zichtbaar voor andere leden zodat gezinnen elkaar kunnen vinden.
- Per activiteit blijft de bestaande keuze "met kinderen erbij" bestaan; leeftijden worden nu automatisch uit het profiel voorgesteld.
- Filteren op "past bij mijn kinderleeftijden" komt op de overzichtspagina.

## 5. Connecties (vrienden)

- Op een profiel komt een knop "Connectie maken". De ander accepteert of weigert.
- Bevestigde connecties staan op een eigen tabblad, met snel een chat starten.
- Connecties zien elkaars profiel iets uitgebreider en kunnen altijd berichten sturen.

## 6. Telefoonnummer

- Optioneel veld in je profiel, standaard verborgen.
- Je kiest zelf: voor niemand, alleen voor connecties, of alleen voor mensen met wie je een geaccepteerde afspraak hebt.
- Nooit zichtbaar in openbare lijsten.

## Mijn aandachtspunten

- Zonder tellers wordt het lastiger te zien of iets leeft; daarom liever "Er is plek" dan een leeg gevoel.
- Date-oproepen die niemand accepteert blijven hangen: die verlopen automatisch na de einddatum.
- Iemand kan spammen met aanvragen; ik beperk aanvragen tot één per oproep en blokkeer aanvragen van geblokkeerde leden.
- Kindgegevens zijn gevoelig: geen namen, geen exacte geboortedata, alleen geboortejaar, en altijd vrijwillig.
- Telefoonnummers nooit in zoekresultaten of e-mails, alleen op het profiel van wie je mag zien.

## Technische uitvoering

- Database: `activities` krijgt `ends_at`, `status` (open / vervuld / verlopen) en `hide_counts`-gedrag in de weergave; nieuwe tabellen `activity_requests` (aanvraag + status + bericht), `favorites`, `connections` (aanvrager, ontvanger, status), `profile_children` (geslacht, geboortejaar); `profiles` krijgt `phone` en `phone_visibility`.
- Alle nieuwe tabellen met GRANTs en RLS: eigen rijen beheren, plaatser mag aanvragen op zijn eigen activiteit lezen en bijwerken, kindgegevens zichtbaar voor ingelogde leden volgens dezelfde zichtbaarheidsregels als de rest van het profiel.
- Trigger die een date-oproep op "vervuld" zet zodra een aanvraag geaccepteerd wordt, en die verdere aanvragen weigert.
- De maandlimiet-trigger blijft ongewijzigd (2 per kalendermaand, UTC).
- Frontend: feed, waagje-detail, nieuw-waagje-formulier, leden, profiel, instellingen en onboarding worden aangepast; nieuwe route voor connecties en favorieten.

# Pinguïn-favicon en sociale deelafbeelding

## Uitvoering
- Maak van de geüploade pinguïn een scherpe, vierkante `favicon.png` van 64×64 pixels.
- Maak een `og-image.png` van 1200×630 pixels met dezelfde pinguïn, passend bij de bestaande Dare2Meet-stijl.
- Vervang de huidige faviconverwijzingen door `/favicon.png`.
- Voeg op iedere deelbare openbare pagina Open Graph- en Twitter-afbeeldingstags toe met `https://dare2meet.nl/og-image.png`, zonder bestaande paginatitels of omschrijvingen te wijzigen.
- Controleer of favicon, deelafbeelding en metadata correct worden geserveerd.
- Controleer de afgeronde Google Search Console-koppeling en meld wat nog nodig is.

## Technisch
De app gebruikt geen traditioneel `index.html`; de tags komen daarom in de bestaande route-heads terecht, waar ze ook daadwerkelijk in de HTML worden opgenomen. De sociale afbeelding wordt alleen op openbare, deelbare pagina’s ingesteld en niet op afgeschermde schermen.

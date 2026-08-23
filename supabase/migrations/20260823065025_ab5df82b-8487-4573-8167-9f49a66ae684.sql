ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS with_kids boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS kids_count integer,
  ADD COLUMN IF NOT EXISTS kids_ages text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '';

DELETE FROM public.activities WHERE source = 'dagjeweg.nl' OR source_url ILIKE '%dagjeweg.nl%';

INSERT INTO public.activities
  (title, description, category, kind, image_key, is_public, creator_id, host_name, location_name, location_note, starts_at, lat, lng, with_kids, kids_count, kids_ages, notes, demo_attendees)
VALUES
  ('Samen naar de zaterdagmarkt', 'Rondje markt, verse stroopwafels en daarna koffie op het plein. Gezellig kennismaken zonder verplichtingen.', 'Eten & Koken', 'friendship', 'market', true, null, 'Dare2Meet', 'Vredenburg, Utrecht', 'We staan bij de kaaskraam', now() + interval '4 days' + interval '10 hours', 52.0907, 5.1214, false, null, '', 'Neem een tas mee, we lopen rustig.', '[{"name":"Sanne"},{"name":"Ruud"}]'::jsonb),
  ('Squashen voor beginners', 'Twee banen gereserveerd, we wisselen elk kwartier. Rackets zijn te huur bij de balie.', 'Sport & Bewegen', 'friendship', 'squash', true, null, 'Dare2Meet', 'Squashcentrum Amsterdam', 'Sportkleding en schone schoenen', now() + interval '6 days' + interval '19 hours', 52.3676, 4.9041, false, null, '', 'Niveau maakt niet uit, plezier staat voorop.', '[{"name":"Milan"},{"name":"Fatima"},{"name":"Joris"}]'::jsonb),
  ('Zwemmen met de kinderen', 'Anderhalf uur in het recreatiebad met glijbaan. Ouders kletsen aan de rand of gaan mee het water in.', 'Gezin & Kinderen', 'friendship', 'swim', true, null, 'Dare2Meet', 'Zwembad De Wiel, Rotterdam', 'Verzamelen bij de kassa', now() + interval '9 days' + interval '14 hours', 51.9244, 4.4777, true, 3, '4, 6 en 8 jaar', 'Zwemdiploma A is handig maar niet verplicht.', '[{"name":"Karin"},{"name":"Peter"}]'::jsonb),
  ('Citytrip naar Antwerpen', 'Dagje treinen, slenteren door de Kammenstraat en samen lunchen. Kosten deelt iedereen zelf.', 'Muziek & Cultuur', 'friendship', 'citytrip', true, null, 'Dare2Meet', 'Station Den Haag Centraal', 'Vertrek stipt om 08:30', now() + interval '17 days' + interval '8 hours', 52.0705, 4.3007, false, null, '', 'Neem een OV-chipkaart of e-ticket mee.', '[{"name":"Lieke"},{"name":"Tom"},{"name":"Nadia"}]'::jsonb);
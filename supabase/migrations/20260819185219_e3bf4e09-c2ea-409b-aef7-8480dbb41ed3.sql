
update public.activities set image_key = 'food' where is_public and title = 'Samen koken: Italiaanse avond';
update public.activities set image_key = 'sport' where is_public and title = 'Ochtendrondje hardlopen (5 km)';
update public.activities set image_key = 'family' where is_public and title = 'Gezinsmiddag in de speeltuin';
update public.activities set image_key = 'market' where is_public and title = 'Vinylmarkt en platen luisteren';
update public.activities set image_key = 'craft' where is_public and title = 'Klus- en creatiefcafé';
update public.activities set image_key = 'beach' where is_public and title = 'Zonsondergangwandeling op het strand';

insert into public.activities (title, description, category, kind, location_name, lat, lng, starts_at, max_participants, is_public, image_key, host_name, demo_attendees, cancelled)
values
 ('Kaasplank en whiskyproeverij', 'Vijf kazen, vier whisky''s en veel goede gesprekken. Rustige avond, gezellige tafel, iedereen welkom.', 'Eten & Koken', 'friendship', 'Bruine kroeg, Utrecht', 52.0907, 5.1214, now() + interval '5 days' + interval '19 hours', 12, true, 'tasting', 'Marleen', '[{"name":"Marleen"},{"name":"Ruben"},{"name":"Ilse"}]'::jsonb, false),
 ('Samen shoppen en koffie toe', 'Rondje winkelstraat, passen wat we nooit alleen zouden passen, en daarna koffie met gebak.', 'Koffie & Borrel', 'friendship', 'Binnenstad, Den Haag', 52.0787, 4.3106, now() + interval '9 days' + interval '13 hours', 10, true, 'shopping', 'Nadia', '[{"name":"Nadia"},{"name":"Esther"},{"name":"Kim"},{"name":"Lotte"}]'::jsonb, false),
 ('Pannenkoeken eten met de kids', 'Grote tafel in het pannenkoekenhuis, kinderen spelen, ouders kletsen. Simpel en leuk.', 'Gezin & Kinderen', 'friendship', 'Pannenkoekenhuis, Apeldoorn', 52.2112, 5.9699, now() + interval '15 days' + interval '12 hours', 16, true, 'pancake', 'Joost', '[{"name":"Joost"},{"name":"Bianca"},{"name":"Sem"}]'::jsonb, false);

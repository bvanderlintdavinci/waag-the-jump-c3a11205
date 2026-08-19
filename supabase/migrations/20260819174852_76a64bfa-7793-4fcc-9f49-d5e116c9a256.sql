ALTER TABLE public.activities
  ADD COLUMN image_key text NOT NULL DEFAULT 'social',
  ADD COLUMN is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN host_name text,
  ADD COLUMN demo_attendees jsonb NOT NULL DEFAULT '[]'::jsonb,
  ALTER COLUMN creator_id DROP NOT NULL;

GRANT SELECT ON public.activities TO anon;
GRANT SELECT ON public.activity_participants TO anon;

CREATE POLICY activities_select_public ON public.activities
  FOR SELECT TO anon
  USING (is_public = true AND cancelled = false);

CREATE POLICY ap_select_public ON public.activity_participants
  FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.activities a WHERE a.id = activity_id AND a.is_public = true));

INSERT INTO public.activities
  (title, description, category, kind, starts_at, location_name, lat, lng, max_participants, is_public, image_key, host_name, demo_attendees)
VALUES
  ('Herfstfestival op het Museumplein','Live foodtrucks, warme chocomel en een klein podium. We spreken af bij de ingang en waggelen samen naar binnen.','Muziek & Cultuur','friendship', date_trunc('day', now()) + interval '1 day' + interval '15 hours','Museumplein, Amsterdam',52.3580,4.8811,20,true,'festival','Sanne',
   '[{"name":"Sanne"},{"name":"Joris"},{"name":"Fatima"},{"name":"Bram"}]'::jsonb),
  ('Koffie-hotspot tour door de Jordaan','Drie specialty koffiebars in twee uur. Perfect als je nieuw bent in de stad.','Koffie & Borrel','friendship', date_trunc('day', now()) + interval '2 days' + interval '10 hours','Jordaan, Amsterdam',52.3747,4.8807,8,true,'coffee','Merel',
   '[{"name":"Merel"},{"name":"Tim"},{"name":"Yara"}]'::jsonb),
  ('Live muziek in het Bruine Café','Akoestische band, lage drempel, hoge gezelligheid. Eerste rondje is voor de dapperste pinguïn.','Muziek & Cultuur','friendship', date_trunc('day', now()) + interval '3 days' + interval '20 hours','Grote Markt, Nijmegen',51.8452,5.8625,12,true,'music','Ravi',
   '[{"name":"Ravi"},{"name":"Iris"},{"name":"Daan"},{"name":"Noor"},{"name":"Peter"}]'::jsonb),
  ('Zondagse motorrit langs de Maas','Ontspannen rit van 120 km met een koffiestop. Alle cilinders welkom.','Motorrijden','friendship', date_trunc('day', now()) + interval '4 days' + interval '9 hours','Roermond',51.1942,5.9870,10,true,'motor','Hans',
   '[{"name":"Hans"},{"name":"Wilma"},{"name":"Erik"}]'::jsonb),
  ('Boswandeling met koffie achteraf','Rustige wandeling van 7 km door de herfstkleuren, daarna appeltaart.','Wandelen & Natuur','friendship', date_trunc('day', now()) + interval '5 days' + interval '11 hours','Utrechtse Heuvelrug, Zeist',52.0907,5.2320,15,true,'nature','Petra',
   '[{"name":"Petra"},{"name":"Leon"},{"name":"Amira"},{"name":"Joost"}]'::jsonb),
  ('Spontane vrijdagborrel','Geen plan, gewoon opdagen. Herkenbaar aan de pinguïn-sticker op tafel.','Koffie & Borrel','friendship', date_trunc('day', now()) + interval '6 days' + interval '17 hours','Neude, Utrecht',52.0930,5.1210,25,true,'social','Kim',
   '[{"name":"Kim"},{"name":"Stefan"},{"name":"Lotte"},{"name":"Ahmed"},{"name":"Eva"},{"name":"Ruben"}]'::jsonb),
  ('Samen koken: Italiaanse avond','We koken met z''n allen pasta van scratch. Neem een schort mee.','Eten & Koken','friendship', date_trunc('day', now()) + interval '8 days' + interval '18 hours','Rotterdam Noord',51.9350,4.4700,10,true,'social','Giulia',
   '[{"name":"Giulia"},{"name":"Marco"},{"name":"Sanne"}]'::jsonb),
  ('Ochtendrondje hardlopen (5 km)','Rustig tempo, iedereen blijft bij elkaar. Daarna koffie bij de kiosk.','Sport & Bewegen','friendship', date_trunc('day', now()) + interval '9 days' + interval '8 hours','Vondelpark, Amsterdam',52.3580,4.8686,20,true,'nature','Bas',
   '[{"name":"Bas"},{"name":"Nadia"},{"name":"Tom"},{"name":"Sofie"}]'::jsonb),
  ('Gezinsmiddag in de speeltuin','Voor ouders met kids van 2 tot 8. Wafels en warme chocolademelk aanwezig.','Gezin & Kinderen','friendship', date_trunc('day', now()) + interval '10 days' + interval '14 hours','Griftpark, Utrecht',52.0995,5.1290,18,true,'social','Ilse',
   '[{"name":"Ilse"},{"name":"Marijn"},{"name":"Youssef"}]'::jsonb),
  ('Vinylmarkt en platen luisteren','Snuffelen tussen tweedehands platen, daarna luisteren bij de platenzaak.','Muziek & Cultuur','friendship', date_trunc('day', now()) + interval '11 days' + interval '13 hours','Haarlem Centrum',52.3810,4.6360,12,true,'music','Frank',
   '[{"name":"Frank"},{"name":"Robin"},{"name":"Anouk"}]'::jsonb),
  ('Lichtjesfestival langs de gracht','Wandelroute langs de lichtkunstwerken, met warme wijn onderweg.','Muziek & Cultuur','date', date_trunc('day', now()) + interval '13 days' + interval '19 hours','Prinsengracht, Amsterdam',52.3700,4.8830,16,true,'festival','Esther',
   '[{"name":"Esther"},{"name":"Vincent"},{"name":"Lieke"},{"name":"Karim"}]'::jsonb),
  ('Motorkoffie: ontbijt en rit','Eerst ontbijten, daarna een rondje Veluwe. Ook leuk als bijrijder.','Motorrijden','friendship', date_trunc('day', now()) + interval '15 days' + interval '9 hours','Apeldoorn',52.2110,5.9699,14,true,'motor','Dennis',
   '[{"name":"Dennis"},{"name":"Ellen"},{"name":"Jurgen"}]'::jsonb),
  ('Klus- en creatiefcafé','Neem je halfafgemaakte project mee: breien, hout, elektronica, alles mag.','Klussen & Creatief','friendship', date_trunc('day', now()) + interval '17 days' + interval '19 hours','Eindhoven Strijp-S',51.4470,5.4560,12,true,'social','Wendy',
   '[{"name":"Wendy"},{"name":"Sem"},{"name":"Fenna"}]'::jsonb),
  ('Zonsondergangwandeling op het strand','Rustige wandeling langs de vloedlijn, daarna soep in het strandpaviljoen.','Wandelen & Natuur','date', date_trunc('day', now()) + interval '20 days' + interval '17 hours','Scheveningen, Den Haag',52.1080,4.2740,12,true,'nature','Maud',
   '[{"name":"Maud"},{"name":"Olivier"},{"name":"Nina"}]'::jsonb);
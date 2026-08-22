CREATE TABLE public.external_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source text NOT NULL,
  source_url text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  category text,
  city text,
  location_name text,
  starts_at timestamptz NOT NULL,
  image_url text,
  lat double precision,
  lng double precision,
  imported_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.external_events TO anon;
GRANT SELECT ON public.external_events TO authenticated;
GRANT ALL ON public.external_events TO service_role;

ALTER TABLE public.external_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Externe events zijn openbaar leesbaar"
ON public.external_events FOR SELECT
TO anon, authenticated
USING (true);

CREATE INDEX external_events_starts_at_idx ON public.external_events (starts_at);
CREATE INDEX external_events_city_idx ON public.external_events (city);
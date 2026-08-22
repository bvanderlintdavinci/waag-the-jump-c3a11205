ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS image_url text;

CREATE UNIQUE INDEX IF NOT EXISTS activities_source_url_key ON public.activities (source_url) WHERE source_url IS NOT NULL;

DROP TABLE IF EXISTS public.external_events;
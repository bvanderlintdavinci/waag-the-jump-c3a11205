ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS consent_at timestamptz;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS location_note text NOT NULL DEFAULT '';
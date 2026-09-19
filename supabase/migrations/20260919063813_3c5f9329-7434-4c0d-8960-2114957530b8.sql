CREATE TABLE IF NOT EXISTS public.site_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  page_views integer NOT NULL DEFAULT 1,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.site_sessions TO service_role;

ALTER TABLE public.site_sessions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS site_sessions_first_seen_idx ON public.site_sessions (first_seen_at);
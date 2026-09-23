ALTER TABLE public.profile_visits ADD COLUMN IF NOT EXISTS duration_seconds integer NOT NULL DEFAULT 0;
GRANT UPDATE (duration_seconds) ON public.profile_visits TO authenticated;
CREATE POLICY visits_update_own_duration ON public.profile_visits FOR UPDATE TO authenticated
  USING (visitor_id = auth.uid()) WITH CHECK (visitor_id = auth.uid());
-- Visitors are only revealed through a paid snapshot
DROP POLICY IF EXISTS visits_select_own_profile ON public.profile_visits;
CREATE POLICY visits_select_admin ON public.profile_visits FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.visitor_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  checkout_session_id text NOT NULL UNIQUE,
  environment text NOT NULL,
  visitors jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.visitor_snapshots TO authenticated;
GRANT ALL ON public.visitor_snapshots TO service_role;
ALTER TABLE public.visitor_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY snapshots_select_own ON public.visitor_snapshots FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE INDEX idx_visitor_snapshots_user ON public.visitor_snapshots(user_id, created_at DESC);
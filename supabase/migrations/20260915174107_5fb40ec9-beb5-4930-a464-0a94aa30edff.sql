-- 1. activities: ends_at + status
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'open';

-- 2. activity_participants: group size preference + time slot
ALTER TABLE public.activity_participants
  ADD COLUMN IF NOT EXISTS max_group_preference integer,
  ADD COLUMN IF NOT EXISTS slot_note text NOT NULL DEFAULT '';

-- 3. profiles: phone + visibility
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS phone_visibility text NOT NULL DEFAULT 'none';

-- 4. activity_requests
CREATE TABLE IF NOT EXISTS public.activity_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (activity_id, requester_id)
);
GRANT SELECT, INSERT, UPDATE ON public.activity_requests TO authenticated;
GRANT ALL ON public.activity_requests TO service_role;
ALTER TABLE public.activity_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "requests_select_own_or_organiser" ON public.activity_requests
  FOR SELECT TO authenticated
  USING (
    requester_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.activities a WHERE a.id = activity_id AND a.creator_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "requests_insert_own" ON public.activity_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    requester_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = activity_id
        AND a.cancelled = false
        AND a.status = 'open'
        AND a.creator_id IS NOT NULL
        AND a.creator_id <> auth.uid()
        AND NOT public.is_blocked(auth.uid(), a.creator_id)
    )
  );
CREATE POLICY "requests_update_organiser" ON public.activity_requests
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.activities a WHERE a.id = activity_id AND a.creator_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.activities a WHERE a.id = activity_id AND a.creator_id = auth.uid()));

CREATE TRIGGER activity_requests_touch BEFORE UPDATE ON public.activity_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- close the activity when a request is accepted
CREATE OR REPLACE FUNCTION public.handle_request_accept()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted' AND COALESCE(OLD.status, '') <> 'accepted' THEN
    UPDATE public.activities SET status = 'fulfilled' WHERE id = NEW.activity_id;
    UPDATE public.activity_requests
      SET status = 'declined'
      WHERE activity_id = NEW.activity_id AND id <> NEW.id AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_request_accept() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_request_accept() TO service_role;

CREATE TRIGGER activity_requests_accept AFTER UPDATE ON public.activity_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_request_accept();

-- 5. favorites
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, favorite_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_own" ON public.favorites
  FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid() AND favorite_id <> auth.uid());

-- 6. connections
CREATE TABLE IF NOT EXISTS public.connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (requester_id, addressee_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connections TO authenticated;
GRANT ALL ON public.connections TO service_role;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "connections_select_involved" ON public.connections
  FOR SELECT TO authenticated USING (requester_id = auth.uid() OR addressee_id = auth.uid());
CREATE POLICY "connections_insert_own" ON public.connections
  FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid() AND addressee_id <> auth.uid() AND NOT public.is_blocked(auth.uid(), addressee_id));
CREATE POLICY "connections_update_addressee" ON public.connections
  FOR UPDATE TO authenticated USING (addressee_id = auth.uid()) WITH CHECK (addressee_id = auth.uid());
CREATE POLICY "connections_delete_involved" ON public.connections
  FOR DELETE TO authenticated USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE TRIGGER connections_touch BEFORE UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 7. profile_children
CREATE TABLE IF NOT EXISTS public.profile_children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  gender text NOT NULL DEFAULT 'anders',
  birth_year integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_children TO authenticated;
GRANT ALL ON public.profile_children TO service_role;
ALTER TABLE public.profile_children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "children_select_members" ON public.profile_children
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = profile_id
        AND p.deleted_at IS NULL
        AND p.shadowbanned = false
        AND NOT public.is_blocked(auth.uid(), p.id)
    )
  );
CREATE POLICY "children_manage_own" ON public.profile_children
  FOR ALL TO authenticated USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

CREATE INDEX IF NOT EXISTS profile_children_profile_idx ON public.profile_children(profile_id);
CREATE INDEX IF NOT EXISTS activity_requests_activity_idx ON public.activity_requests(activity_id);
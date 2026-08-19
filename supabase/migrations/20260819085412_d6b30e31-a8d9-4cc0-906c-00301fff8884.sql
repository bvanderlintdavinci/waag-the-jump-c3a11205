-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
CREATE TYPE public.intent_type AS ENUM ('friendship','dating','both');
CREATE TYPE public.activity_kind AS ENUM ('friendship','date');

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL DEFAULT '',
  birth_date date,
  city text NOT NULL DEFAULT '',
  postcode text,
  lat double precision,
  lng double precision,
  bio text NOT NULL DEFAULT '',
  avatar_url text,
  gender text,
  intent public.intent_type NOT NULL DEFAULT 'both',
  interests text[] NOT NULL DEFAULT '{}',
  lgbtq_badge boolean NOT NULL DEFAULT false,
  lgbtq_consent boolean NOT NULL DEFAULT false,
  consent_terms boolean NOT NULL DEFAULT false,
  consent_privacy boolean NOT NULL DEFAULT false,
  consent_visibility boolean NOT NULL DEFAULT false,
  consent_law_enforcement boolean NOT NULL DEFAULT false,
  onboarded boolean NOT NULL DEFAULT false,
  shadowbanned boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  purge_after timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- BLOCKS
CREATE TABLE public.blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id)
);
GRANT SELECT, INSERT, DELETE ON public.blocks TO authenticated;
GRANT ALL ON public.blocks TO service_role;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_blocked(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blocks
    WHERE (blocker_id = _a AND blocked_id = _b) OR (blocker_id = _b AND blocked_id = _a)
  )
$$;

-- PROFILE POLICIES
CREATE POLICY "profiles_select_visible" ON public.profiles FOR SELECT TO authenticated
USING (
  id = auth.uid()
  OR public.has_role(auth.uid(),'admin')
  OR (deleted_at IS NULL AND shadowbanned = false AND NOT public.is_blocked(auth.uid(), id))
);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "blocks_select_own" ON public.blocks FOR SELECT TO authenticated USING (blocker_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "blocks_insert_own" ON public.blocks FOR INSERT TO authenticated WITH CHECK (blocker_id = auth.uid() AND blocked_id <> auth.uid());
CREATE POLICY "blocks_delete_own" ON public.blocks FOR DELETE TO authenticated USING (blocker_id = auth.uid());

-- ACTIVITIES
CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Overig',
  kind public.activity_kind NOT NULL DEFAULT 'friendship',
  starts_at timestamptz NOT NULL,
  location_name text NOT NULL DEFAULT '',
  lat double precision,
  lng double precision,
  max_participants integer,
  cancelled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities_select" ON public.activities FOR SELECT TO authenticated
USING (creator_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR NOT public.is_blocked(auth.uid(), creator_id));
CREATE POLICY "activities_insert_own" ON public.activities FOR INSERT TO authenticated WITH CHECK (creator_id = auth.uid());
CREATE POLICY "activities_update_own" ON public.activities FOR UPDATE TO authenticated USING (creator_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (creator_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "activities_delete_own" ON public.activities FOR DELETE TO authenticated USING (creator_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- CONVERSATIONS
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES public.activities(id) ON DELETE CASCADE,
  is_group boolean NOT NULL DEFAULT false,
  title text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.conversation_participants TO authenticated;
GRANT ALL ON public.conversation_participants TO service_role;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_conversation_member(_conversation_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = _conversation_id AND user_id = _user_id)
$$;

CREATE POLICY "conversations_select_member" ON public.conversations FOR SELECT TO authenticated
USING (public.is_conversation_member(id, auth.uid()) OR created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "conversations_insert_own" ON public.conversations FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "cp_select_member" ON public.conversation_participants FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_conversation_member(conversation_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "cp_insert" ON public.conversation_participants FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.created_by = auth.uid())
);
CREATE POLICY "cp_delete_own" ON public.conversation_participants FOR DELETE TO authenticated USING (user_id = auth.uid());

-- MESSAGES
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_select_member" ON public.messages FOR SELECT TO authenticated
USING (public.is_conversation_member(conversation_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "messages_insert_member" ON public.messages FOR INSERT TO authenticated
WITH CHECK (sender_id = auth.uid() AND public.is_conversation_member(conversation_id, auth.uid()));

-- ACTIVITY PARTICIPANTS
CREATE TABLE public.activity_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (activity_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.activity_participants TO authenticated;
GRANT ALL ON public.activity_participants TO service_role;
ALTER TABLE public.activity_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ap_select" ON public.activity_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "ap_insert_own" ON public.activity_participants FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "ap_delete_own" ON public.activity_participants FOR DELETE TO authenticated USING (user_id = auth.uid());

-- REPORTS
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context text NOT NULL DEFAULT 'profile',
  reason text NOT NULL,
  details text,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_select" ON public.reports FOR SELECT TO authenticated USING (reporter_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "reports_insert_own" ON public.reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid() AND reported_user_id <> auth.uid());
CREATE POLICY "reports_update_admin" ON public.reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.auto_shadowban()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.reports WHERE reported_user_id = NEW.reported_user_id AND resolved = false) >= 2 THEN
    UPDATE public.profiles SET shadowbanned = true WHERE id = NEW.reported_user_id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER reports_auto_shadowban AFTER INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.auto_shadowban();

-- MODERATION LOGS
CREATE TABLE public.moderation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  field text NOT NULL DEFAULT 'unknown',
  content text NOT NULL,
  matched_terms text[] NOT NULL DEFAULT '{}',
  severity text NOT NULL DEFAULT 'high',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.moderation_logs TO authenticated;
GRANT ALL ON public.moderation_logs TO service_role;
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modlogs_insert_own" ON public.moderation_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "modlogs_select_admin" ON public.moderation_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- PROFILE VISITS
CREATE TABLE public.profile_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.profile_visits TO authenticated;
GRANT ALL ON public.profile_visits TO service_role;
ALTER TABLE public.profile_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "visits_insert_own" ON public.profile_visits FOR INSERT TO authenticated WITH CHECK (visitor_id = auth.uid() AND profile_id <> auth.uid());
CREATE POLICY "visits_select_own_profile" ON public.profile_visits FOR SELECT TO authenticated USING (profile_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.visit_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.visit_unlocks TO authenticated;
GRANT ALL ON public.visit_unlocks TO service_role;
ALTER TABLE public.visit_unlocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unlocks_select_own" ON public.visit_unlocks FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- DELETION REQUESTS
CREATE TABLE public.deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  reason text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  purge_after timestamptz NOT NULL DEFAULT (now() + interval '30 days')
);
GRANT SELECT, INSERT ON public.deletion_requests TO authenticated;
GRANT ALL ON public.deletion_requests TO service_role;
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "delreq_select" ON public.deletion_requests FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "delreq_insert_own" ON public.deletion_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- NEW USER TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- REALTIME
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
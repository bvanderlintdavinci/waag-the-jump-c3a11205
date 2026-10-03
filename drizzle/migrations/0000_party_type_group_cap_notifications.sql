ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS party_type text NOT NULL DEFAULT 'solo',
  ADD COLUMN IF NOT EXISTS party_adults integer NOT NULL DEFAULT 1;

CREATE OR REPLACE FUNCTION public.validate_activity_party()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.creator_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.party_type NOT IN ('solo','other_person','couple','group') THEN
    RAISE EXCEPTION 'Ongeldig type gezelschap.';
  END IF;
  IF NEW.party_adults < 1 OR NEW.party_adults > 15 THEN
    RAISE EXCEPTION 'Een groep is maximaal 15 personen.';
  END IF;
  IF NEW.party_adults + COALESCE(CASE WHEN NEW.with_kids THEN NEW.kids_count END, 0) > 15 THEN
    RAISE EXCEPTION 'Een groep is maximaal 15 personen, kinderen meegeteld.';
  END IF;
  IF NEW.max_participants IS NULL OR NEW.max_participants > 15 THEN
    NEW.max_participants := 15;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS validate_activity_party ON public.activities;
CREATE TRIGGER validate_activity_party BEFORE INSERT OR UPDATE ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.validate_activity_party();

CREATE OR REPLACE FUNCTION public.enforce_group_cap()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a record; cnt integer;
BEGIN
  SELECT * INTO a FROM public.activities WHERE id = NEW.activity_id;
  IF a.creator_id IS NULL THEN RETURN NEW; END IF;
  SELECT count(*) INTO cnt FROM public.activity_participants WHERE activity_id = NEW.activity_id AND user_id <> a.creator_id;
  IF a.party_adults + COALESCE(CASE WHEN a.with_kids THEN a.kids_count END, 0) + cnt + 1 > 15 THEN
    RAISE EXCEPTION 'Dit Waagje is vol: groepen zijn maximaal 15 personen.';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS enforce_group_cap ON public.activity_participants;
CREATE TRIGGER enforce_group_cap BEFORE INSERT ON public.activity_participants
FOR EACH ROW EXECUTE FUNCTION public.enforce_group_cap();

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  activity_id uuid REFERENCES public.activities(id) ON DELETE CASCADE,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notif_select_own ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY notif_update_own ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY notif_delete_own ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX notifications_user_idx ON public.notifications(user_id, created_at DESC);
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

CREATE OR REPLACE FUNCTION public.notify_activity_cancelled()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.cancelled AND NOT OLD.cancelled THEN
    INSERT INTO public.notifications (user_id, title, body, activity_id)
    SELECT DISTINCT u, 'Waagje geannuleerd', 'Het Waagje "' || NEW.title || '" is door de plaatser geannuleerd.', NEW.id
    FROM (
      SELECT user_id AS u FROM public.activity_participants WHERE activity_id = NEW.id
      UNION SELECT requester_id FROM public.activity_requests WHERE activity_id = NEW.id AND status IN ('pending','accepted')
    ) s WHERE u IS NOT NULL AND u <> NEW.creator_id;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS notify_activity_cancelled ON public.activities;
CREATE TRIGGER notify_activity_cancelled AFTER UPDATE OF cancelled ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.notify_activity_cancelled();

CREATE OR REPLACE FUNCTION public.notify_participant_left()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a record;
BEGIN
  SELECT id, title, creator_id, cancelled INTO a FROM public.activities WHERE id = OLD.activity_id;
  IF a.id IS NOT NULL AND a.creator_id IS NOT NULL AND a.creator_id <> OLD.user_id AND NOT a.cancelled THEN
    INSERT INTO public.notifications (user_id, title, body, activity_id)
    VALUES (a.creator_id, 'Afmelding', 'Iemand heeft zich afgemeld voor "' || a.title || '".', a.id);
  END IF;
  RETURN OLD;
END $$;
DROP TRIGGER IF EXISTS notify_participant_left ON public.activity_participants;
CREATE TRIGGER notify_participant_left AFTER DELETE ON public.activity_participants
FOR EACH ROW EXECUTE FUNCTION public.notify_participant_left();

REVOKE EXECUTE ON FUNCTION public.notify_activity_cancelled() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_participant_left() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_group_cap() FROM PUBLIC, anon, authenticated;
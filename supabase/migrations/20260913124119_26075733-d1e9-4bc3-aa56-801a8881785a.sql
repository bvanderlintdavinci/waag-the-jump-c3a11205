DROP POLICY IF EXISTS "ap_select" ON public.activity_participants;
CREATE POLICY "ap_select_relevant" ON public.activity_participants
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.activities a
    WHERE a.id = activity_participants.activity_id
      AND a.creator_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.activity_participants mine
    WHERE mine.activity_id = activity_participants.activity_id
      AND mine.user_id = auth.uid()
  )
);

CREATE OR REPLACE FUNCTION public.validate_activity_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  activity_row public.activities%ROWTYPE;
  participant_count integer;
BEGIN
  SELECT * INTO activity_row
  FROM public.activities
  WHERE id = NEW.activity_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Deze activiteit bestaat niet meer.';
  END IF;
  IF activity_row.cancelled THEN
    RAISE EXCEPTION 'Deze activiteit is geannuleerd.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.activity_participants
    WHERE activity_id = NEW.activity_id AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Je bent al aangemeld voor deze activiteit.';
  END IF;

  IF activity_row.max_participants IS NOT NULL THEN
    SELECT count(*) INTO participant_count
    FROM public.activity_participants
    WHERE activity_id = NEW.activity_id;
    IF participant_count >= activity_row.max_participants THEN
      RAISE EXCEPTION 'Deze activiteit is vol.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.validate_activity_join() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_activity_join() TO service_role;
DROP TRIGGER IF EXISTS activity_join_validation ON public.activity_participants;
CREATE TRIGGER activity_join_validation
BEFORE INSERT ON public.activity_participants
FOR EACH ROW EXECUTE FUNCTION public.validate_activity_join();

DROP POLICY IF EXISTS "cp_insert" ON public.conversation_participants;
CREATE POLICY "cp_insert_authorized" ON public.conversation_participants
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND c.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.conversations c
      JOIN public.activity_participants ap ON ap.activity_id = c.activity_id
      WHERE c.id = conversation_id AND ap.user_id = auth.uid()
    )
  )
  OR EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
      AND c.created_by = auth.uid()
      AND c.is_group = false
      AND NOT public.is_blocked(auth.uid(), user_id)
  )
);

CREATE OR REPLACE FUNCTION public.validate_message_block()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.conversations c
    JOIN public.conversation_participants cp ON cp.conversation_id = c.id
    WHERE c.id = NEW.conversation_id
      AND c.is_group = false
      AND cp.user_id <> NEW.sender_id
      AND public.is_blocked(NEW.sender_id, cp.user_id)
  ) THEN
    RAISE EXCEPTION 'Berichten versturen is niet mogelijk omdat een van jullie de ander heeft geblokkeerd.';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.validate_message_block() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_message_block() TO service_role;
DROP TRIGGER IF EXISTS message_block_validation ON public.messages;
CREATE TRIGGER message_block_validation
BEFORE INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.validate_message_block();
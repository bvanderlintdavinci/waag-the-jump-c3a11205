ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS meetup jsonb,
  ADD COLUMN IF NOT EXISTS read_at timestamptz;

CREATE OR REPLACE FUNCTION public.mark_conversation_read(_conversation_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_conversation_member(_conversation_id, auth.uid()) THEN RETURN; END IF;
  UPDATE public.messages SET read_at = now()
  WHERE conversation_id = _conversation_id AND sender_id <> auth.uid() AND read_at IS NULL;
END $$;

CREATE OR REPLACE FUNCTION public.respond_meetup(_message_id uuid, _status text, _proposed_at timestamptz DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m public.messages%ROWTYPE;
BEGIN
  IF _status NOT IN ('accepted','declined','rescheduled') THEN RAISE EXCEPTION 'Ongeldige status.'; END IF;
  SELECT * INTO m FROM public.messages WHERE id = _message_id AND kind = 'meetup';
  IF NOT FOUND OR NOT public.is_conversation_member(m.conversation_id, auth.uid()) THEN
    RAISE EXCEPTION 'Uitnodiging niet gevonden.';
  END IF;
  IF m.sender_id = auth.uid() AND _status <> 'rescheduled' THEN
    RAISE EXCEPTION 'Je kunt je eigen voorstel niet beantwoorden.';
  END IF;
  UPDATE public.messages SET meetup = COALESCE(meetup,'{}'::jsonb)
    || jsonb_build_object('status', _status, 'responded_by', auth.uid(), 'responded_at', now())
    || CASE WHEN _proposed_at IS NOT NULL THEN jsonb_build_object('proposed_at', _proposed_at) ELSE '{}'::jsonb END
  WHERE id = _message_id;
END $$;

REVOKE ALL ON FUNCTION public.mark_conversation_read(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.respond_meetup(uuid, text, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_conversation_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_meetup(uuid, text, timestamptz) TO authenticated;
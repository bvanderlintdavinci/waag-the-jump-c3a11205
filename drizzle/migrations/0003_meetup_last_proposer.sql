CREATE OR REPLACE FUNCTION public.respond_meetup(_message_id uuid, _status text, _proposed_at timestamptz DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m public.messages%ROWTYPE; proposer uuid;
BEGIN
  IF _status NOT IN ('accepted','declined','rescheduled') THEN RAISE EXCEPTION 'Ongeldige status.'; END IF;
  SELECT * INTO m FROM public.messages WHERE id = _message_id AND kind = 'meetup';
  IF NOT FOUND OR NOT public.is_conversation_member(m.conversation_id, auth.uid()) THEN
    RAISE EXCEPTION 'Uitnodiging niet gevonden.';
  END IF;
  proposer := COALESCE((m.meetup->>'proposed_by')::uuid, m.sender_id);
  IF proposer = auth.uid() THEN RAISE EXCEPTION 'Wacht op een reactie van de ander.'; END IF;
  IF COALESCE(m.meetup->>'status','pending') IN ('accepted','declined') THEN RAISE EXCEPTION 'Deze uitnodiging is al beantwoord.'; END IF;
  IF _status = 'rescheduled' AND _proposed_at IS NULL THEN RAISE EXCEPTION 'Kies een nieuwe datum.'; END IF;
  UPDATE public.messages SET meetup = COALESCE(meetup,'{}'::jsonb)
    || jsonb_build_object('status', _status, 'responded_by', auth.uid(), 'responded_at', now())
    || CASE WHEN _status = 'rescheduled' THEN jsonb_build_object('proposed_at', _proposed_at, 'proposed_by', auth.uid()) ELSE '{}'::jsonb END
  WHERE id = _message_id;
END $$;
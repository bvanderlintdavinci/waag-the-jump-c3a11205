GRANT DELETE ON public.activity_requests TO authenticated;
CREATE POLICY requests_delete_own ON public.activity_requests FOR DELETE TO authenticated USING (requester_id = auth.uid());

CREATE OR REPLACE FUNCTION public.notify_request_withdrawn()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a record;
BEGIN
  SELECT id, title, creator_id, cancelled INTO a FROM public.activities WHERE id = OLD.activity_id;
  IF a.id IS NOT NULL AND a.creator_id IS NOT NULL AND NOT a.cancelled AND OLD.status IN ('pending','accepted') THEN
    INSERT INTO public.notifications (user_id, title, body, activity_id)
    VALUES (a.creator_id, 'Afmelding', 'Iemand heeft zijn aanvraag voor "' || a.title || '" ingetrokken.', a.id);
    IF OLD.status = 'accepted' THEN
      UPDATE public.activities SET status = 'open' WHERE id = a.id AND status = 'fulfilled';
    END IF;
  END IF;
  RETURN OLD;
END $$;
REVOKE EXECUTE ON FUNCTION public.notify_request_withdrawn() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER notify_request_withdrawn AFTER DELETE ON public.activity_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_request_withdrawn();

CREATE TABLE public.feedback_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  kind text NOT NULL CHECK (kind IN ('idea','abuse')),
  email text,
  message text NOT NULL CHECK (char_length(message) BETWEEN 3 AND 2000),
  handled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.feedback_messages TO authenticated;
GRANT INSERT ON public.feedback_messages TO anon;
GRANT ALL ON public.feedback_messages TO service_role;

ALTER TABLE public.feedback_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can send feedback" ON public.feedback_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read feedback" ON public.feedback_messages
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "admins update feedback" ON public.feedback_messages
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE OR REPLACE FUNCTION public.enforce_monthly_activity_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cnt integer;
BEGIN
  IF NEW.creator_id IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT count(*) INTO cnt
  FROM public.activities
  WHERE creator_id = NEW.creator_id
    AND created_at >= date_trunc('month', now());
  IF cnt >= 2 THEN
    RAISE EXCEPTION 'Je kunt maximaal 2 Waagjes per maand plaatsen.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER activities_monthly_limit
BEFORE INSERT ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.enforce_monthly_activity_limit();

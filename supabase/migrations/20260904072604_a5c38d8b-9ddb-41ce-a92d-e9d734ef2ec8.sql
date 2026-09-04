CREATE TABLE public.email_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template text NOT NULL DEFAULT 'onbekend',
  status text NOT NULL DEFAULT 'queued',
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.email_log TO authenticated;
GRANT ALL ON public.email_log TO service_role;
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "email_log_select_admin" ON public.email_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX email_log_created_at_idx ON public.email_log (created_at DESC);
CREATE TRIGGER email_log_touch BEFORE UPDATE ON public.email_log FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
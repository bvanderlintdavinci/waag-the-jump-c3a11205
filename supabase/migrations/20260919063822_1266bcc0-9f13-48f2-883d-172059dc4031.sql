GRANT SELECT ON public.site_sessions TO authenticated;

CREATE POLICY "Admins kunnen bezoekstatistieken bekijken"
ON public.site_sessions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
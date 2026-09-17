DROP POLICY IF EXISTS activities_select ON public.activities;
CREATE POLICY activities_select
ON public.activities
FOR SELECT
TO authenticated
USING (
  creator_id = auth.uid()
  OR private.has_role(auth.uid(), 'admin'::app_role)
  OR (
    is_public = true
    AND cancelled = false
    AND NOT private.is_blocked(auth.uid(), creator_id)
  )
  OR EXISTS (
    SELECT 1
    FROM public.activity_participants ap
    WHERE ap.activity_id = activities.id
      AND ap.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS avatars_read_authenticated ON storage.objects;
CREATE POLICY avatars_read_visible_profiles
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR private.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND p.deleted_at IS NULL
        AND p.shadowbanned = false
        AND NOT private.is_blocked(auth.uid(), p.id)
    )
  )
);
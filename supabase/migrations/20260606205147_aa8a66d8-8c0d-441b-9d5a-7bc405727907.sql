-- Replace the over-broad "any authenticated user" read policy on academy-templates
DROP POLICY IF EXISTS "Authenticated can read academy templates" ON storage.objects;

CREATE POLICY "Academy template entitled users can read"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'academy-templates'
    AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR EXISTS (
        SELECT 1 FROM public.academy_certificates c
        WHERE c.user_id = auth.uid()
      )
    )
  );
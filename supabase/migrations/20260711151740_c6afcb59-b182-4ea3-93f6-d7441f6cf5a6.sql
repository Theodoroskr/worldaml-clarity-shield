
CREATE POLICY "Toolkit entitled users can read academy templates"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'academy-templates'
  AND (
    EXISTS (
      SELECT 1 FROM public.academy_certificates
      WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.academy_course_purchases
      WHERE user_id = auth.uid()
        AND course_slug = '__annual_pass__'
        AND status = 'paid'
        AND (expires_at IS NULL OR expires_at > now())
    )
  )
);

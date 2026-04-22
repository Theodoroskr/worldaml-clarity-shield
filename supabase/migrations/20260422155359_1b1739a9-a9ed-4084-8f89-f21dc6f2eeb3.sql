
INSERT INTO storage.buckets (id, name, public)
VALUES ('academy-templates', 'academy-templates', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can read academy templates" ON storage.objects;
CREATE POLICY "Public can read academy templates"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'academy-templates');

DROP POLICY IF EXISTS "Admins manage academy templates" ON storage.objects;
CREATE POLICY "Admins manage academy templates"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'academy-templates' AND has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'academy-templates' AND has_role(auth.uid(), 'admin'::app_role));

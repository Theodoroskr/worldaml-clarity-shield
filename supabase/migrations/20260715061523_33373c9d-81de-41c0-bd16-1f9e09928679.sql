
-- Partners can read files that are referenced by an asset row they can see
CREATE POLICY "Partners read partner-assets files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'partner-assets'
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (
        SELECT 1 FROM public.partner_assets pa
        WHERE pa.file_path = storage.objects.name
          AND pa.is_active = true
          AND public.current_partner_cert_level() IS NOT NULL
          AND public.cert_rank(public.current_partner_cert_level()) >= public.cert_rank(pa.certification_min)
      )
    )
  );

CREATE POLICY "Admin uploads partner-assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'partner-assets' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin updates partner-assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'partner-assets' AND public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'partner-assets' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin deletes partner-assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'partner-assets' AND public.has_role(auth.uid(), 'admin'::app_role));

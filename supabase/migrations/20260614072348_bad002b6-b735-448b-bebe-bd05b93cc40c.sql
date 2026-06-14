-- 1) Hide Stripe IDs from anon + authenticated on academy_courses.
--    Edge functions use service_role and keep full access.
REVOKE SELECT (stripe_price_id, stripe_product_id) ON public.academy_courses FROM anon;
REVOKE SELECT (stripe_price_id, stripe_product_id) ON public.academy_courses FROM authenticated;

-- 2) Tighten SoF upload storage policy: require org membership of the
--    declaration referenced by the path's third segment (declaration_id).
--    Path format: sof/<userId>/<declarationId>/<filename>
DROP POLICY IF EXISTS "Users can upload own SoF docs" ON storage.objects;

CREATE POLICY "Users can upload own SoF docs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'customer-documents'
  AND (storage.foldername(name))[1] = 'sof'
  AND (storage.foldername(name))[2] = auth.uid()::text
  AND owner = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.suite_sof_declarations d
    JOIN public.suite_org_members m ON m.organization_id = d.organisation_id
    WHERE d.id::text = (storage.foldername(name))[3]
      AND m.user_id = auth.uid()
  )
);
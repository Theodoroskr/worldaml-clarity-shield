DROP POLICY IF EXISTS "customer-documents prefix allowlist" ON storage.objects;

CREATE POLICY "customer-documents prefix allowlist"
ON storage.objects
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (
  bucket_id <> 'customer-documents'
  OR (storage.foldername(name))[1] = ANY (ARRAY['sof','customers'])
)
WITH CHECK (
  bucket_id <> 'customer-documents'
  OR (storage.foldername(name))[1] = ANY (ARRAY['sof','customers'])
);

DROP POLICY IF EXISTS "Org and portal users read customer docs" ON storage.objects;
CREATE POLICY "Org and portal users read customer docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'customer-documents'
  AND (storage.foldername(name))[1] = 'customers'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR owner = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.suite_customer_documents d
      WHERE d.file_path = storage.objects.name
        AND (
          d.organisation_id IN (SELECT public.get_user_org_ids(auth.uid()))
          OR public.is_portal_user_of(d.customer_id)
        )
    )
    OR (
      (storage.foldername(name))[2] ~ '^[0-9a-fA-F-]{36}$'
      AND ((storage.foldername(name))[2])::uuid IN (SELECT public.get_user_org_ids(auth.uid()))
    )
    OR (
      (storage.foldername(name))[3] ~ '^[0-9a-fA-F-]{36}$'
      AND public.is_portal_user_of(((storage.foldername(name))[3])::uuid)
    )
  )
);

DROP POLICY IF EXISTS "Org and portal users upload customer docs" ON storage.objects;
CREATE POLICY "Org and portal users upload customer docs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'customer-documents'
  AND (storage.foldername(name))[1] = 'customers'
  AND (storage.foldername(name))[2] ~ '^[0-9a-fA-F-]{36}$'
  AND (storage.foldername(name))[3] ~ '^[0-9a-fA-F-]{36}$'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR ((storage.foldername(name))[2])::uuid IN (SELECT public.get_user_org_ids(auth.uid()))
    OR public.is_portal_user_of(((storage.foldername(name))[3])::uuid)
  )
);

DROP POLICY IF EXISTS "Org members delete customer docs" ON storage.objects;
CREATE POLICY "Org members delete customer docs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'customer-documents'
  AND (storage.foldername(name))[1] = 'customers'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR (
      (storage.foldername(name))[2] ~ '^[0-9a-fA-F-]{36}$'
      AND ((storage.foldername(name))[2])::uuid IN (SELECT public.get_user_org_ids(auth.uid()))
    )
  )
);
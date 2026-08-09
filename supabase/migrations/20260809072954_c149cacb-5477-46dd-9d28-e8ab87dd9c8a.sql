-- 1. Customer documents: tenant/ownership immutability on UPDATE ------------
CREATE OR REPLACE FUNCTION public.suite_customer_documents_immutable_scope()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.organisation_id IS DISTINCT FROM OLD.organisation_id
     OR NEW.customer_id IS DISTINCT FROM OLD.customer_id
     OR NEW.file_path IS DISTINCT FROM OLD.file_path
     OR NEW.uploaded_by IS DISTINCT FROM OLD.uploaded_by THEN
    RAISE EXCEPTION 'Customer documents cannot be reassigned to another organisation, customer, uploader or file path';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_suite_customer_documents_immutable_scope ON public.suite_customer_documents;
CREATE TRIGGER trg_suite_customer_documents_immutable_scope
BEFORE UPDATE ON public.suite_customer_documents
FOR EACH ROW EXECUTE FUNCTION public.suite_customer_documents_immutable_scope();

DROP POLICY IF EXISTS "org members update customer docs" ON public.suite_customer_documents;
CREATE POLICY "org members update customer docs"
ON public.suite_customer_documents
FOR UPDATE
TO authenticated
USING (
  organisation_id IN (SELECT public.get_user_org_ids(auth.uid()))
  OR user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  organisation_id IN (SELECT public.get_user_org_ids(auth.uid()))
  OR user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- 2. Storage read for customer docs: always verify via the document join -----
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
  )
);

-- 3. Public onboarding uploads: strict path + file type -----------------------
DROP POLICY IF EXISTS "public can upload onboarding docs to active forms" ON storage.objects;
CREATE POLICY "public can upload onboarding docs to active forms"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'onboarding-submissions'
  AND array_length(storage.foldername(name), 1) = 2
  AND (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
  AND (storage.foldername(name))[2] ~ '^[a-zA-Z0-9_-]{1,64}$'
  AND lower(name) ~ '\.(pdf|png|jpg|jpeg|webp|heic|doc|docx|xls|xlsx|csv|txt)$'
  AND length(name) <= 512
  AND EXISTS (
    SELECT 1 FROM public.suite_onboarding_forms f
    WHERE f.id::text = (storage.foldername(storage.objects.name))[1]
      AND f.is_active = true
  )
);

-- 4. RCM organisations: enforce validation invariants at the RLS layer --------
DROP POLICY IF EXISTS "auth_create_org" ON public.rcm_organizations;
CREATE POLICY "auth_create_org"
ON public.rcm_organizations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND length(btrim(name)) BETWEEN 1 AND 200
  AND lower(btrim(slug)) ~ '^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$'
  AND primary_language ~ '^[a-z]{2}$'
  AND supported_languages IS NOT NULL
  AND array_length(supported_languages, 1) BETWEEN 1 AND 20
  AND (jurisdiction IS NULL OR length(jurisdiction) <= 100)
  AND (regulator IS NULL OR length(regulator) <= 100)
);
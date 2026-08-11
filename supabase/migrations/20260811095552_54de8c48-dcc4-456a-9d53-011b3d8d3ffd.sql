-- 1) Lock tenant ownership on rcm_* tables
CREATE OR REPLACE FUNCTION public.rcm_prevent_org_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
    RAISE EXCEPTION 'organization_id cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'rcm_tasks','rcm_regulations','rcm_departments','rcm_obligations','rcm_controls',
    'rcm_comments','rcm_notifications','rcm_assessment_items','rcm_evidence_files',
    'rcm_jurisdictions','rcm_regulation_translations','rcm_obligation_translations',
    'rcm_regulation_sections','rcm_assessments','rcm_org_members'
  ] LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name=t AND column_name='organization_id'
    ) THEN
      EXECUTE format('DROP TRIGGER IF EXISTS trg_%1$s_lock_org ON public.%1$I', t);
      EXECUTE format(
        'CREATE TRIGGER trg_%1$s_lock_org BEFORE UPDATE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.rcm_prevent_org_change()',
        t
      );
    END IF;
  END LOOP;
END $$;

-- 2) Remove anonymous table scans of onboarding forms; expose via scoped RPC
DROP POLICY IF EXISTS "public can view active onboarding forms" ON public.suite_onboarding_forms;

CREATE OR REPLACE FUNCTION public.get_public_onboarding_form(_form_id uuid)
RETURNS TABLE (
  id uuid,
  organisation_id uuid,
  name text,
  description text,
  branding jsonb,
  schema jsonb,
  required_checks jsonb,
  redirect_url text,
  is_active boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.id, f.organisation_id, f.name, f.description,
         f.branding::jsonb, f.schema::jsonb, f.required_checks::jsonb,
         f.redirect_url, f.is_active
  FROM public.suite_onboarding_forms f
  WHERE f.id = _form_id AND f.is_active = true
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_onboarding_form(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_public_onboarding_form(uuid) TO anon, authenticated, service_role;

-- 3) Restrict the public academy-images bucket to image files only
DROP POLICY IF EXISTS "Admins can upload academy images" ON storage.objects;
CREATE POLICY "Admins can upload academy images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'academy-images'
  AND has_role(auth.uid(), 'admin'::app_role)
  AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp','gif','svg','avif')
);

DROP POLICY IF EXISTS "Admins can update academy images" ON storage.objects;
CREATE POLICY "Admins can update academy images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'academy-images' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (
  bucket_id = 'academy-images'
  AND has_role(auth.uid(), 'admin'::app_role)
  AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp','gif','svg','avif')
);
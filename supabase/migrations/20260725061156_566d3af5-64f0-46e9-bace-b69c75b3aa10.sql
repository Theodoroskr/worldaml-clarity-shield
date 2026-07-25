
-- Public read of active onboarding forms
GRANT SELECT ON public.suite_onboarding_forms TO anon;

CREATE POLICY "public can view active onboarding forms"
ON public.suite_onboarding_forms
FOR SELECT
TO anon
USING (is_active = true);

-- Storage: allow anonymous uploads to onboarding-submissions bucket
-- only when the top-level folder matches an active form id.
CREATE POLICY "public can upload onboarding docs to active forms"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'onboarding-submissions'
  AND EXISTS (
    SELECT 1 FROM public.suite_onboarding_forms f
    WHERE f.id::text = (storage.foldername(name))[1]
      AND f.is_active = true
  )
);

-- Storage: org staff / admins can read documents for their forms
CREATE POLICY "org staff can read onboarding submission docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'onboarding-submissions'
  AND EXISTS (
    SELECT 1 FROM public.suite_onboarding_forms f
    WHERE f.id::text = (storage.foldername(name))[1]
      AND (
        f.organisation_id IN (SELECT public.get_user_org_ids(auth.uid()))
        OR public.has_role(auth.uid(), 'admin'::app_role)
      )
  )
);

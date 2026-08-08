DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT tablename, policyname, qual
    FROM pg_policies
    WHERE schemaname = 'public'
      AND cmd = 'UPDATE'
      AND with_check IS NULL
      AND qual IS NOT NULL
      AND (tablename LIKE 'rcm\_%' OR tablename LIKE 'suite\_%'
           OR tablename IN ('periodic_reports','str_reports','str_report_transactions','str_report_amendments'))
  LOOP
    EXECUTE format('ALTER POLICY %I ON public.%I WITH CHECK (%s)', r.policyname, r.tablename, r.qual);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.validate_onboarding_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_active boolean;
  v_is_staff boolean;
BEGIN
  SELECT f.is_active INTO v_active
  FROM public.suite_onboarding_forms f
  WHERE f.id = NEW.form_id AND f.organisation_id = NEW.organisation_id;

  IF v_active IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Onboarding form is not accepting submissions';
  END IF;

  v_is_staff := auth.uid() IS NOT NULL AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.suite_org_members m
      WHERE m.organization_id = NEW.organisation_id AND m.user_id = auth.uid()
    )
  );

  IF NOT v_is_staff THEN
    NEW.status := 'pending';
    NEW.reviewer_notes := NULL;
    NEW.reviewed_by := NULL;
    NEW.reviewed_at := NULL;
    NEW.linked_customer_id := NULL;
  END IF;

  NEW.applicant_name := nullif(btrim(left(coalesce(NEW.applicant_name, ''), 200)), '');
  NEW.applicant_email := nullif(lower(btrim(left(coalesce(NEW.applicant_email, ''), 254))), '');
  NEW.user_agent := left(coalesce(NEW.user_agent, ''), 500);

  IF NEW.applicant_email IS NOT NULL
     AND NEW.applicant_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[a-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid applicant email';
  END IF;

  IF NEW.applicant_type NOT IN ('individual','company','entity','trust') THEN
    RAISE EXCEPTION 'Invalid applicant type';
  END IF;

  IF jsonb_typeof(coalesce(NEW.data, '{}'::jsonb)) <> 'object' THEN
    RAISE EXCEPTION 'Submission data must be an object';
  END IF;
  IF jsonb_typeof(coalesce(NEW.documents, '[]'::jsonb)) <> 'array' THEN
    RAISE EXCEPTION 'Submission documents must be a list';
  END IF;
  IF length(coalesce(NEW.data, '{}'::jsonb)::text) > 200000
     OR length(coalesce(NEW.documents, '[]'::jsonb)::text) > 100000 THEN
    RAISE EXCEPTION 'Submission payload too large';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_onboarding_submission_trg ON public.suite_onboarding_submissions;
CREATE TRIGGER validate_onboarding_submission_trg
BEFORE INSERT ON public.suite_onboarding_submissions
FOR EACH ROW EXECUTE FUNCTION public.validate_onboarding_submission();
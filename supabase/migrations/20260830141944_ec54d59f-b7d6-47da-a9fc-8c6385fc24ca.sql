
-- 1. academy_progress: server-side validation of self-reported module completion
CREATE OR REPLACE FUNCTION public.validate_academy_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_modules jsonb;
  v_invalid int;
BEGIN
  IF NEW.completed_modules IS NULL THEN
    NEW.completed_modules := '[]'::jsonb;
  END IF;

  IF jsonb_typeof(NEW.completed_modules) <> 'array' THEN
    RAISE EXCEPTION 'completed_modules must be a JSON array';
  END IF;

  -- de-duplicate while keeping only text entries
  SELECT COALESCE(jsonb_agg(DISTINCT elem), '[]'::jsonb)
  INTO v_modules
  FROM jsonb_array_elements(NEW.completed_modules) AS elem
  WHERE jsonb_typeof(elem) = 'string';

  -- every entry must be a real module of this course
  SELECT count(*)
  INTO v_invalid
  FROM jsonb_array_elements_text(v_modules) AS m(id)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.academy_modules am
    WHERE am.course_id = NEW.course_id
      AND am.id::text = m.id
  );

  IF v_invalid > 0 THEN
    RAISE EXCEPTION 'completed_modules contains modules that do not belong to this course';
  END IF;

  NEW.completed_modules := v_modules;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_academy_progress_trg ON public.academy_progress;
CREATE TRIGGER validate_academy_progress_trg
BEFORE INSERT OR UPDATE ON public.academy_progress
FOR EACH ROW EXECUTE FUNCTION public.validate_academy_progress();

-- 2. suite_onboarding_submissions: derive organisation_id server-side, block spoofing
CREATE OR REPLACE FUNCTION public.enforce_onboarding_submission_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org uuid;
  v_active boolean;
BEGIN
  SELECT f.organisation_id, f.is_active INTO v_org, v_active
  FROM public.suite_onboarding_forms f
  WHERE f.id = NEW.form_id;

  IF v_org IS NULL OR v_active IS NOT TRUE THEN
    RAISE EXCEPTION 'Onboarding form is not available';
  END IF;

  -- organisation always comes from the form, never from the client payload
  NEW.organisation_id := v_org;
  NEW.status := 'pending';
  NEW.reviewer_notes := NULL;
  NEW.reviewed_by := NULL;
  NEW.reviewed_at := NULL;
  NEW.linked_customer_id := NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_onboarding_submission_integrity_trg ON public.suite_onboarding_submissions;
CREATE TRIGGER enforce_onboarding_submission_integrity_trg
BEFORE INSERT ON public.suite_onboarding_submissions
FOR EACH ROW EXECUTE FUNCTION public.enforce_onboarding_submission_integrity();

-- 3. sanctions_searches: remove anonymous write surface (logging happens in the edge function with service role)
DROP POLICY IF EXISTS "Anonymous users can log session searches" ON public.sanctions_searches;
REVOKE INSERT ON public.sanctions_searches FROM anon;

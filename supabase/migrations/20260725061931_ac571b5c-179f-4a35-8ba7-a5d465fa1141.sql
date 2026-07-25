
-- 1. Version history table
CREATE TABLE public.suite_onboarding_form_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.suite_onboarding_forms(id) ON DELETE CASCADE,
  organisation_id uuid NOT NULL REFERENCES public.suite_organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  version_number int NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  name text NOT NULL,
  description text,
  schema jsonb NOT NULL DEFAULT '[]'::jsonb,
  required_checks jsonb NOT NULL DEFAULT jsonb_build_object('kyc',false,'kyb',false,'sof',false,'documents','[]'::jsonb),
  branding jsonb NOT NULL DEFAULT jsonb_build_object('primary_color','#0f766e','show_powered_by',true),
  redirect_url text,
  notes text,
  published_at timestamptz,
  published_by uuid,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (form_id, version_number)
);

CREATE INDEX idx_onboarding_form_versions_form ON public.suite_onboarding_form_versions(form_id, version_number DESC);
CREATE INDEX idx_onboarding_form_versions_status ON public.suite_onboarding_form_versions(form_id, status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.suite_onboarding_form_versions TO authenticated;
GRANT ALL ON public.suite_onboarding_form_versions TO service_role;

ALTER TABLE public.suite_onboarding_form_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members can view onboarding form versions"
ON public.suite_onboarding_form_versions FOR SELECT TO authenticated
USING (
  organisation_id IN (SELECT get_user_org_ids(auth.uid()))
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "compliance staff can insert onboarding form versions"
ON public.suite_onboarding_form_versions FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM suite_org_members m
      WHERE m.organization_id = suite_onboarding_form_versions.organisation_id
        AND m.user_id = auth.uid()
        AND m.role IN ('admin','mlro','compliance_officer')
    )
  )
);

CREATE POLICY "compliance staff can update onboarding form versions"
ON public.suite_onboarding_form_versions FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM suite_org_members m
    WHERE m.organization_id = suite_onboarding_form_versions.organisation_id
      AND m.user_id = auth.uid()
      AND m.role IN ('admin','mlro','compliance_officer')
  )
);

CREATE POLICY "compliance staff can delete onboarding form versions"
ON public.suite_onboarding_form_versions FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM suite_org_members m
    WHERE m.organization_id = suite_onboarding_form_versions.organisation_id
      AND m.user_id = auth.uid()
      AND m.role IN ('admin','mlro','compliance_officer')
  )
);

CREATE TRIGGER trg_suite_onboarding_form_versions_updated_at
BEFORE UPDATE ON public.suite_onboarding_form_versions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Form pointer columns
ALTER TABLE public.suite_onboarding_forms
  ADD COLUMN current_draft_version_id uuid REFERENCES public.suite_onboarding_form_versions(id) ON DELETE SET NULL,
  ADD COLUMN published_version_id uuid REFERENCES public.suite_onboarding_form_versions(id) ON DELETE SET NULL,
  ADD COLUMN latest_version_number int NOT NULL DEFAULT 0;

-- 3. Submission stamping
ALTER TABLE public.suite_onboarding_submissions
  ADD COLUMN form_version_id uuid REFERENCES public.suite_onboarding_form_versions(id) ON DELETE SET NULL,
  ADD COLUMN form_version_number int;

CREATE OR REPLACE FUNCTION public.stamp_onboarding_submission_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_num int;
BEGIN
  IF NEW.form_version_id IS NULL THEN
    SELECT f.published_version_id, v.version_number
    INTO v_id, v_num
    FROM public.suite_onboarding_forms f
    LEFT JOIN public.suite_onboarding_form_versions v ON v.id = f.published_version_id
    WHERE f.id = NEW.form_id;

    NEW.form_version_id := v_id;
    NEW.form_version_number := v_num;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_stamp_onboarding_submission_version
BEFORE INSERT ON public.suite_onboarding_submissions
FOR EACH ROW EXECUTE FUNCTION public.stamp_onboarding_submission_version();

-- 4. Backfill: create a v1 published version for every existing form
DO $$
DECLARE
  r RECORD;
  v_id uuid;
BEGIN
  FOR r IN SELECT * FROM public.suite_onboarding_forms LOOP
    INSERT INTO public.suite_onboarding_form_versions (
      form_id, organisation_id, user_id, version_number, status,
      name, description, schema, required_checks, branding, redirect_url,
      notes, published_at, published_by
    ) VALUES (
      r.id, r.organisation_id, r.user_id, 1, 'published',
      r.name, r.description, r.schema, r.required_checks, r.branding, r.redirect_url,
      'Initial version (backfilled)', now(), r.user_id
    )
    RETURNING id INTO v_id;

    UPDATE public.suite_onboarding_forms
    SET published_version_id = v_id,
        latest_version_number = 1
    WHERE id = r.id;
  END LOOP;
END $$;

-- Backfill existing submissions to the initial version
UPDATE public.suite_onboarding_submissions s
SET form_version_id = f.published_version_id,
    form_version_number = 1
FROM public.suite_onboarding_forms f
WHERE s.form_id = f.id AND s.form_version_id IS NULL;

-- 5. Save draft RPC
CREATE OR REPLACE FUNCTION public.onboarding_form_save_draft(
  _form_id uuid,
  _name text,
  _description text,
  _schema jsonb,
  _required_checks jsonb,
  _branding jsonb,
  _redirect_url text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  frm RECORD;
  draft_id uuid;
  next_num int;
BEGIN
  SELECT * INTO frm FROM public.suite_onboarding_forms WHERE id = _form_id;
  IF frm IS NULL THEN RAISE EXCEPTION 'Form not found: %', _form_id; END IF;

  IF NOT (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.suite_org_members m
      WHERE m.organization_id = frm.organisation_id
        AND m.user_id = auth.uid()
        AND m.role IN ('admin','mlro','compliance_officer')
    )
  ) THEN
    RAISE EXCEPTION 'Not authorised to edit this form';
  END IF;

  IF frm.current_draft_version_id IS NOT NULL THEN
    UPDATE public.suite_onboarding_form_versions
    SET name = _name,
        description = _description,
        schema = _schema,
        required_checks = _required_checks,
        branding = _branding,
        redirect_url = _redirect_url,
        updated_at = now()
    WHERE id = frm.current_draft_version_id
    RETURNING id INTO draft_id;
  ELSE
    next_num := COALESCE(frm.latest_version_number, 0) + 1;
    INSERT INTO public.suite_onboarding_form_versions (
      form_id, organisation_id, user_id, version_number, status,
      name, description, schema, required_checks, branding, redirect_url
    ) VALUES (
      _form_id, frm.organisation_id, auth.uid(), next_num, 'draft',
      _name, _description, _schema, _required_checks, _branding, _redirect_url
    )
    RETURNING id INTO draft_id;

    UPDATE public.suite_onboarding_forms
    SET current_draft_version_id = draft_id,
        latest_version_number = next_num
    WHERE id = _form_id;
  END IF;

  RETURN draft_id;
END;
$$;

-- 6. Publish RPC
CREATE OR REPLACE FUNCTION public.onboarding_form_publish(
  _form_id uuid,
  _notes text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  frm RECORD;
  draft RECORD;
BEGIN
  SELECT * INTO frm FROM public.suite_onboarding_forms WHERE id = _form_id;
  IF frm IS NULL THEN RAISE EXCEPTION 'Form not found: %', _form_id; END IF;

  IF NOT (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.suite_org_members m
      WHERE m.organization_id = frm.organisation_id
        AND m.user_id = auth.uid()
        AND m.role IN ('admin','mlro','compliance_officer')
    )
  ) THEN
    RAISE EXCEPTION 'Not authorised to publish this form';
  END IF;

  IF frm.current_draft_version_id IS NULL THEN
    RAISE EXCEPTION 'No draft to publish. Save changes first.';
  END IF;

  SELECT * INTO draft FROM public.suite_onboarding_form_versions
  WHERE id = frm.current_draft_version_id;

  -- Archive previous published
  IF frm.published_version_id IS NOT NULL AND frm.published_version_id <> draft.id THEN
    UPDATE public.suite_onboarding_form_versions
    SET status = 'archived', archived_at = now()
    WHERE id = frm.published_version_id;
  END IF;

  -- Promote draft
  UPDATE public.suite_onboarding_form_versions
  SET status = 'published',
      published_at = now(),
      published_by = auth.uid(),
      notes = COALESCE(_notes, notes)
  WHERE id = draft.id;

  -- Copy snapshot into form top-level (keeps public route unchanged)
  UPDATE public.suite_onboarding_forms
  SET name = draft.name,
      description = draft.description,
      schema = draft.schema,
      required_checks = draft.required_checks,
      branding = draft.branding,
      redirect_url = draft.redirect_url,
      is_active = true,
      published_version_id = draft.id,
      current_draft_version_id = NULL
  WHERE id = _form_id;

  RETURN draft.id;
END;
$$;

-- 7. Rollback RPC — republishes an older version as a new version_number
CREATE OR REPLACE FUNCTION public.onboarding_form_rollback(
  _form_id uuid,
  _version_id uuid,
  _notes text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  frm RECORD;
  src RECORD;
  new_id uuid;
  next_num int;
BEGIN
  SELECT * INTO frm FROM public.suite_onboarding_forms WHERE id = _form_id;
  IF frm IS NULL THEN RAISE EXCEPTION 'Form not found: %', _form_id; END IF;

  IF NOT (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.suite_org_members m
      WHERE m.organization_id = frm.organisation_id
        AND m.user_id = auth.uid()
        AND m.role IN ('admin','mlro','compliance_officer')
    )
  ) THEN
    RAISE EXCEPTION 'Not authorised to roll back this form';
  END IF;

  SELECT * INTO src FROM public.suite_onboarding_form_versions
  WHERE id = _version_id AND form_id = _form_id;
  IF src IS NULL THEN RAISE EXCEPTION 'Version not found for this form'; END IF;

  -- Discard any open draft
  IF frm.current_draft_version_id IS NOT NULL THEN
    UPDATE public.suite_onboarding_form_versions
    SET status = 'archived', archived_at = now()
    WHERE id = frm.current_draft_version_id;
  END IF;

  -- Archive previous published
  IF frm.published_version_id IS NOT NULL THEN
    UPDATE public.suite_onboarding_form_versions
    SET status = 'archived', archived_at = now()
    WHERE id = frm.published_version_id AND id <> src.id;
  END IF;

  next_num := COALESCE(frm.latest_version_number, 0) + 1;

  INSERT INTO public.suite_onboarding_form_versions (
    form_id, organisation_id, user_id, version_number, status,
    name, description, schema, required_checks, branding, redirect_url,
    notes, published_at, published_by
  ) VALUES (
    _form_id, frm.organisation_id, auth.uid(), next_num, 'published',
    src.name, src.description, src.schema, src.required_checks, src.branding, src.redirect_url,
    COALESCE(_notes, 'Rolled back to v' || src.version_number), now(), auth.uid()
  )
  RETURNING id INTO new_id;

  UPDATE public.suite_onboarding_forms
  SET name = src.name,
      description = src.description,
      schema = src.schema,
      required_checks = src.required_checks,
      branding = src.branding,
      redirect_url = src.redirect_url,
      is_active = true,
      published_version_id = new_id,
      current_draft_version_id = NULL,
      latest_version_number = next_num
  WHERE id = _form_id;

  RETURN new_id;
END;
$$;

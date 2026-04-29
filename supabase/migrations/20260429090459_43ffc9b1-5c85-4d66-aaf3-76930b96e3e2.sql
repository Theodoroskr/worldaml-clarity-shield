-- 1. Widen the filing_status validator to support amendment lifecycle
CREATE OR REPLACE FUNCTION public.validate_filing_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.filing_status NOT IN ('draft', 'filed', 'amended', 'change_requested', 'superseded') THEN
    RAISE EXCEPTION 'Invalid filing_status: %', NEW.filing_status;
  END IF;
  RETURN NEW;
END;
$function$;

-- 2. Add versioning + amendment columns to str_reports
ALTER TABLE public.str_reports
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS parent_report_id UUID REFERENCES public.str_reports(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS change_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS change_request_reason TEXT,
  ADD COLUMN IF NOT EXISTS amendment_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS amendment_explanation TEXT;

CREATE INDEX IF NOT EXISTS idx_str_reports_parent ON public.str_reports(parent_report_id);
CREATE INDEX IF NOT EXISTS idx_str_reports_amend_due ON public.str_reports(amendment_due_at)
  WHERE filing_status IN ('change_requested', 'draft') AND parent_report_id IS NOT NULL;

-- 3. Audit trail table for every amendment lifecycle event
CREATE TABLE IF NOT EXISTS public.str_report_amendments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.str_reports(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL REFERENCES public.suite_organizations(id) ON DELETE CASCADE,
  actor_user_id UUID,
  event_type TEXT NOT NULL,
  notes TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT str_report_amendments_event_type_check
    CHECK (event_type IN ('change_requested','draft_created','filed','superseded','cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_str_amend_report ON public.str_report_amendments(report_id);
CREATE INDEX IF NOT EXISTS idx_str_amend_org ON public.str_report_amendments(organisation_id);

ALTER TABLE public.str_report_amendments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_select_str_amend"
  ON public.str_report_amendments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.suite_org_members m
    WHERE m.organization_id = str_report_amendments.organisation_id
      AND m.user_id = auth.uid()
  ));

CREATE POLICY "org_managers_insert_str_amend"
  ON public.str_report_amendments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.suite_org_members m
    WHERE m.organization_id = str_report_amendments.organisation_id
      AND m.user_id = auth.uid()
      AND m.role IN ('admin','mlro','compliance_officer')
  ));

-- 4. Overdue view for dashboards
CREATE OR REPLACE VIEW public.str_reports_overdue_amendments AS
SELECT
  r.id,
  r.report_number,
  r.organisation_id,
  r.parent_report_id,
  r.version,
  r.filing_status,
  r.change_requested_at,
  r.amendment_due_at,
  GREATEST(0, EXTRACT(EPOCH FROM (now() - r.amendment_due_at)) / 86400)::numeric(10,2) AS days_overdue
FROM public.str_reports r
WHERE r.amendment_due_at IS NOT NULL
  AND r.filing_status IN ('draft','change_requested')
  AND r.amendment_due_at < now();

-- 5. RPC: request an amendment — opens the 20-day window and creates a draft child
CREATE OR REPLACE FUNCTION public.request_str_amendment(
  _report_id UUID,
  _reason TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  parent RECORD;
  new_id UUID;
  due TIMESTAMPTZ := now() + INTERVAL '20 days';
BEGIN
  IF _reason IS NULL OR length(trim(_reason)) = 0 THEN
    RAISE EXCEPTION 'A reason is required to request an STR amendment';
  END IF;

  SELECT * INTO parent FROM public.str_reports WHERE id = _report_id;
  IF parent IS NULL THEN
    RAISE EXCEPTION 'STR report not found: %', _report_id;
  END IF;

  IF parent.filing_status <> 'filed' THEN
    RAISE EXCEPTION 'Only filed STRs can be amended (current status: %)', parent.filing_status;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.suite_org_members m
    WHERE m.organization_id = parent.organisation_id
      AND m.user_id = auth.uid()
      AND m.role IN ('admin','mlro','compliance_officer')
  ) THEN
    RAISE EXCEPTION 'Only MLROs, compliance officers or admins can request an STR amendment';
  END IF;

  -- Mark parent as change_requested + start clock
  UPDATE public.str_reports
  SET filing_status = 'change_requested',
      change_requested_at = now(),
      change_request_reason = _reason,
      amendment_due_at = due
  WHERE id = parent.id;

  -- Create draft child with copied narrative
  INSERT INTO public.str_reports (
    user_id, case_id, customer_id, organisation_id,
    filing_status, version, parent_report_id,
    camlo_name, action_taken, grounds_for_suspicion,
    change_requested_at, change_request_reason, amendment_due_at
  ) VALUES (
    auth.uid(), parent.case_id, parent.customer_id, parent.organisation_id,
    'draft', parent.version + 1, parent.id,
    parent.camlo_name, parent.action_taken, parent.grounds_for_suspicion,
    now(), _reason, due
  )
  RETURNING id INTO new_id;

  -- Audit entries
  INSERT INTO public.str_report_amendments
    (report_id, organisation_id, actor_user_id, event_type, notes, details)
  VALUES
    (parent.id, parent.organisation_id, auth.uid(), 'change_requested', _reason,
     jsonb_build_object('amendment_due_at', due, 'child_report_id', new_id)),
    (new_id, parent.organisation_id, auth.uid(), 'draft_created', _reason,
     jsonb_build_object('parent_report_id', parent.id, 'amendment_due_at', due));

  RETURN new_id;
END;
$function$;

-- 6. RPC: file the amendment — must include the FINTRAC explanation
CREATE OR REPLACE FUNCTION public.file_str_amendment(
  _report_id UUID,
  _explanation TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  child RECORD;
BEGIN
  IF _explanation IS NULL OR length(trim(_explanation)) < 10 THEN
    RAISE EXCEPTION 'A FINTRAC-style explanation (min 10 characters) is required when filing an amendment';
  END IF;

  SELECT * INTO child FROM public.str_reports WHERE id = _report_id;
  IF child IS NULL THEN
    RAISE EXCEPTION 'STR report not found: %', _report_id;
  END IF;

  IF child.parent_report_id IS NULL THEN
    RAISE EXCEPTION 'Report % is not an amendment (no parent_report_id)', _report_id;
  END IF;

  IF child.filing_status NOT IN ('draft','change_requested') THEN
    RAISE EXCEPTION 'Amendment is not in a fileable state (current status: %)', child.filing_status;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.suite_org_members m
    WHERE m.organization_id = child.organisation_id
      AND m.user_id = auth.uid()
      AND m.role IN ('admin','mlro','compliance_officer')
  ) THEN
    RAISE EXCEPTION 'Only MLROs, compliance officers or admins can file an STR amendment';
  END IF;

  UPDATE public.str_reports
  SET filing_status = 'amended',
      filed_at = now(),
      amendment_explanation = _explanation
  WHERE id = child.id;

  UPDATE public.str_reports
  SET filing_status = 'superseded'
  WHERE id = child.parent_report_id;

  INSERT INTO public.str_report_amendments
    (report_id, organisation_id, actor_user_id, event_type, notes, details)
  VALUES
    (child.id, child.organisation_id, auth.uid(), 'filed', _explanation,
     jsonb_build_object(
       'parent_report_id', child.parent_report_id,
       'on_time', (child.amendment_due_at IS NULL OR now() <= child.amendment_due_at),
       'amendment_due_at', child.amendment_due_at
     )),
    (child.parent_report_id, child.organisation_id, auth.uid(), 'superseded',
     'Superseded by amended report ' || child.id::text,
     jsonb_build_object('superseded_by', child.id));
END;
$function$;
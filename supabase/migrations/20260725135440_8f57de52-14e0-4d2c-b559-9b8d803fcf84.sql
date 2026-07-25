
-- ============================================================
-- Regulator submission tracking + adapter registry
-- ============================================================

CREATE TABLE public.suite_regulator_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.suite_organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,

  -- What was filed
  report_kind TEXT NOT NULL,          -- 'str' | 'ctr' | 'periodic' | 'sar' | 'other'
  report_id UUID,                     -- FK-ish reference into str_reports / periodic_reports (not enforced across tables)
  case_id UUID REFERENCES public.suite_cases(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.suite_customers(id) ON DELETE SET NULL,

  -- Where it is going
  regulator TEXT NOT NULL,            -- 'fintrac' | 'fincen' | 'mokas' | 'goaml' | 'fca' | ...
  adapter TEXT NOT NULL,              -- adapter key, e.g. 'goaml_xml_v5', 'fintrac_eft', 'manual_upload'
  jurisdiction TEXT,

  -- Status lifecycle
  status TEXT NOT NULL DEFAULT 'queued',   -- queued|submitting|submitted|acknowledged|rejected|failed|cancelled
  external_reference TEXT,                 -- regulator-issued reference / receipt
  submitted_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- SLA tracking
  sla_hours INTEGER,                       -- adapter default SLA
  sla_due_at TIMESTAMPTZ,
  sla_breached BOOLEAN NOT NULL DEFAULT false,

  -- Payload / adapter response
  request_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  response_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reg_sub_org        ON public.suite_regulator_submissions(organisation_id);
CREATE INDEX idx_reg_sub_status     ON public.suite_regulator_submissions(status);
CREATE INDEX idx_reg_sub_regulator  ON public.suite_regulator_submissions(regulator);
CREATE INDEX idx_reg_sub_sla        ON public.suite_regulator_submissions(sla_due_at) WHERE status IN ('queued','submitting','submitted');
CREATE INDEX idx_reg_sub_report     ON public.suite_regulator_submissions(report_kind, report_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.suite_regulator_submissions TO authenticated;
GRANT ALL ON public.suite_regulator_submissions TO service_role;
ALTER TABLE public.suite_regulator_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reg_sub_org_read" ON public.suite_regulator_submissions FOR SELECT TO authenticated
  USING (organisation_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "reg_sub_org_insert" ON public.suite_regulator_submissions FOR INSERT TO authenticated
  WITH CHECK (
    organisation_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND user_id = auth.uid()
  );

CREATE POLICY "reg_sub_org_update" ON public.suite_regulator_submissions FOR UPDATE TO authenticated
  USING (organisation_id IN (SELECT public.get_user_org_ids(auth.uid())))
  WITH CHECK (organisation_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "reg_sub_org_delete" ON public.suite_regulator_submissions FOR DELETE TO authenticated
  USING (
    organisation_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND EXISTS (
      SELECT 1 FROM public.suite_org_members m
      WHERE m.organization_id = organisation_id
        AND m.user_id = auth.uid()
        AND m.role IN ('admin','mlro')
    )
  );

CREATE TRIGGER trg_reg_sub_updated_at
  BEFORE UPDATE ON public.suite_regulator_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Event log ----------
CREATE TABLE public.suite_regulator_submission_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.suite_regulator_submissions(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL,
  actor_id UUID,
  event_type TEXT NOT NULL,      -- created|status_changed|adapter_response|sla_breached|note|external_update
  from_status TEXT,
  to_status TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reg_sub_events_sub ON public.suite_regulator_submission_events(submission_id);

GRANT SELECT, INSERT ON public.suite_regulator_submission_events TO authenticated;
GRANT ALL ON public.suite_regulator_submission_events TO service_role;
ALTER TABLE public.suite_regulator_submission_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reg_sub_events_read" ON public.suite_regulator_submission_events FOR SELECT TO authenticated
  USING (organisation_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "reg_sub_events_insert" ON public.suite_regulator_submission_events FOR INSERT TO authenticated
  WITH CHECK (organisation_id IN (SELECT public.get_user_org_ids(auth.uid())));

-- ---------- Adapter registry ----------
CREATE TABLE public.suite_regulator_adapters (
  key TEXT PRIMARY KEY,                -- 'goaml_xml_v5' | 'fintrac_eft' | 'fincen_bsa' | 'manual_upload'
  label TEXT NOT NULL,
  regulator TEXT NOT NULL,
  jurisdiction TEXT,
  report_kinds TEXT[] NOT NULL DEFAULT '{}',
  transport TEXT NOT NULL,             -- 'api' | 'sftp' | 'email' | 'manual'
  default_sla_hours INTEGER NOT NULL DEFAULT 72,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_live BOOLEAN NOT NULL DEFAULT false, -- false = stub / simulated
  config_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.suite_regulator_adapters TO authenticated;
GRANT ALL ON public.suite_regulator_adapters TO service_role;
ALTER TABLE public.suite_regulator_adapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reg_adapters_read_all" ON public.suite_regulator_adapters FOR SELECT TO authenticated
  USING (true);

CREATE TRIGGER trg_reg_adapters_updated_at
  BEFORE UPDATE ON public.suite_regulator_adapters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed baseline adapters (all stubs / manual — replace when real APIs wired)
INSERT INTO public.suite_regulator_adapters (key, label, regulator, jurisdiction, report_kinds, transport, default_sla_hours, is_live, description) VALUES
  ('goaml_xml_v5',   'UNODC goAML XML v5',       'goaml',   NULL, ARRAY['str','sar'],       'manual', 72, false, 'Generate goAML XML v5 package for manual upload to the FIU portal.'),
  ('fintrac_eft',    'FINTRAC F2R / EFT',        'fintrac', 'CA', ARRAY['str','ctr'],       'api',    72, false, 'FINTRAC F2R (STR) and EFT/LCTR web-service submission (stub).'),
  ('fincen_bsa',     'FinCEN BSA E-Filing',      'fincen',  'US', ARRAY['sar','ctr'],       'api',    72, false, 'FinCEN BSA E-Filing System (SDTM) submission (stub).'),
  ('mokas_email',    'MOKAS secure email',       'mokas',   'CY', ARRAY['str'],             'email',  72, false, 'Encrypted email package to MOKAS Cyprus FIU (stub).'),
  ('manual_upload',  'Manual portal upload',     'manual',  NULL, ARRAY['str','ctr','sar','periodic'], 'manual', 168, true, 'Fallback: filer manually uploads to the regulator portal and records the reference here.')
ON CONFLICT (key) DO NOTHING;

-- ---------- Lifecycle trigger ----------
CREATE OR REPLACE FUNCTION public.suite_regulator_submissions_lifecycle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _default_sla INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.sla_hours IS NULL THEN
      SELECT default_sla_hours INTO _default_sla FROM public.suite_regulator_adapters WHERE key = NEW.adapter;
      NEW.sla_hours := COALESCE(_default_sla, 72);
    END IF;
    IF NEW.sla_due_at IS NULL THEN
      NEW.sla_due_at := now() + make_interval(hours => NEW.sla_hours);
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'submitted' AND OLD.status IS DISTINCT FROM 'submitted' AND NEW.submitted_at IS NULL THEN
      NEW.submitted_at := now();
    END IF;
    IF NEW.status = 'acknowledged' AND OLD.status IS DISTINCT FROM 'acknowledged' AND NEW.acknowledged_at IS NULL THEN
      NEW.acknowledged_at := now();
    END IF;
    IF NEW.status = 'rejected' AND OLD.status IS DISTINCT FROM 'rejected' AND NEW.rejected_at IS NULL THEN
      NEW.rejected_at := now();
    END IF;
    IF NEW.sla_due_at IS NOT NULL
       AND NEW.status IN ('queued','submitting','submitted')
       AND now() > NEW.sla_due_at THEN
      NEW.sla_breached := true;
    END IF;
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER trg_reg_sub_lifecycle
  BEFORE INSERT OR UPDATE ON public.suite_regulator_submissions
  FOR EACH ROW EXECUTE FUNCTION public.suite_regulator_submissions_lifecycle();

CREATE OR REPLACE FUNCTION public.log_regulator_submission_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.suite_regulator_submission_events(submission_id, organisation_id, actor_id, event_type, to_status, details)
    VALUES (NEW.id, NEW.organisation_id, auth.uid(), 'created', NEW.status,
      jsonb_build_object('adapter', NEW.adapter, 'regulator', NEW.regulator, 'report_kind', NEW.report_kind));
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.suite_regulator_submission_events(submission_id, organisation_id, actor_id, event_type, from_status, to_status, details)
    VALUES (NEW.id, NEW.organisation_id, auth.uid(), 'status_changed', OLD.status, NEW.status,
      jsonb_build_object('external_reference', NEW.external_reference, 'rejection_reason', NEW.rejection_reason));
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_reg_sub_log
  AFTER INSERT OR UPDATE ON public.suite_regulator_submissions
  FOR EACH ROW EXECUTE FUNCTION public.log_regulator_submission_change();

-- ---------- Sweep function for SLA breach + notifications ----------
CREATE OR REPLACE FUNCTION public.sweep_regulator_submission_sla()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count INTEGER := 0;
  r RECORD;
BEGIN
  FOR r IN
    SELECT id, organisation_id, adapter, regulator, sla_due_at
    FROM public.suite_regulator_submissions
    WHERE sla_breached = false
      AND status IN ('queued','submitting','submitted')
      AND sla_due_at IS NOT NULL
      AND now() > sla_due_at
  LOOP
    UPDATE public.suite_regulator_submissions
    SET sla_breached = true
    WHERE id = r.id;

    INSERT INTO public.suite_regulator_submission_events(submission_id, organisation_id, event_type, details)
    VALUES (r.id, r.organisation_id, 'sla_breached',
      jsonb_build_object('adapter', r.adapter, 'regulator', r.regulator, 'sla_due_at', r.sla_due_at));

    _count := _count + 1;
  END LOOP;
  RETURN _count;
END; $$;

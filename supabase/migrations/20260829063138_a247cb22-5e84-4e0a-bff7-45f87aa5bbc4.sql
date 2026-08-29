ALTER TABLE public.monitoring_subjects
  ADD COLUMN IF NOT EXISTS risk_level text NOT NULL DEFAULT 'low'
    CHECK (risk_level IN ('low','elevated','medium','high')),
  ADD COLUMN IF NOT EXISTS risk_level_changed_at timestamptz;

CREATE TABLE public.screening_risk_alert_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  created_by uuid,
  name text NOT NULL,
  threshold text NOT NULL CHECK (threshold IN ('elevated','medium','high')),
  categories text[] NOT NULL DEFAULT '{}',
  assigned_to uuid,
  notify_in_app boolean NOT NULL DEFAULT true,
  notify_email boolean NOT NULL DEFAULT false,
  email_recipients text[] NOT NULL DEFAULT '{}',
  enabled boolean NOT NULL DEFAULT true,
  last_triggered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.screening_risk_alert_rules TO authenticated;
GRANT ALL ON public.screening_risk_alert_rules TO service_role;

ALTER TABLE public.screening_risk_alert_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members manage risk alert rules"
  ON public.screening_risk_alert_rules FOR ALL TO authenticated
  USING (screening_is_org_member(organisation_id))
  WITH CHECK (screening_is_org_member(organisation_id));

CREATE OR REPLACE FUNCTION public.update_screening_risk_alert_rules_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_screening_risk_alert_rules_updated
  BEFORE UPDATE ON public.screening_risk_alert_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_screening_risk_alert_rules_updated_at();
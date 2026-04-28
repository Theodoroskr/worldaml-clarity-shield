
CREATE TABLE public.suite_sof_thresholds (
  organisation_id uuid PRIMARY KEY,
  inflow_high_multiplier numeric NOT NULL DEFAULT 1.5,
  inflow_low_multiplier numeric NOT NULL DEFAULT 0.3,
  foreign_countries_min integer NOT NULL DEFAULT 3,
  high_severity_variance_pct numeric NOT NULL DEFAULT 100,
  min_confidence_for_auto_clear integer NOT NULL DEFAULT 80,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sof_thresholds_high_mult_chk CHECK (inflow_high_multiplier >= 1 AND inflow_high_multiplier <= 10),
  CONSTRAINT sof_thresholds_low_mult_chk CHECK (inflow_low_multiplier > 0 AND inflow_low_multiplier <= 1),
  CONSTRAINT sof_thresholds_foreign_chk CHECK (foreign_countries_min >= 0 AND foreign_countries_min <= 50),
  CONSTRAINT sof_thresholds_variance_chk CHECK (high_severity_variance_pct >= 0 AND high_severity_variance_pct <= 1000),
  CONSTRAINT sof_thresholds_confidence_chk CHECK (min_confidence_for_auto_clear BETWEEN 0 AND 100)
);

ALTER TABLE public.suite_sof_thresholds ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_members_select_sof_thresholds
  ON public.suite_sof_thresholds FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.suite_org_members m
                 WHERE m.organization_id = suite_sof_thresholds.organisation_id
                   AND m.user_id = auth.uid()));

CREATE POLICY org_admins_insert_sof_thresholds
  ON public.suite_sof_thresholds FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.suite_org_members m
                      WHERE m.organization_id = suite_sof_thresholds.organisation_id
                        AND m.user_id = auth.uid()
                        AND m.role = ANY (ARRAY['admin'::org_member_role, 'mlro'::org_member_role, 'compliance_officer'::org_member_role])));

CREATE POLICY org_admins_update_sof_thresholds
  ON public.suite_sof_thresholds FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.suite_org_members m
                 WHERE m.organization_id = suite_sof_thresholds.organisation_id
                   AND m.user_id = auth.uid()
                   AND m.role = ANY (ARRAY['admin'::org_member_role, 'mlro'::org_member_role, 'compliance_officer'::org_member_role])));

CREATE TRIGGER trg_sof_thresholds_updated_at
  BEFORE UPDATE ON public.suite_sof_thresholds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

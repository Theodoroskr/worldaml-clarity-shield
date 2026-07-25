
ALTER TABLE public.suite_organizations
  ADD COLUMN IF NOT EXISTS onboarding_step TEXT NOT NULL DEFAULT 'profile',
  ADD COLUMN IF NOT EXISTS onboarding_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS risk_appetite TEXT,
  ADD COLUMN IF NOT EXISTS default_thresholds JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Helper: create an org for the current user if they don't already have one.
CREATE OR REPLACE FUNCTION public.suite_bootstrap_org(_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_org  UUID;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  SELECT organization_id INTO v_org
  FROM public.suite_org_members
  WHERE user_id = v_user
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_org IS NOT NULL THEN RETURN v_org; END IF;

  INSERT INTO public.suite_organizations (name, status, subscription_tier, created_by, onboarding_step)
  VALUES (COALESCE(NULLIF(trim(_name), ''), 'My Organisation'), 'active', 'suite', v_user, 'profile')
  RETURNING id INTO v_org;

  INSERT INTO public.suite_org_members (organization_id, user_id, role)
  VALUES (v_org, v_user, 'admin')
  ON CONFLICT DO NOTHING;

  RETURN v_org;
END;
$$;

REVOKE ALL ON FUNCTION public.suite_bootstrap_org(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.suite_bootstrap_org(TEXT) TO authenticated;

-- Helper: provision baseline alert rules for an org (idempotent — no-op if any rules exist).
CREATE OR REPLACE FUNCTION public.suite_provision_baseline_rules(_org UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_count INTEGER := 0;
  v_is_member BOOLEAN;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.suite_org_members
    WHERE organization_id = _org AND user_id = v_user AND role IN ('admin','mlro')
  ) INTO v_is_member;
  IF NOT v_is_member THEN RAISE EXCEPTION 'forbidden'; END IF;

  IF EXISTS (SELECT 1 FROM public.suite_alert_rules WHERE organisation_id = _org) THEN
    RETURN 0;
  END IF;

  INSERT INTO public.suite_alert_rules (user_id, organisation_id, name, severity, is_active, conditions, source_regulator)
  VALUES
    (v_user, _org, 'High-value single transaction (>= €10,000)', 'high',    TRUE,
      '{"type":"amount_gte","amount":10000,"currency":"EUR"}'::jsonb, 'FATF'),
    (v_user, _org, 'Rapid succession — 5+ transactions / 24h', 'medium',  TRUE,
      '{"type":"velocity","count":5,"window_hours":24}'::jsonb, 'FATF'),
    (v_user, _org, 'Structuring — 3+ transactions just under threshold', 'high', TRUE,
      '{"type":"structuring","count":3,"threshold":10000,"window_hours":72}'::jsonb, 'FATF'),
    (v_user, _org, 'High-risk jurisdiction counterparty', 'high', TRUE,
      '{"type":"country_risk","list":"fatf_high_risk"}'::jsonb, 'FATF'),
    (v_user, _org, 'PEP match on screening', 'critical', TRUE,
      '{"type":"screening_hit","category":"pep"}'::jsonb, 'FATF'),
    (v_user, _org, 'Sanctions match on screening', 'critical', TRUE,
      '{"type":"screening_hit","category":"sanctions"}'::jsonb, 'OFAC'),
    (v_user, _org, 'Cash-intensive activity spike', 'medium', TRUE,
      '{"type":"cash_ratio","ratio":0.7,"window_days":30}'::jsonb, 'FATF'),
    (v_user, _org, 'Round-number transactions pattern', 'low', TRUE,
      '{"type":"round_number","count":5,"window_days":7}'::jsonb, 'FATF');

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.suite_provision_baseline_rules(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.suite_provision_baseline_rules(UUID) TO authenticated;

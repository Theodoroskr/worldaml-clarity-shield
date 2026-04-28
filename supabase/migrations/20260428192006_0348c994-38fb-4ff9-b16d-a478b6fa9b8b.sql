-- ============================================================
-- AML Account Risk (Mastercard AR) module
-- ============================================================

-- Add AR fields to suite_customers
ALTER TABLE public.suite_customers
  ADD COLUMN IF NOT EXISTS aml_ar_last_score INTEGER,
  ADD COLUMN IF NOT EXISTS aml_ar_last_risk_level TEXT,
  ADD COLUMN IF NOT EXISTS aml_ar_last_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS aml_ar_payment_account_ref TEXT, -- SHA-256 hash of PAN, never raw
  ADD COLUMN IF NOT EXISTS aml_ar_pan_bin TEXT,             -- first 6
  ADD COLUMN IF NOT EXISTS aml_ar_pan_last4 TEXT;           -- last 4

CREATE INDEX IF NOT EXISTS idx_suite_customers_ar_ref
  ON public.suite_customers (aml_ar_payment_account_ref)
  WHERE aml_ar_payment_account_ref IS NOT NULL;

-- ============================================================
-- suite_aml_ar_lookups
-- ============================================================
CREATE TABLE IF NOT EXISTS public.suite_aml_ar_lookups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  customer_id UUID REFERENCES public.suite_customers(id) ON DELETE SET NULL,
  batch_job_id UUID,

  -- PAN identifiers (never full PAN)
  pan_hash TEXT NOT NULL,
  pan_bin TEXT,
  pan_last4 TEXT,

  -- Mastercard AR response
  ar_risk_score INTEGER,                      -- 0-100 normalised
  ar_risk_level TEXT,                         -- low | medium | high | critical
  ar_risk_indicators JSONB DEFAULT '[]'::jsonb,
  ar_raw_response JSONB,
  ar_request_id TEXT,

  -- Operational
  status TEXT NOT NULL DEFAULT 'pending',     -- pending | success | failed
  error_message TEXT,
  latency_ms INTEGER,
  environment TEXT NOT NULL DEFAULT 'sandbox',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aml_ar_lookups_org ON public.suite_aml_ar_lookups (organisation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aml_ar_lookups_customer ON public.suite_aml_ar_lookups (customer_id);
CREATE INDEX IF NOT EXISTS idx_aml_ar_lookups_batch ON public.suite_aml_ar_lookups (batch_job_id);
CREATE INDEX IF NOT EXISTS idx_aml_ar_lookups_pan_hash ON public.suite_aml_ar_lookups (pan_hash);

ALTER TABLE public.suite_aml_ar_lookups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_select_ar_lookups" ON public.suite_aml_ar_lookups
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m
            WHERE m.organization_id = suite_aml_ar_lookups.organisation_id
              AND m.user_id = auth.uid())
  );

CREATE POLICY "org_members_insert_ar_lookups" ON public.suite_aml_ar_lookups
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.suite_org_members m
            WHERE m.organization_id = suite_aml_ar_lookups.organisation_id
              AND m.user_id = auth.uid()
              AND m.role = ANY (ARRAY['admin'::org_member_role, 'mlro'::org_member_role, 'compliance_officer'::org_member_role, 'analyst'::org_member_role]))
  );

-- Validate status
CREATE OR REPLACE FUNCTION public.validate_aml_ar_lookup_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('pending','success','failed') THEN
    RAISE EXCEPTION 'Invalid AR lookup status: %', NEW.status;
  END IF;
  IF NEW.ar_risk_level IS NOT NULL AND NEW.ar_risk_level NOT IN ('low','medium','high','critical','unknown') THEN
    RAISE EXCEPTION 'Invalid AR risk level: %', NEW.ar_risk_level;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_validate_aml_ar_lookup_status
  BEFORE INSERT OR UPDATE ON public.suite_aml_ar_lookups
  FOR EACH ROW EXECUTE FUNCTION public.validate_aml_ar_lookup_status();

-- ============================================================
-- suite_aml_ar_batch_jobs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.suite_aml_ar_batch_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  user_id UUID NOT NULL,

  job_name TEXT NOT NULL,
  source_file_name TEXT,
  total_count INTEGER NOT NULL DEFAULT 0,
  processed_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  high_risk_count INTEGER NOT NULL DEFAULT 0,

  status TEXT NOT NULL DEFAULT 'queued', -- queued | running | completed | failed | cancelled
  error_message TEXT,
  payload JSONB DEFAULT '[]'::jsonb,     -- queued items: [{pan_hash, pan_bin, pan_last4, customer_id?}]

  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aml_ar_batch_org ON public.suite_aml_ar_batch_jobs (organisation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aml_ar_batch_status ON public.suite_aml_ar_batch_jobs (status) WHERE status IN ('queued','running');

ALTER TABLE public.suite_aml_ar_batch_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_select_ar_batch" ON public.suite_aml_ar_batch_jobs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m
            WHERE m.organization_id = suite_aml_ar_batch_jobs.organisation_id
              AND m.user_id = auth.uid())
  );

CREATE POLICY "org_members_insert_ar_batch" ON public.suite_aml_ar_batch_jobs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.suite_org_members m
            WHERE m.organization_id = suite_aml_ar_batch_jobs.organisation_id
              AND m.user_id = auth.uid()
              AND m.role = ANY (ARRAY['admin'::org_member_role, 'mlro'::org_member_role, 'compliance_officer'::org_member_role, 'analyst'::org_member_role]))
  );

CREATE POLICY "org_members_update_ar_batch" ON public.suite_aml_ar_batch_jobs
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m
            WHERE m.organization_id = suite_aml_ar_batch_jobs.organisation_id
              AND m.user_id = auth.uid()
              AND m.role = ANY (ARRAY['admin'::org_member_role, 'mlro'::org_member_role, 'compliance_officer'::org_member_role, 'analyst'::org_member_role]))
  );

CREATE OR REPLACE FUNCTION public.validate_aml_ar_batch_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('queued','running','completed','failed','cancelled') THEN
    RAISE EXCEPTION 'Invalid AR batch status: %', NEW.status;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_validate_aml_ar_batch_status
  BEFORE INSERT OR UPDATE ON public.suite_aml_ar_batch_jobs
  FOR EACH ROW EXECUTE FUNCTION public.validate_aml_ar_batch_status();

CREATE TRIGGER trg_aml_ar_batch_updated_at
  BEFORE UPDATE ON public.suite_aml_ar_batch_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Extend risk score with Factor 7: Mastercard AR signals (max 15)
-- Total possible = 115; we re-normalise to 0-100 in the function.
-- ============================================================
CREATE OR REPLACE FUNCTION public.calculate_customer_risk_score(p_customer_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  cust          RECORD;
  raw_score     INTEGER := 0;
  score         INTEGER := 0;
  factors       JSONB   := '{}';
  geo_score     INTEGER := 0;
  pep_score     INTEGER := 0;
  type_score    INTEGER := 0;
  kyc_score     INTEGER := 0;
  screen_score  INTEGER := 0;
  txn_score     INTEGER := 0;
  ar_score      INTEGER := 0;
  geo_reason    TEXT    := 'Standard jurisdiction';
  pep_reason    TEXT    := 'No PEP status';
  ar_reason     TEXT    := 'No Mastercard AR check on file';
  country_risk  TEXT    := 'standard';
  recent_matches     INTEGER;
  high_conf_matches  INTEGER;
  txn_count          INTEGER;
  avg_txn_amount     NUMERIC;
  flagged_txns       INTEGER;
  final_level        TEXT;
BEGIN
  SELECT * INTO cust FROM public.suite_customers WHERE id = p_customer_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Customer not found: %', p_customer_id; END IF;

  -- Factor 1: Geography (max 30)
  IF cust.country IS NOT NULL THEN
    SELECT risk_category INTO country_risk FROM public.fatf_country_risk WHERE country_code = UPPER(cust.country);
    CASE country_risk
      WHEN 'black'    THEN geo_score := 30; geo_reason := 'FATF black list jurisdiction';
      WHEN 'grey'     THEN geo_score := 20; geo_reason := 'FATF grey list — increased monitoring';
      WHEN 'enhanced' THEN geo_score := 15; geo_reason := 'Enhanced scrutiny jurisdiction (EU/OFAC)';
      ELSE                 geo_score := 0;  geo_reason := 'Standard jurisdiction';
    END CASE;
  END IF;
  factors := factors || jsonb_build_object('geography', jsonb_build_object('score', geo_score, 'max', 30, 'country', COALESCE(cust.country, 'Unknown'), 'reason', geo_reason));

  -- Factor 2: PEP status (max 25)
  CASE cust.pep_status
    WHEN 'pep_class_1'  THEN pep_score := 25; pep_reason := 'PEP Class 1 — Head of State / senior official';
    WHEN 'pep_class_2'  THEN pep_score := 20; pep_reason := 'PEP Class 2 — Parliament / senior judiciary';
    WHEN 'pep_class_3'  THEN pep_score := 15; pep_reason := 'PEP Class 3 — Senior executive / state-owned enterprise';
    WHEN 'pep_class_4'  THEN pep_score := 10; pep_reason := 'PEP Class 4 — Local official / minor public role';
    WHEN 'rca'          THEN pep_score := 15; pep_reason := 'Relative or Close Associate of PEP';
    WHEN 'former_pep'   THEN pep_score := 8;  pep_reason := 'Former PEP — 12-month cooling-off';
    WHEN 'none'         THEN pep_score := 0;  pep_reason := 'No PEP status';
    ELSE                     pep_score := 5;  pep_reason := 'PEP status under review';
  END CASE;
  factors := factors || jsonb_build_object('pep_status', jsonb_build_object('score', pep_score, 'max', 25, 'status', COALESCE(cust.pep_status, 'none'), 'reason', pep_reason));

  -- Factor 3: Customer type (max 10)
  CASE cust.type
    WHEN 'business'   THEN type_score := 5;
    WHEN 'individual' THEN type_score := 0;
    ELSE                   type_score := 3;
  END CASE;
  IF cust.type = 'business' AND cust.company_name IS NOT NULL THEN
    IF cust.company_name ILIKE '%casino%' OR cust.company_name ILIKE '%gaming%'
       OR cust.company_name ILIKE '%crypto%' OR cust.company_name ILIKE '%exchange%'
       OR cust.company_name ILIKE '%forex%' OR cust.company_name ILIKE '%remit%' THEN
      type_score := 10;
    END IF;
  END IF;
  factors := factors || jsonb_build_object('customer_type', jsonb_build_object('score', type_score, 'max', 10, 'type', COALESCE(cust.type, 'unknown')));

  -- Factor 4: KYC status (max 10)
  CASE cust.kyc_status
    WHEN 'verified'  THEN kyc_score := 0;
    WHEN 'in_review' THEN kyc_score := 5;
    WHEN 'pending'   THEN kyc_score := 8;
    WHEN 'rejected'  THEN kyc_score := 10;
    ELSE                  kyc_score := 5;
  END CASE;
  factors := factors || jsonb_build_object('kyc_status', jsonb_build_object('score', kyc_score, 'max', 10, 'status', COALESCE(cust.kyc_status, 'pending')));

  -- Factor 5: Screening history (max 15)
  SELECT
    COUNT(*) FILTER (WHERE result IN ('potential_match', 'low_match')),
    COUNT(*) FILTER (WHERE match_count >= 2 AND result = 'potential_match')
  INTO recent_matches, high_conf_matches
  FROM public.suite_screenings
  WHERE customer_id = p_customer_id AND screened_at > NOW() - INTERVAL '90 days';

  IF high_conf_matches >= 1  THEN screen_score := 15;
  ELSIF recent_matches >= 2  THEN screen_score := 10;
  ELSIF recent_matches >= 1  THEN screen_score := 5;
  ELSE                            screen_score := 0;
  END IF;
  factors := factors || jsonb_build_object('screening_history', jsonb_build_object('score', screen_score, 'max', 15, 'matches_90d', recent_matches, 'high_confidence_matches', high_conf_matches));

  -- Factor 6: Transaction behaviour (max 10)
  SELECT COUNT(*), COALESCE(AVG(amount), 0), COUNT(*) FILTER (WHERE risk_flag = true)
  INTO txn_count, avg_txn_amount, flagged_txns
  FROM public.suite_transactions
  WHERE customer_id = p_customer_id AND created_at > NOW() - INTERVAL '90 days';

  IF flagged_txns >= 3       THEN txn_score := 10;
  ELSIF flagged_txns >= 1    THEN txn_score := 5;
  ELSIF avg_txn_amount > 50000 THEN txn_score := 3;
  ELSE                            txn_score := 0;
  END IF;
  factors := factors || jsonb_build_object('transaction_behaviour', jsonb_build_object('score', txn_score, 'max', 10, 'transactions_90d', txn_count, 'avg_amount', round(avg_txn_amount, 2), 'flagged_count', flagged_txns));

  -- Factor 7: Mastercard AML AR signals (max 15)
  IF cust.aml_ar_last_score IS NOT NULL AND cust.aml_ar_last_checked_at > NOW() - INTERVAL '90 days' THEN
    CASE cust.aml_ar_last_risk_level
      WHEN 'critical' THEN ar_score := 15; ar_reason := 'Mastercard AR critical risk indicators';
      WHEN 'high'     THEN ar_score := 12; ar_reason := 'Mastercard AR high risk indicators';
      WHEN 'medium'   THEN ar_score := 6;  ar_reason := 'Mastercard AR medium risk indicators';
      WHEN 'low'      THEN ar_score := 0;  ar_reason := 'Mastercard AR clean';
      ELSE                 ar_score := 3;  ar_reason := 'Mastercard AR signals present';
    END CASE;
  END IF;
  factors := factors || jsonb_build_object('mastercard_ar', jsonb_build_object(
    'score', ar_score, 'max', 15,
    'last_score', cust.aml_ar_last_score,
    'last_level', cust.aml_ar_last_risk_level,
    'last_checked_at', cust.aml_ar_last_checked_at,
    'reason', ar_reason
  ));

  -- Total (raw is out of 115; normalise to 100)
  raw_score := geo_score + pep_score + type_score + kyc_score + screen_score + txn_score + ar_score;
  score := LEAST(100, ROUND(raw_score::numeric * 100 / 115));

  CASE
    WHEN score >= 75 THEN final_level := 'critical';
    WHEN score >= 50 THEN final_level := 'high';
    WHEN score >= 25 THEN final_level := 'medium';
    ELSE                  final_level := 'low';
  END CASE;

  factors := factors || jsonb_build_object('total_score', score, 'raw_score', raw_score, 'max_raw', 115, 'risk_level', final_level);

  -- Persist
  UPDATE public.suite_customers SET
    risk_score = score,
    risk_level = final_level,
    risk_score_factors = factors,
    risk_scored_at = NOW(),
    risk_score_version = COALESCE(risk_score_version, 0) + 1
  WHERE id = p_customer_id;

  RETURN factors;
END;
$function$;

-- ============================================================
-- Trigger to recompute risk when AR fields change
-- ============================================================
CREATE OR REPLACE FUNCTION public.auto_score_customer_ar()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (
    OLD.aml_ar_last_score IS DISTINCT FROM NEW.aml_ar_last_score
    OR OLD.aml_ar_last_risk_level IS DISTINCT FROM NEW.aml_ar_last_risk_level
  ) THEN
    PERFORM public.calculate_customer_risk_score(NEW.id);
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_auto_score_customer_ar ON public.suite_customers;
CREATE TRIGGER trg_auto_score_customer_ar
  AFTER UPDATE OF aml_ar_last_score, aml_ar_last_risk_level ON public.suite_customers
  FOR EACH ROW EXECUTE FUNCTION public.auto_score_customer_ar();
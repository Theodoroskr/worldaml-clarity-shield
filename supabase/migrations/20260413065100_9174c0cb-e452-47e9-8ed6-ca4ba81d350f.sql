-- Add risk scoring columns to suite_customers
ALTER TABLE public.suite_customers
  ADD COLUMN IF NOT EXISTS risk_score          INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS risk_score_factors  JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS risk_scored_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS risk_score_version  INTEGER NOT NULL DEFAULT 1;

-- Add constraint via trigger instead of CHECK (for restore compatibility)
CREATE OR REPLACE FUNCTION public.validate_risk_score()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.risk_score < 0 OR NEW.risk_score > 100 THEN
    RAISE EXCEPTION 'risk_score must be between 0 and 100, got %', NEW.risk_score;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_risk_score ON public.suite_customers;
CREATE TRIGGER trg_validate_risk_score
  BEFORE INSERT OR UPDATE OF risk_score ON public.suite_customers
  FOR EACH ROW EXECUTE FUNCTION public.validate_risk_score();

-- FATF country risk reference table
CREATE TABLE IF NOT EXISTS public.fatf_country_risk (
  country_code  CHAR(2) PRIMARY KEY,
  risk_category TEXT NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.validate_fatf_risk_category()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.risk_category NOT IN ('black', 'grey', 'enhanced', 'standard') THEN
    RAISE EXCEPTION 'Invalid risk_category: %', NEW.risk_category;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_fatf_category ON public.fatf_country_risk;
CREATE TRIGGER trg_validate_fatf_category
  BEFORE INSERT OR UPDATE ON public.fatf_country_risk
  FOR EACH ROW EXECUTE FUNCTION public.validate_fatf_risk_category();

ALTER TABLE public.fatf_country_risk ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all_authenticated_read_fatf" ON public.fatf_country_risk
  FOR SELECT TO authenticated USING (true);

-- Core risk scoring function
CREATE OR REPLACE FUNCTION public.calculate_customer_risk_score(
  p_customer_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cust          RECORD;
  score         INTEGER := 0;
  factors       JSONB   := '{}';
  geo_score     INTEGER := 0;
  pep_score     INTEGER := 0;
  type_score    INTEGER := 0;
  kyc_score     INTEGER := 0;
  screen_score  INTEGER := 0;
  txn_score     INTEGER := 0;
  geo_reason    TEXT    := 'Standard jurisdiction';
  pep_reason    TEXT    := 'No PEP status';
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

  -- Total
  score := geo_score + pep_score + type_score + kyc_score + screen_score + txn_score;

  CASE
    WHEN score >= 75 THEN final_level := 'critical';
    WHEN score >= 50 THEN final_level := 'high';
    WHEN score >= 25 THEN final_level := 'medium';
    ELSE                  final_level := 'low';
  END CASE;

  factors := factors || jsonb_build_object('total_score', score, 'risk_level', final_level);

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
$$;

-- Auto-score trigger on insert/update of risk-relevant fields
CREATE OR REPLACE FUNCTION public.auto_score_customer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR
     OLD.country IS DISTINCT FROM NEW.country OR
     OLD.pep_status IS DISTINCT FROM NEW.pep_status OR
     OLD.type IS DISTINCT FROM NEW.type OR
     OLD.kyc_status IS DISTINCT FROM NEW.kyc_status OR
     OLD.company_name IS DISTINCT FROM NEW.company_name
  THEN
    PERFORM public.calculate_customer_risk_score(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_score_customer ON public.suite_customers;
CREATE TRIGGER trg_auto_score_customer
  AFTER INSERT OR UPDATE OF country, pep_status, type, kyc_status, company_name
  ON public.suite_customers
  FOR EACH ROW EXECUTE FUNCTION public.auto_score_customer();
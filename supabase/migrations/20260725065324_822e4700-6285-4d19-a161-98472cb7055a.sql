
-- 1. Extend suite_ubo
ALTER TABLE public.suite_ubo
  ADD COLUMN IF NOT EXISTS entity_type TEXT NOT NULL DEFAULT 'individual',
  ADD COLUMN IF NOT EXISTS parent_ubo_id UUID REFERENCES public.suite_ubo(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS control_type TEXT NOT NULL DEFAULT 'ownership',
  ADD COLUMN IF NOT EXISTS control_pct NUMERIC,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS registration_number TEXT,
  ADD COLUMN IF NOT EXISTS dob DATE,
  ADD COLUMN IF NOT EXISTS is_pep BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sanctions_status TEXT NOT NULL DEFAULT 'not_screened',
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS last_screening_id UUID,
  ADD COLUMN IF NOT EXISTS last_screened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Validation trigger (avoid CHECK for future-flexibility)
CREATE OR REPLACE FUNCTION public.validate_suite_ubo()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.entity_type NOT IN ('individual','company','trust','foundation','other') THEN
    RAISE EXCEPTION 'Invalid entity_type: %', NEW.entity_type;
  END IF;
  IF NEW.control_type NOT IN ('ownership','voting','board','beneficial','signatory','other') THEN
    RAISE EXCEPTION 'Invalid control_type: %', NEW.control_type;
  END IF;
  IF NEW.sanctions_status NOT IN ('not_screened','clear','pep','sanctions','adverse_media','potential_match') THEN
    RAISE EXCEPTION 'Invalid sanctions_status: %', NEW.sanctions_status;
  END IF;
  IF NEW.ownership_pct < 0 OR NEW.ownership_pct > 100 THEN
    RAISE EXCEPTION 'ownership_pct out of range';
  END IF;
  IF NEW.control_pct IS NOT NULL AND (NEW.control_pct < 0 OR NEW.control_pct > 100) THEN
    RAISE EXCEPTION 'control_pct out of range';
  END IF;
  IF NEW.parent_ubo_id = NEW.id THEN
    RAISE EXCEPTION 'A node cannot be its own parent';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_validate_suite_ubo ON public.suite_ubo;
CREATE TRIGGER trg_validate_suite_ubo
  BEFORE INSERT OR UPDATE ON public.suite_ubo
  FOR EACH ROW EXECUTE FUNCTION public.validate_suite_ubo();

DROP TRIGGER IF EXISTS trg_suite_ubo_updated_at ON public.suite_ubo;
CREATE TRIGGER trg_suite_ubo_updated_at
  BEFORE UPDATE ON public.suite_ubo
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_suite_ubo_customer ON public.suite_ubo(customer_id);
CREATE INDEX IF NOT EXISTS idx_suite_ubo_parent ON public.suite_ubo(parent_ubo_id);
CREATE INDEX IF NOT EXISTS idx_suite_ubo_org ON public.suite_ubo(organisation_id);

-- 2. Auto-create alert when UBO screening finds hits
CREATE OR REPLACE FUNCTION public.trigger_ubo_screening_alert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _severity TEXT;
  _rule_name TEXT;
BEGIN
  IF NEW.sanctions_status IS DISTINCT FROM OLD.sanctions_status
     AND NEW.sanctions_status IN ('sanctions','potential_match','pep','adverse_media') THEN

    _severity := CASE NEW.sanctions_status
      WHEN 'sanctions' THEN 'critical'
      WHEN 'potential_match' THEN 'high'
      WHEN 'pep' THEN 'medium'
      WHEN 'adverse_media' THEN 'medium'
      ELSE 'low' END;

    _rule_name := CASE NEW.sanctions_status
      WHEN 'sanctions' THEN 'UBO sanctions hit'
      WHEN 'potential_match' THEN 'UBO potential sanctions match'
      WHEN 'pep' THEN 'UBO PEP exposure'
      WHEN 'adverse_media' THEN 'UBO adverse media'
      ELSE 'UBO screening' END;

    INSERT INTO public.suite_alerts (
      user_id, organisation_id, customer_id, alert_type, severity,
      rule_name, description, status, details
    ) VALUES (
      NEW.user_id, NEW.organisation_id, NEW.customer_id, 'ubo_screening', _severity,
      _rule_name,
      format('Ownership node "%s" (%s%% ownership) flagged: %s', NEW.name, NEW.ownership_pct, NEW.sanctions_status),
      'open',
      jsonb_build_object(
        'ubo_id', NEW.id,
        'entity_type', NEW.entity_type,
        'control_type', NEW.control_type,
        'ownership_pct', NEW.ownership_pct,
        'control_pct', NEW.control_pct,
        'sanctions_status', NEW.sanctions_status,
        'last_screening_id', NEW.last_screening_id
      )
    );
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_ubo_screening_alert ON public.suite_ubo;
CREATE TRIGGER trg_ubo_screening_alert
  AFTER UPDATE ON public.suite_ubo
  FOR EACH ROW EXECUTE FUNCTION public.trigger_ubo_screening_alert();

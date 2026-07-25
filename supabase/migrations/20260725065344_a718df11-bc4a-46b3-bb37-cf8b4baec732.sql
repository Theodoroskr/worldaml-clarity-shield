
CREATE OR REPLACE FUNCTION public.trigger_ubo_screening_alert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _severity TEXT;
  _title TEXT;
BEGIN
  IF NEW.sanctions_status IS DISTINCT FROM OLD.sanctions_status
     AND NEW.sanctions_status IN ('sanctions','potential_match','pep','adverse_media') THEN

    _severity := CASE NEW.sanctions_status
      WHEN 'sanctions' THEN 'critical'
      WHEN 'potential_match' THEN 'high'
      WHEN 'pep' THEN 'medium'
      WHEN 'adverse_media' THEN 'medium'
      ELSE 'low' END;

    _title := CASE NEW.sanctions_status
      WHEN 'sanctions' THEN 'UBO sanctions hit'
      WHEN 'potential_match' THEN 'UBO potential sanctions match'
      WHEN 'pep' THEN 'UBO PEP exposure'
      WHEN 'adverse_media' THEN 'UBO adverse media'
      ELSE 'UBO screening' END;

    INSERT INTO public.suite_alerts (
      user_id, organisation_id, customer_id, alert_type, severity,
      title, description, status
    ) VALUES (
      NEW.user_id, NEW.organisation_id, NEW.customer_id, 'ubo_screening', _severity,
      _title,
      format('Ownership node "%s" (%s%% ownership) flagged: %s', NEW.name, NEW.ownership_pct, NEW.sanctions_status),
      'open'
    );
  END IF;
  RETURN NEW;
END; $$;

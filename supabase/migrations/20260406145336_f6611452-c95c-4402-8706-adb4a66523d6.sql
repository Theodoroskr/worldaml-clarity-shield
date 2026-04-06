
-- Trigger function for flagged transactions
CREATE OR REPLACE FUNCTION public.trigger_workflow_transaction_flagged()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _supabase_url text;
  _service_key text;
BEGIN
  IF NEW.risk_flag = true THEN
    _supabase_url := current_setting('app.settings.supabase_url', true);
    _service_key := current_setting('app.settings.service_role_key', true);

    IF _supabase_url IS NOT NULL AND _service_key IS NOT NULL THEN
      PERFORM extensions.http_post(
        url := _supabase_url || '/functions/v1/execute-workflow',
        body := jsonb_build_object(
          'trigger_type', 'transaction_flagged',
          'entity_type', 'transaction',
          'entity_id', NEW.id::text,
          'user_id', NEW.user_id::text,
          'entity_data', jsonb_build_object(
            'customer_id', NEW.customer_id::text,
            'amount', NEW.amount,
            'currency', NEW.currency,
            'direction', NEW.direction,
            'counterparty', NEW.counterparty,
            'counterparty_country', NEW.counterparty_country,
            'description', NEW.description,
            'risk_flag', NEW.risk_flag
          )
        )::text,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || _service_key
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger function for risk level changes
CREATE OR REPLACE FUNCTION public.trigger_workflow_risk_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _supabase_url text;
  _service_key text;
BEGIN
  IF OLD.risk_level IS DISTINCT FROM NEW.risk_level THEN
    _supabase_url := current_setting('app.settings.supabase_url', true);
    _service_key := current_setting('app.settings.service_role_key', true);

    IF _supabase_url IS NOT NULL AND _service_key IS NOT NULL THEN
      PERFORM extensions.http_post(
        url := _supabase_url || '/functions/v1/execute-workflow',
        body := jsonb_build_object(
          'trigger_type', 'risk_change',
          'entity_type', 'customer',
          'entity_id', NEW.id::text,
          'user_id', NEW.user_id::text,
          'entity_data', jsonb_build_object(
            'name', NEW.name,
            'type', NEW.type,
            'old_risk_level', OLD.risk_level,
            'new_risk_level', NEW.risk_level,
            'country', NEW.country,
            'kyc_status', NEW.kyc_status,
            'email', NEW.email
          )
        )::text,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || _service_key
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create the triggers
CREATE TRIGGER on_transaction_flagged
  AFTER INSERT ON public.suite_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_workflow_transaction_flagged();

CREATE TRIGGER on_risk_level_change
  AFTER UPDATE ON public.suite_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_workflow_risk_change();

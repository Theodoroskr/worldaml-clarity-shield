
-- Enable pg_net for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function to trigger workflow on new customer
CREATE OR REPLACE FUNCTION public.trigger_workflow_new_customer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _supabase_url text;
  _anon_key text;
  _service_key text;
BEGIN
  _supabase_url := current_setting('app.settings.supabase_url', true);
  _service_key := current_setting('app.settings.service_role_key', true);

  IF _supabase_url IS NOT NULL AND _service_key IS NOT NULL THEN
    PERFORM extensions.http_post(
      url := _supabase_url || '/functions/v1/execute-workflow',
      body := jsonb_build_object(
        'trigger_type', 'new_customer',
        'entity_type', 'customer',
        'entity_id', NEW.id::text,
        'user_id', NEW.user_id::text,
        'entity_data', jsonb_build_object(
          'name', NEW.name,
          'type', NEW.type,
          'risk_level', NEW.risk_level,
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

  RETURN NEW;
END;
$$;

-- Function to trigger workflow on screening match
CREATE OR REPLACE FUNCTION public.trigger_workflow_screening_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _supabase_url text;
  _service_key text;
BEGIN
  -- Only trigger if there are matches
  IF NEW.match_count > 0 THEN
    _supabase_url := current_setting('app.settings.supabase_url', true);
    _service_key := current_setting('app.settings.service_role_key', true);

    IF _supabase_url IS NOT NULL AND _service_key IS NOT NULL THEN
      PERFORM extensions.http_post(
        url := _supabase_url || '/functions/v1/execute-workflow',
        body := jsonb_build_object(
          'trigger_type', 'screening_match',
          'entity_type', 'screening',
          'entity_id', NEW.id::text,
          'user_id', NEW.user_id::text,
          'entity_data', jsonb_build_object(
            'customer_id', NEW.customer_id::text,
            'screening_type', NEW.screening_type,
            'result', NEW.result,
            'match_count', NEW.match_count
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

-- Create triggers
CREATE TRIGGER on_new_customer_workflow
AFTER INSERT ON public.suite_customers
FOR EACH ROW
EXECUTE FUNCTION public.trigger_workflow_new_customer();

CREATE TRIGGER on_screening_match_workflow
AFTER INSERT ON public.suite_screenings
FOR EACH ROW
EXECUTE FUNCTION public.trigger_workflow_screening_match();

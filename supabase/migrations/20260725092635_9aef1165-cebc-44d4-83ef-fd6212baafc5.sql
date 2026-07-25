
-- Notification send log (dedup + audit)
CREATE TABLE public.suite_notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  kind TEXT NOT NULL, -- 'instant' | 'weekly'
  reference_id TEXT NOT NULL, -- alert id or week-key
  recipients TEXT[] NOT NULL DEFAULT '{}',
  alert_ids UUID[] NOT NULL DEFAULT '{}',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, kind, reference_id)
);

GRANT SELECT ON public.suite_notification_log TO authenticated;
GRANT ALL ON public.suite_notification_log TO service_role;

ALTER TABLE public.suite_notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members view their notification log"
  ON public.suite_notification_log FOR SELECT TO authenticated
  USING (organisation_id IN (
    SELECT organization_id FROM public.suite_org_members WHERE user_id = auth.uid()
  ));

-- Trigger: on new critical/high alert, invoke edge function via pg_net
CREATE OR REPLACE FUNCTION public.trg_suite_alert_notify()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fn_url TEXT := 'https://uxjjxnnyrjkhcggptihx.supabase.co/functions/v1/send-alert-notifications';
  secret TEXT;
BEGIN
  IF NEW.severity NOT IN ('critical','high') THEN
    RETURN NEW;
  END IF;

  -- Read secret from vault if present, else skip
  BEGIN
    SELECT decrypted_secret INTO secret FROM vault.decrypted_secrets WHERE name = 'ALERT_NOTIFICATIONS_SECRET' LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    secret := NULL;
  END;

  PERFORM net.http_post(
    url := fn_url,
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'x-alert-secret', COALESCE(secret,'')
    ),
    body := jsonb_build_object('mode','instant','alert_id', NEW.id)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS suite_alerts_notify ON public.suite_alerts;
CREATE TRIGGER suite_alerts_notify
  AFTER INSERT ON public.suite_alerts
  FOR EACH ROW EXECUTE FUNCTION public.trg_suite_alert_notify();

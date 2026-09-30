CREATE TABLE IF NOT EXISTS public.internal_cron_secrets (
  name text PRIMARY KEY,
  secret text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.internal_cron_secrets FROM anon, authenticated;
GRANT ALL ON public.internal_cron_secrets TO service_role;
ALTER TABLE public.internal_cron_secrets ENABLE ROW LEVEL SECURITY;

INSERT INTO public.internal_cron_secrets (name, secret)
VALUES ('scheduled_jobs', replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4amp4bm55cmpraGNnZ3B0aWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMTE5MzIsImV4cCI6MjA4NTU4NzkzMn0.19w0NamKWVZHENxcfXxVNgmhywd3PQUKdKaO3bh_WrQ';
  base text := 'https://uxjjxnnyrjkhcggptihx.supabase.co/functions/v1/';
  j record;
BEGIN
  FOR j IN SELECT * FROM (VALUES
    ('admin-notification-dispatch-10min', '*/10 * * * *', 'admin-notification-dispatch'),
    ('send-activation-nudge-hourly', '15 * * * *', 'send-activation-nudge'),
    ('academy-checkout-recovery-24h', '30 * * * *', 'send-checkout-recovery-24h')
  ) AS t(jobname, sched, fn) LOOP
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = j.jobname) THEN
      PERFORM cron.unschedule(j.jobname);
    END IF;
    PERFORM cron.schedule(j.jobname, j.sched, format($c$
      SELECT net.http_post(
        url := %L,
        headers := jsonb_build_object(
          'Content-Type','application/json',
          'Authorization','Bearer %s',
          'apikey', %L,
          'x-cron-secret', (SELECT secret FROM public.internal_cron_secrets WHERE name = 'scheduled_jobs')
        ),
        body := jsonb_build_object('source','cron')
      );
    $c$, base || j.fn, anon_key, anon_key));
  END LOOP;
END $$;

-- Public bucket files stay reachable by public URL; stop anonymous listing.
DROP POLICY IF EXISTS "Academy images are publicly readable" ON storage.objects;
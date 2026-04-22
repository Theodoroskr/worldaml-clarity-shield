-- Remove any prior version of this job
SELECT cron.unschedule('send-signup-followup-hourly')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-signup-followup-hourly');

-- Run every hour
SELECT cron.schedule(
  'send-signup-followup-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://uxjjxnnyrjkhcggptihx.supabase.co/functions/v1/send-signup-followup',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4amp4bm55cmpraGNnZ3B0aWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMTE5MzIsImV4cCI6MjA4NTU4NzkzMn0.19w0NamKWVZHENxcfXxVNgmhywd3PQUKdKaO3bh_WrQ"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
SELECT cron.schedule(
  'weekly-academy-course-reminders',
  '0 14 * * 1',
  $$SELECT net.http_post(
      url:='https://uxjjxnnyrjkhcggptihx.supabase.co/functions/v1/weekly-course-reminders',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4amp4bm55cmpraGNnZ3B0aWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMTE5MzIsImV4cCI6MjA4NTU4NzkzMn0.19w0NamKWVZHENxcfXxVNgmhywd3PQUKdKaO3bh_WrQ"}'::jsonb,
      body:='{}'::jsonb
  ) as request_id;$$
);
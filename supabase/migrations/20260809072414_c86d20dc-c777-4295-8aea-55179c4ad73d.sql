DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['form_submissions','partner_applications','deal_registrations','academy_course_purchases','ecosystem_events']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;
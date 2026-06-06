ALTER TABLE public.academy_course_purchases
  ADD COLUMN IF NOT EXISTS recovery_email_sent_at timestamptz;
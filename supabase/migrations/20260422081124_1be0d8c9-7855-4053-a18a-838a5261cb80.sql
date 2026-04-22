-- Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Tracking table: one row per user once the follow-up has been sent
CREATE TABLE IF NOT EXISTS public.signup_followups_sent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resend_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_signup_followups_user_id ON public.signup_followups_sent(user_id);

ALTER TABLE public.signup_followups_sent ENABLE ROW LEVEL SECURITY;

-- Only admins can read; inserts happen via service role from the edge function
CREATE POLICY "Admins can view signup followups"
ON public.signup_followups_sent
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
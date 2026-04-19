-- Track academy reminder emails sent to avoid spamming users
CREATE TABLE public.academy_reminders_sent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reminder_number SMALLINT NOT NULL DEFAULT 1
);

CREATE INDEX idx_academy_reminders_user_course ON public.academy_reminders_sent(user_id, course_id);
CREATE INDEX idx_academy_reminders_sent_at ON public.academy_reminders_sent(sent_at DESC);

ALTER TABLE public.academy_reminders_sent ENABLE ROW LEVEL SECURITY;

-- Users can view their own reminder history
CREATE POLICY "Users view own reminders"
ON public.academy_reminders_sent
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only service role inserts (no client policy needed; service_role bypasses RLS)

CREATE TABLE public.quiz_error_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  error_message TEXT NOT NULL,
  error_code TEXT,
  error_details TEXT,
  error_hint TEXT,
  course_id UUID,
  course_slug TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_error_reports ENABLE ROW LEVEL SECURITY;

-- Admins can read all reports
CREATE POLICY "admins_read_quiz_errors" ON public.quiz_error_reports
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- The edge function inserts via service role, so no INSERT policy needed for authenticated users

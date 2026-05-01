-- Block direct client inserts on quiz_error_reports (inserts happen via service role in edge function)
CREATE POLICY "Deny direct inserts on quiz_error_reports"
ON public.quiz_error_reports
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Allow admins to delete quiz error reports
CREATE POLICY "Admins can delete quiz_error_reports"
ON public.quiz_error_reports
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
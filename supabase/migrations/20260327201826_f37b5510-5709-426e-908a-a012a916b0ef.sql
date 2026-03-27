
DROP POLICY IF EXISTS "Users can insert own certificates" ON public.academy_certificates;

CREATE POLICY "Users can insert own certificates"
ON public.academy_certificates
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND score >= 80
  AND EXISTS (
    SELECT 1
    FROM public.academy_progress
    WHERE academy_progress.user_id = auth.uid()
      AND academy_progress.course_id = academy_certificates.course_id
      AND academy_progress.quiz_passed = true
      AND academy_progress.quiz_score >= 80
  )
);

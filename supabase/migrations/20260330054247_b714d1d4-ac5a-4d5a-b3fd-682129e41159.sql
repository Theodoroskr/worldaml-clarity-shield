
-- Fix 1: Remove non-admin SELECT on academy_questions (correct_index exposed)
-- The safe view already exists for client use
DROP POLICY IF EXISTS "Authenticated users can view questions" ON public.academy_questions;

-- Fix 2: Block direct INSERT on academy_certificates
-- Certificates are issued only via submit_quiz_and_issue_certificate (SECURITY DEFINER)
CREATE POLICY "Deny direct certificate inserts"
ON public.academy_certificates
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Also block direct UPDATE
CREATE POLICY "Deny direct certificate updates"
ON public.academy_certificates
FOR UPDATE
TO authenticated
USING (false);

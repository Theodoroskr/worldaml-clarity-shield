-- Revoke broad SELECT grants that were re-added
REVOKE SELECT ON public.academy_questions FROM authenticated;
REVOKE SELECT ON public.academy_questions FROM anon;

-- Grant column-level SELECT excluding correct_index
GRANT SELECT (id, course_id, question, options, explanation, sort_order) ON public.academy_questions TO authenticated;
GRANT SELECT (id, course_id, question, options, explanation, sort_order) ON public.academy_questions TO anon;

-- Ensure service_role retains full access (for submit_quiz_and_issue_certificate RPC)
GRANT SELECT ON public.academy_questions TO service_role;

-- Also drop the overly permissive RLS policy and replace with admin-only + column-restricted
DROP POLICY IF EXISTS "Authenticated users can view questions" ON public.academy_questions;
DROP POLICY IF EXISTS "Users can view published questions" ON public.academy_questions;

CREATE POLICY "Authenticated can view published question columns"
  ON public.academy_questions
  FOR SELECT
  TO authenticated
  USING (course_id IN (SELECT id FROM public.academy_courses WHERE is_published = true));
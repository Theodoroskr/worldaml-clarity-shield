
-- Create a secure view that excludes correct_index from academy_questions
CREATE VIEW public.academy_questions_safe AS
SELECT id, course_id, question, options, explanation, sort_order
FROM public.academy_questions;

-- Grant access to the view for authenticated and anon roles
GRANT SELECT ON public.academy_questions_safe TO authenticated;
GRANT SELECT ON public.academy_questions_safe TO anon;

-- Revoke direct SELECT on the base table from authenticated (admins still have ALL via RLS)
-- We need to use column-level privileges: revoke all then grant only to specific columns
-- Actually, RLS still controls access. Instead, let's drop the permissive SELECT policy
-- for authenticated users and replace it with a policy on the view approach.

-- Better approach: Use column-level GRANT to hide correct_index
-- First revoke the broad SELECT
REVOKE SELECT ON public.academy_questions FROM authenticated;
REVOKE SELECT ON public.academy_questions FROM anon;

-- Grant SELECT on all columns EXCEPT correct_index to authenticated
GRANT SELECT (id, course_id, question, options, explanation, sort_order) ON public.academy_questions TO authenticated;

-- Re-grant full SELECT to service_role (used by SECURITY DEFINER functions)
GRANT SELECT ON public.academy_questions TO service_role;

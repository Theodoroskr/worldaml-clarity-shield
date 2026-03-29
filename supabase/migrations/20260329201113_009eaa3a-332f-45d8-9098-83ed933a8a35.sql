
-- Fix: Change the view to SECURITY INVOKER (default, safe) instead of SECURITY DEFINER
DROP VIEW IF EXISTS public.academy_questions_safe;
CREATE VIEW public.academy_questions_safe WITH (security_invoker = true) AS
SELECT id, course_id, question, options, explanation, sort_order
FROM public.academy_questions;

-- Re-grant view access
GRANT SELECT ON public.academy_questions_safe TO authenticated;
GRANT SELECT ON public.academy_questions_safe TO anon;

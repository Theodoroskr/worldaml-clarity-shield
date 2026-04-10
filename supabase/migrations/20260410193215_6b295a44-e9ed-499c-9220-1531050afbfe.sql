
-- Recreate the safe view without security_invoker so authenticated users can read questions
DROP VIEW IF EXISTS public.academy_questions_safe;

CREATE VIEW public.academy_questions_safe AS
  SELECT id, course_id, question, options, explanation, sort_order
  FROM public.academy_questions;

-- Grant select to authenticated and anon roles
GRANT SELECT ON public.academy_questions_safe TO authenticated;
GRANT SELECT ON public.academy_questions_safe TO anon;

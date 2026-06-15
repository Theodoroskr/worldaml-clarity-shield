DROP VIEW IF EXISTS public.academy_questions_safe;

CREATE VIEW public.academy_questions_safe
WITH (security_invoker = false) AS
SELECT id, course_id, question, options, explanation, sort_order
FROM public.academy_questions;

GRANT SELECT ON public.academy_questions_safe TO anon, authenticated;
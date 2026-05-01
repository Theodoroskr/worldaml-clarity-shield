-- Grant SELECT on academy_questions to authenticated (needed for quiz submission and the safe view)
GRANT SELECT ON public.academy_questions TO authenticated;
GRANT SELECT ON public.academy_questions TO anon;
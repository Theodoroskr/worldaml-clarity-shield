CREATE OR REPLACE FUNCTION public.academy_question_bank_audit()
RETURNS TABLE (
  slug text,
  sort_order integer,
  correct_option text,
  options_length integer,
  correct_index integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.slug,
    q.sort_order,
    (q.options ->> q.correct_index) AS correct_option,
    jsonb_array_length(q.options) AS options_length,
    q.correct_index
  FROM public.academy_questions q
  JOIN public.academy_courses c ON c.id = q.course_id
  ORDER BY c.slug, q.sort_order;
$$;

GRANT EXECUTE ON FUNCTION public.academy_question_bank_audit() TO anon, authenticated;
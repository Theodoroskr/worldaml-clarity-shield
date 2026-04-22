CREATE OR REPLACE FUNCTION public.academy_course_question_counts()
RETURNS TABLE(slug text, question_count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.slug, COUNT(q.id) AS question_count
  FROM public.academy_courses c
  LEFT JOIN public.academy_questions q ON q.course_id = c.id
  WHERE c.is_published = true
  GROUP BY c.slug;
$$;

GRANT EXECUTE ON FUNCTION public.academy_course_question_counts() TO anon, authenticated;
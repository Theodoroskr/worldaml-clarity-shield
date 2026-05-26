-- 1. Revoke client access to the quiz answer key column.
-- The client reads questions via the academy_questions_safe view (which excludes correct_index).
-- Server-side scoring uses submit_quiz_and_issue_certificate (SECURITY DEFINER).
REVOKE SELECT (correct_index) ON public.academy_questions FROM anon, authenticated;

-- 2. Tighten public certificate verification: do not expose user_id.
CREATE OR REPLACE FUNCTION public.get_certificate_by_token(_token text)
 RETURNS json
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT json_build_object(
    'id', c.id,
    'course_id', c.course_id,
    'holder_name', c.holder_name,
    'score', c.score,
    'issued_at', c.issued_at,
    'share_token', c.share_token,
    'academy_courses', json_build_object(
      'id', co.id,
      'title', co.title,
      'slug', co.slug,
      'description', co.description,
      'category', co.category,
      'difficulty', co.difficulty,
      'duration_minutes', co.duration_minutes,
      'cpd_hours', co.cpd_hours,
      'image_url', co.image_url,
      'is_published', co.is_published,
      'sort_order', co.sort_order,
      'created_at', co.created_at
    )
  )
  FROM public.academy_certificates c
  JOIN public.academy_courses co ON co.id = c.course_id
  WHERE c.share_token = _token
  LIMIT 1;
$function$;
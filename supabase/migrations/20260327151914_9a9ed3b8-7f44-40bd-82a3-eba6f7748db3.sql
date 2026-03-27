-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view certificates by share_token" ON public.academy_certificates;

-- Create a security-definer function scoped to a single share_token
CREATE OR REPLACE FUNCTION public.get_certificate_by_token(_token text)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'id', c.id,
    'user_id', c.user_id,
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
$$;
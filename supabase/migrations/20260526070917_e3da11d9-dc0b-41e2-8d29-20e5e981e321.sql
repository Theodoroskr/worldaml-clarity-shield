
-- 1. Drop permissive "true" policy on academy_questions; clients use academy_questions_safe view
DROP POLICY IF EXISTS "Authenticated users can read questions" ON public.academy_questions;

-- 2. Helper: can the current user access a course's paid content?
CREATE OR REPLACE FUNCTION public.has_academy_course_access(_course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.academy_courses c
    WHERE c.id = _course_id
      AND c.is_published = true
      AND (
        public.has_role(auth.uid(), 'admin'::app_role)
        OR c.price_eur_cents = 0
        OR EXISTS (
          SELECT 1 FROM public.academy_course_purchases p
          WHERE p.user_id = auth.uid()
            AND p.course_slug = c.slug
            AND p.status = 'paid'
            AND (p.expires_at IS NULL OR p.expires_at > now())
        )
      )
  );
$$;

REVOKE EXECUTE ON FUNCTION public.has_academy_course_access(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.has_academy_course_access(uuid) TO anon, authenticated;

-- 3. Replace open SELECT policy on academy_modules with gated one
DROP POLICY IF EXISTS "Anyone can view modules of published courses" ON public.academy_modules;

CREATE POLICY "Module access requires purchase, free course, or admin"
ON public.academy_modules
FOR SELECT
USING (public.has_academy_course_access(course_id));

-- 4. Module counts for discovery (Academy listing + Dashboard) without exposing content
CREATE OR REPLACE FUNCTION public.get_academy_module_counts()
RETURNS TABLE(course_id uuid, module_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.course_id, COUNT(*)::bigint AS module_count
  FROM public.academy_modules m
  JOIN public.academy_courses c ON c.id = m.course_id
  WHERE c.is_published = true
  GROUP BY m.course_id;
$$;

REVOKE EXECUTE ON FUNCTION public.get_academy_module_counts() FROM public;
GRANT EXECUTE ON FUNCTION public.get_academy_module_counts() TO anon, authenticated;

-- 5. Lock down the answer-key audit function to admins only
REVOKE EXECUTE ON FUNCTION public.academy_question_bank_audit() FROM anon, authenticated, public;

CREATE OR REPLACE FUNCTION public.academy_question_bank_audit()
RETURNS TABLE(slug text, sort_order integer, correct_option text, options_length integer, correct_index integer)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    c.slug,
    q.sort_order,
    (q.options ->> q.correct_index) AS correct_option,
    jsonb_array_length(q.options) AS options_length,
    q.correct_index
  FROM public.academy_questions q
  JOIN public.academy_courses c ON c.id = q.course_id
  ORDER BY c.slug, q.sort_order;
END;
$$;

GRANT EXECUTE ON FUNCTION public.academy_question_bank_audit() TO authenticated;

-- 6. Block UPDATE (overwrites) on customer-documents bucket
CREATE POLICY "Block customer-documents overwrites"
ON storage.objects
AS RESTRICTIVE
FOR UPDATE
USING (bucket_id <> 'customer-documents')
WITH CHECK (bucket_id <> 'customer-documents');

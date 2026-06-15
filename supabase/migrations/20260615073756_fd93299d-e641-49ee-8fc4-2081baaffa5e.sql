
-- =========================================================================
-- 1) academy_questions: stop relying on a SECURITY DEFINER view.
--    Switch the safe view to security_invoker=true, add a per-user SELECT
--    policy on the underlying table, and revoke column-level access to
--    `correct_index` so the answer key can never leak through the API.
-- =========================================================================
DROP VIEW IF EXISTS public.academy_questions_safe;

CREATE VIEW public.academy_questions_safe
WITH (security_invoker = true) AS
SELECT id, course_id, question, options, explanation, sort_order
FROM public.academy_questions;

GRANT SELECT ON public.academy_questions_safe TO anon, authenticated;

-- Allow signed-in learners to read questions for published courses.
DROP POLICY IF EXISTS "Authenticated can read published course questions"
  ON public.academy_questions;
CREATE POLICY "Authenticated can read published course questions"
  ON public.academy_questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.academy_courses c
      WHERE c.id = academy_questions.course_id
        AND c.is_published = true
    )
  );

-- Lock the answer-key column down at the column level.
REVOKE SELECT (correct_index) ON public.academy_questions FROM anon, authenticated;

-- =========================================================================
-- 2) academy_courses: hide Stripe internal IDs from anonymous visitors.
-- =========================================================================
REVOKE SELECT (stripe_price_id, stripe_product_id)
  ON public.academy_courses FROM anon;

-- =========================================================================
-- 3) admin_form_templates: restrict reads to admins and active Suite members
--    instead of every signed-in user.
-- =========================================================================
DROP POLICY IF EXISTS "Authenticated users can view active templates"
  ON public.admin_form_templates;

CREATE POLICY "Suite members and admins can view active templates"
  ON public.admin_form_templates
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.current_user_has_suite_access()
    )
  );

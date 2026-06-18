
-- 1) Hide Stripe IDs on academy_courses from anon/authenticated; admins fetch via RPC
REVOKE SELECT ON public.academy_courses FROM anon, authenticated;
GRANT SELECT (
  id, title, slug, description, difficulty, duration_minutes, image_url,
  is_published, sort_order, created_at, category, cpd_hours, role_track,
  learning_outcomes, estimated_words, price_eur_cents
) ON public.academy_courses TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.academy_courses TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_courses_with_stripe()
RETURNS TABLE (
  id uuid, slug text, title text, description text, category text,
  difficulty text, duration_minutes integer, cpd_hours numeric,
  is_published boolean, sort_order integer, price_eur_cents integer,
  stripe_product_id text, stripe_price_id text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN QUERY
  SELECT c.id, c.slug, c.title, c.description, c.category, c.difficulty,
         c.duration_minutes, c.cpd_hours, c.is_published, c.sort_order,
         c.price_eur_cents, c.stripe_product_id, c.stripe_price_id
  FROM public.academy_courses c
  ORDER BY c.sort_order;
END; $$;
REVOKE EXECUTE ON FUNCTION public.admin_list_courses_with_stripe() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_courses_with_stripe() TO authenticated;

-- 2) Hide academy_questions.correct_index from authenticated; expose safe columns only.
--    Quiz submission already happens via SECURITY DEFINER RPC submit_quiz_and_issue_certificate.
REVOKE SELECT ON public.academy_questions FROM authenticated;
GRANT SELECT (id, course_id, question, options, explanation, sort_order)
  ON public.academy_questions TO authenticated;

-- 3) Rewrite current_user_has_suite_access to use real data (profiles.subscription_tier / suite_org_members)
CREATE OR REPLACE FUNCTION public.current_user_has_suite_access()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
      AND subscription_tier IN ('suite', 'enterprise')
  ) OR EXISTS (
    SELECT 1 FROM public.suite_org_members WHERE user_id = auth.uid()
  );
$$;

-- 4) FATF country risk: allow anon read (public marketing data)
DROP POLICY IF EXISTS "anon_read_fatf" ON public.fatf_country_risk;
CREATE POLICY "anon_read_fatf" ON public.fatf_country_risk
  FOR SELECT TO anon USING (true);
GRANT SELECT ON public.fatf_country_risk TO anon;

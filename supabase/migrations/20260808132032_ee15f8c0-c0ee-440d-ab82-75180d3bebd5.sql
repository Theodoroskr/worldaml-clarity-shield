
CREATE TABLE public.academy_recognition_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  rank integer NOT NULL,
  description text,
  icon text NOT NULL DEFAULT 'shield',
  min_courses integer NOT NULL DEFAULT 0,
  min_advanced_courses integer NOT NULL DEFAULT 0,
  min_categories integer NOT NULL DEFAULT 0,
  min_certificates integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.academy_recognition_levels TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.academy_recognition_levels TO authenticated;
GRANT ALL ON public.academy_recognition_levels TO service_role;
ALTER TABLE public.academy_recognition_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recognition levels are readable" ON public.academy_recognition_levels FOR SELECT USING (is_active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage recognition levels" ON public.academy_recognition_levels FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_recognition_levels_updated BEFORE UPDATE ON public.academy_recognition_levels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.academy_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon text NOT NULL DEFAULT 'award',
  course_slugs text[] NOT NULL DEFAULT '{}',
  category text,
  required_count integer NOT NULL DEFAULT 3,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.academy_badges TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.academy_badges TO authenticated;
GRANT ALL ON public.academy_badges TO service_role;
ALTER TABLE public.academy_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges are readable" ON public.academy_badges FOR SELECT USING (is_active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage badges" ON public.academy_badges FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_academy_badges_updated BEFORE UPDATE ON public.academy_badges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_recognition_publicly boolean NOT NULL DEFAULT false;

INSERT INTO public.academy_recognition_levels (key, name, rank, description, icon, min_courses, min_advanced_courses, min_categories, min_certificates) VALUES
 ('member','Member',0,'Registered WorldAML Academy member.','user',0,0,0,0),
 ('bronze','Bronze Member',1,'Completed your first WorldAML Academy course.','medal',1,0,0,0),
 ('silver','Silver Member',2,'Three Academy courses completed.','medal',3,0,0,0),
 ('gold','Gold Member',3,'Six Academy courses completed.','medal',6,0,0,0),
 ('platinum','Platinum Member',4,'Ten Academy courses completed.','shield',10,0,0,0),
 ('expert','WorldAML Expert',5,'Twelve courses completed, including three advanced courses, across four compliance categories, with ten certificates earned.','shield-check',12,3,4,10);

INSERT INTO public.academy_badges (key, name, description, icon, course_slugs, category, required_count, sort_order) VALUES
 ('sanctions','Sanctions Specialist','Demonstrated competency across sanctions screening, PEP and adverse media practice.','shield', ARRAY['sanctions-screening-essentials','international-sanctions-compliance','pep-screening-edd','adverse-media-intelligence'], NULL, 3, 1),
 ('kyc-cdd','KYC & CDD Specialist','Core customer due diligence, beneficial ownership and enhanced due diligence.','user-check', ARRAY['kyc-customer-due-diligence','beneficial-ownership','beneficial-ownership-ubo-transparency','pep-screening-edd'], NULL, 3, 2),
 ('aml-practitioner','AML Practitioner','Completed the core AML learning pathway.','scale', ARRAY['aml-fundamentals','risk-based-approach','terrorist-financing-essentials','transaction-monitoring-sar'], NULL, 3, 3),
 ('transaction-monitoring','Transaction Monitoring Specialist','Monitoring, suspicious activity reporting and virtual-asset typologies.','activity', ARRAY['transaction-monitoring-sar','risk-based-approach','crypto-aml','crypto-aml-essentials'], NULL, 3, 4),
 ('regulatory','Regulatory Compliance Specialist','Regional AML regimes across three or more jurisdictions.','landmark', ARRAY[]::text[], 'regional', 3, 5),
 ('risk-governance','Risk & Governance Specialist','Risk-based approach, ownership transparency and MLRO governance.','gauge', ARRAY['risk-based-approach','beneficial-ownership-ubo-transparency','mlro-masterclass','aml-gaming-gambling'], NULL, 3, 6),
 ('mlro','MLRO Development','The governance pathway for money laundering reporting officers.','briefcase', ARRAY['mlro-masterclass','transaction-monitoring-sar','risk-based-approach'], NULL, 3, 7),
 ('sector','Sector Compliance Specialist','Applied AML across regulated professions and industries.','building-2', ARRAY[]::text[], 'sector', 3, 8);

CREATE OR REPLACE FUNCTION public.academy_recognition_status()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _completed integer := 0;
  _advanced integer := 0;
  _categories integer := 0;
  _certs integer := 0;
  _level jsonb;
  _next jsonb;
  _badges jsonb;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('authenticated', false);
  END IF;

  SELECT count(*),
         count(*) FILTER (WHERE c.difficulty = 'advanced'),
         count(DISTINCT c.category)
    INTO _completed, _advanced, _categories
  FROM public.academy_progress p
  JOIN public.academy_courses c ON c.id = p.course_id
  WHERE p.user_id = _uid AND p.quiz_passed = true;

  SELECT count(*) INTO _certs FROM public.academy_certificates WHERE user_id = _uid;

  SELECT to_jsonb(l) INTO _level
  FROM public.academy_recognition_levels l
  WHERE l.is_active
    AND _completed >= l.min_courses
    AND _advanced >= l.min_advanced_courses
    AND _categories >= l.min_categories
    AND _certs >= l.min_certificates
  ORDER BY l.rank DESC LIMIT 1;

  SELECT to_jsonb(l) INTO _next
  FROM public.academy_recognition_levels l
  WHERE l.is_active AND l.rank > COALESCE((_level->>'rank')::int, -1)
  ORDER BY l.rank ASC LIMIT 1;

  SELECT COALESCE(jsonb_agg(b ORDER BY b.sort_order), '[]'::jsonb) INTO _badges
  FROM (
    SELECT bd.key, bd.name, bd.description, bd.icon, bd.required_count, bd.sort_order,
           COALESCE(q.qualifying, '[]'::jsonb) AS qualifying_courses,
           COALESCE(q.earned_count, 0) AS earned_count,
           (COALESCE(q.earned_count, 0) >= bd.required_count) AS earned
    FROM public.academy_badges bd
    LEFT JOIN LATERAL (
      SELECT count(*) FILTER (WHERE pr.quiz_passed) AS earned_count,
             jsonb_agg(jsonb_build_object(
               'slug', c.slug, 'title', c.title, 'category', c.category,
               'difficulty', c.difficulty, 'completed', COALESCE(pr.quiz_passed, false)
             ) ORDER BY c.sort_order) AS qualifying
      FROM public.academy_courses c
      LEFT JOIN public.academy_progress pr ON pr.course_id = c.id AND pr.user_id = _uid
      WHERE c.is_published
        AND ((cardinality(bd.course_slugs) > 0 AND c.slug = ANY(bd.course_slugs))
             OR (bd.category IS NOT NULL AND c.category = bd.category))
    ) q ON true
    WHERE bd.is_active
  ) b;

  RETURN jsonb_build_object(
    'authenticated', true,
    'completed_courses', _completed,
    'advanced_courses', _advanced,
    'categories', _categories,
    'certificates', _certs,
    'level', _level,
    'next_level', _next,
    'badges', _badges
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.academy_recognition_status() TO authenticated;

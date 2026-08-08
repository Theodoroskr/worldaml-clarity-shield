-- ============ Saved reports ============
CREATE TABLE public.admin_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  report_type text NOT NULL DEFAULT 'executive',
  range_key text NOT NULL DEFAULT 'last_30_days',
  portal_filter text NOT NULL DEFAULT 'all',
  recipients text[] NOT NULL DEFAULT '{}',
  format text NOT NULL DEFAULT 'email',
  frequency text NOT NULL DEFAULT 'none',
  is_active boolean NOT NULL DEFAULT true,
  last_run_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_reports TO authenticated;
GRANT ALL ON public.admin_reports TO service_role;
ALTER TABLE public.admin_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage reports" ON public.admin_reports FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER admin_reports_updated_at BEFORE UPDATE ON public.admin_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Report run log ============
CREATE TABLE public.admin_report_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES public.admin_reports(id) ON DELETE SET NULL,
  report_name text NOT NULL,
  report_type text NOT NULL,
  period_start timestamptz,
  period_end timestamptz,
  recipients text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  summary jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_report_runs TO authenticated;
GRANT ALL ON public.admin_report_runs TO service_role;
ALTER TABLE public.admin_report_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read report runs" ON public.admin_report_runs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins write report runs" ON public.admin_report_runs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_admin_report_runs_created ON public.admin_report_runs (created_at DESC);

-- ============ Unified analytics aggregate (read-only) ============
CREATE OR REPLACE FUNCTION public.admin_analytics(_from timestamptz, _to timestamptz)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  _span interval;
  _pfrom timestamptz;
  _pto timestamptz;
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorised';
  END IF;

  _span := _to - _from;
  _pfrom := _from - _span;
  _pto := _from;

  SELECT jsonb_build_object(
    'generated_at', now(),
    'period', jsonb_build_object('from', _from, 'to', _to, 'prev_from', _pfrom, 'prev_to', _pto),

    -- Lifetime (never date-filtered)
    'lifetime', (SELECT jsonb_build_object(
        'total_users', (SELECT count(*) FROM profiles),
        'business_accounts', (SELECT count(*) FROM business_accounts),
        'active_partners', (SELECT count(*) FROM partners WHERE is_active),
        'pending_applications', (SELECT count(*) FROM partner_applications WHERE status = 'pending'),
        'deal_registrations', (SELECT count(*) FROM deal_registrations),
        'certificates', (SELECT count(*) FROM academy_certificates),
        'active_orgs', (SELECT count(*) FROM suite_organizations WHERE status = 'active'),
        'open_alerts', (SELECT count(*) FROM suite_alerts WHERE status = 'open'),
        'suite_users', (SELECT count(*) FROM profiles WHERE subscription_tier = 'suite'),
        'paid_orders', (SELECT count(*) FROM academy_course_purchases WHERE status = 'paid'),
        'revenue_cents', (SELECT coalesce(sum(amount_cents),0) FROM academy_course_purchases WHERE status='paid' AND currency='eur'),
        'suite_screenings', (SELECT count(*) FROM suite_screenings),
        'sanctions_searches', (SELECT count(*) FROM sanctions_searches),
        'leads', (SELECT count(*) FROM form_submissions)
    )),

    -- Current period
    'current', jsonb_build_object(
        'new_users', (SELECT count(*) FROM profiles WHERE created_at >= _from AND created_at < _to),
        'new_leads', (SELECT count(*) FROM form_submissions WHERE created_at >= _from AND created_at < _to),
        'paid_orders', (SELECT count(*) FROM academy_course_purchases WHERE status='paid' AND created_at >= _from AND created_at < _to),
        'revenue_cents', (SELECT coalesce(sum(amount_cents),0) FROM academy_course_purchases WHERE status='paid' AND currency='eur' AND created_at >= _from AND created_at < _to),
        'new_business_accounts', (SELECT count(*) FROM business_accounts WHERE created_at >= _from AND created_at < _to),
        'new_partners', (SELECT count(*) FROM partners WHERE created_at >= _from AND created_at < _to),
        'new_applications', (SELECT count(*) FROM partner_applications WHERE created_at >= _from AND created_at < _to),
        'new_deals', (SELECT count(*) FROM deal_registrations WHERE created_at >= _from AND created_at < _to),
        'deals_won', (SELECT count(*) FROM deal_registrations WHERE won_at IS NOT NULL AND won_at >= _from AND won_at < _to),
        'certificates', (SELECT count(*) FROM academy_certificates WHERE issued_at >= _from AND issued_at < _to),
        'courses_started', (SELECT count(*) FROM academy_progress WHERE created_at >= _from AND created_at < _to),
        'courses_completed', (SELECT count(*) FROM academy_progress WHERE completed_at IS NOT NULL AND completed_at >= _from AND completed_at < _to),
        'sanctions_searches', (SELECT count(*) FROM sanctions_searches WHERE created_at >= _from AND created_at < _to),
        'suite_screenings', (SELECT count(*) FROM suite_screenings WHERE created_at >= _from AND created_at < _to),
        'business_events', (SELECT count(*) FROM business_events WHERE created_at >= _from AND created_at < _to),
        'active_users', (SELECT count(DISTINCT u) FROM (
            SELECT user_id u FROM academy_progress WHERE created_at >= _from AND created_at < _to
            UNION SELECT user_id FROM business_events WHERE created_at >= _from AND created_at < _to
            UNION SELECT user_id FROM sanctions_searches WHERE created_at >= _from AND created_at < _to
            UNION SELECT user_id FROM outreach_events WHERE created_at >= _from AND created_at < _to
        ) s WHERE u IS NOT NULL)
    ),

    -- Previous equal-length period (for deltas)
    'previous', jsonb_build_object(
        'new_users', (SELECT count(*) FROM profiles WHERE created_at >= _pfrom AND created_at < _pto),
        'new_leads', (SELECT count(*) FROM form_submissions WHERE created_at >= _pfrom AND created_at < _pto),
        'paid_orders', (SELECT count(*) FROM academy_course_purchases WHERE status='paid' AND created_at >= _pfrom AND created_at < _pto),
        'revenue_cents', (SELECT coalesce(sum(amount_cents),0) FROM academy_course_purchases WHERE status='paid' AND currency='eur' AND created_at >= _pfrom AND created_at < _pto),
        'new_business_accounts', (SELECT count(*) FROM business_accounts WHERE created_at >= _pfrom AND created_at < _pto),
        'new_partners', (SELECT count(*) FROM partners WHERE created_at >= _pfrom AND created_at < _pto),
        'new_applications', (SELECT count(*) FROM partner_applications WHERE created_at >= _pfrom AND created_at < _pto),
        'new_deals', (SELECT count(*) FROM deal_registrations WHERE created_at >= _pfrom AND created_at < _pto),
        'certificates', (SELECT count(*) FROM academy_certificates WHERE issued_at >= _pfrom AND issued_at < _pto),
        'courses_started', (SELECT count(*) FROM academy_progress WHERE created_at >= _pfrom AND created_at < _pto),
        'courses_completed', (SELECT count(*) FROM academy_progress WHERE completed_at IS NOT NULL AND completed_at >= _pfrom AND completed_at < _pto),
        'sanctions_searches', (SELECT count(*) FROM sanctions_searches WHERE created_at >= _pfrom AND created_at < _pto),
        'suite_screenings', (SELECT count(*) FROM suite_screenings WHERE created_at >= _pfrom AND created_at < _pto)
    ),

    -- Daily series over the selected period
    'series', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
        'date', d::date,
        'users', (SELECT count(*) FROM profiles p WHERE p.created_at >= d AND p.created_at < d + interval '1 day'),
        'leads', (SELECT count(*) FROM form_submissions f WHERE f.created_at >= d AND f.created_at < d + interval '1 day'),
        'revenue_cents', (SELECT coalesce(sum(amount_cents),0) FROM academy_course_purchases a WHERE a.status='paid' AND a.currency='eur' AND a.created_at >= d AND a.created_at < d + interval '1 day'),
        'orders', (SELECT count(*) FROM academy_course_purchases a WHERE a.status='paid' AND a.created_at >= d AND a.created_at < d + interval '1 day'),
        'certificates', (SELECT count(*) FROM academy_certificates c WHERE c.issued_at >= d AND c.issued_at < d + interval '1 day'),
        'starts', (SELECT count(*) FROM academy_progress g WHERE g.created_at >= d AND g.created_at < d + interval '1 day'),
        'searches', (SELECT count(*) FROM sanctions_searches s WHERE s.created_at >= d AND s.created_at < d + interval '1 day'),
        'business_signups', (SELECT count(*) FROM business_accounts b WHERE b.created_at >= d AND b.created_at < d + interval '1 day')
      ) ORDER BY d), '[]'::jsonb)
      FROM generate_series(date_trunc('day', _from), date_trunc('day', _to - interval '1 second'), interval '1 day') d
      WHERE (_to - _from) <= interval '400 days'
    ),

    -- Academy
    'academy', jsonb_build_object(
      'learners_with_activity', (SELECT count(DISTINCT user_id) FROM academy_progress),
      'paying_users', (SELECT count(DISTINCT user_id) FROM academy_course_purchases WHERE status='paid'),
      'repeat_purchasers', (SELECT count(*) FROM (SELECT user_id FROM academy_course_purchases WHERE status='paid' GROUP BY 1 HAVING count(*) > 1) r),
      'completion_rate', (SELECT CASE WHEN count(*)=0 THEN 0 ELSE round(100.0 * count(*) FILTER (WHERE completed_at IS NOT NULL) / count(*), 1) END FROM academy_progress),
      'no_activity_users', (SELECT count(*) FROM profiles p WHERE NOT EXISTS (SELECT 1 FROM academy_progress g WHERE g.user_id = p.user_id)),
      'top_courses', (SELECT coalesce(jsonb_agg(x), '[]'::jsonb) FROM (
          SELECT c.title, c.slug, count(g.id) AS enrolments,
                 count(g.id) FILTER (WHERE g.completed_at IS NOT NULL) AS completions
          FROM academy_progress g JOIN academy_courses c ON c.id = g.course_id
          GROUP BY c.title, c.slug ORDER BY count(g.id) DESC LIMIT 5) x),
      'revenue_by_course', (SELECT coalesce(jsonb_agg(x), '[]'::jsonb) FROM (
          SELECT course_slug AS slug, count(*) AS orders, coalesce(sum(amount_cents),0) AS revenue_cents
          FROM academy_course_purchases WHERE status='paid' AND currency='eur'
          GROUP BY course_slug ORDER BY sum(amount_cents) DESC NULLS LAST LIMIT 5) x),
      'funnel', jsonb_build_object(
          'signups', (SELECT count(*) FROM profiles),
          'started', (SELECT count(DISTINCT user_id) FROM academy_progress),
          'completed', (SELECT count(DISTINCT user_id) FROM academy_progress WHERE completed_at IS NOT NULL),
          'certified', (SELECT count(DISTINCT user_id) FROM academy_certificates))
    ),

    -- Business
    'business', jsonb_build_object(
      'total', (SELECT count(*) FROM business_accounts),
      'entitlements', (SELECT count(*) FROM business_entitlements),
      'active_entitlements', (SELECT count(*) FROM business_entitlements WHERE status='active'),
      'members', (SELECT count(*) FROM business_members),
      'by_status', (SELECT coalesce(jsonb_object_agg(coalesce(status,'unknown'), n), '{}'::jsonb)
                    FROM (SELECT status, count(*) n FROM business_accounts GROUP BY 1) s),
      'funnel', jsonb_build_object(
          'signups', (SELECT count(*) FROM business_accounts),
          'solutions_viewed', (SELECT count(DISTINCT business_account_id) FROM business_events WHERE event_type='solutions_viewed'),
          'product_viewed', (SELECT count(DISTINCT business_account_id) FROM business_events WHERE event_type IN ('product_viewed','product_detail_viewed')),
          'checkout_started', (SELECT count(DISTINCT business_account_id) FROM business_events WHERE event_type='checkout_started'),
          'purchased', (SELECT count(DISTINCT business_account_id) FROM business_entitlements)),
      'top_products', (SELECT coalesce(jsonb_agg(x), '[]'::jsonb) FROM (
          SELECT coalesce(product_key,'unspecified') AS product, count(*) AS views
          FROM business_events WHERE product_key IS NOT NULL GROUP BY 1 ORDER BY 2 DESC LIMIT 5) x)
    ),

    -- Partners
    'partners', jsonb_build_object(
      'active', (SELECT count(*) FROM partners WHERE is_active),
      'by_type', (SELECT coalesce(jsonb_object_agg(coalesce(partner_type::text,'unknown'), n), '{}'::jsonb)
                  FROM (SELECT partner_type, count(*) n FROM partners GROUP BY 1) s),
      'by_certification', (SELECT coalesce(jsonb_object_agg(coalesce(certification_level::text,'none'), n), '{}'::jsonb)
                  FROM (SELECT certification_level, count(*) n FROM partners GROUP BY 1) s),
      'deals_by_status', (SELECT coalesce(jsonb_object_agg(coalesce(status::text,'unknown'), n), '{}'::jsonb)
                  FROM (SELECT status, count(*) n FROM deal_registrations GROUP BY 1) s),
      'pipeline_eur', (SELECT coalesce(sum(estimated_arr_eur),0) FROM deal_registrations WHERE won_at IS NULL AND status NOT IN ('rejected','lost','expired')),
      'won_eur', (SELECT coalesce(sum(coalesce(actual_arr_eur, estimated_arr_eur)),0) FROM deal_registrations WHERE won_at IS NOT NULL),
      'avg_deal_eur', (SELECT coalesce(round(avg(estimated_arr_eur)),0) FROM deal_registrations WHERE estimated_arr_eur IS NOT NULL),
      'commission_earned_cents', (SELECT coalesce(sum(amount_cents),0) FROM partner_commissions),
      'commission_paid_cents', (SELECT coalesce(sum(amount_cents),0) FROM partner_commissions WHERE status='paid'),
      'referrals', (SELECT count(*) FROM referrals),
      'funnel', jsonb_build_object(
          'applications', (SELECT count(*) FROM partner_applications),
          'approved', (SELECT count(*) FROM partner_applications WHERE status='approved'),
          'registered_deal', (SELECT count(DISTINCT partner_id) FROM deal_registrations),
          'approved_deal', (SELECT count(DISTINCT partner_id) FROM deal_registrations WHERE status='approved'),
          'won_deal', (SELECT count(DISTINCT partner_id) FROM deal_registrations WHERE won_at IS NOT NULL)),
      'top_partners', (SELECT coalesce(jsonb_agg(x), '[]'::jsonb) FROM (
          SELECT coalesce(p.display_name, p.referral_code) AS name,
                 count(d.id) AS deals,
                 coalesce(sum(d.estimated_arr_eur),0) AS pipeline_eur
          FROM partners p LEFT JOIN deal_registrations d ON d.partner_id = p.id
          GROUP BY 1 ORDER BY count(d.id) DESC, 3 DESC LIMIT 5) x)
    ),

    -- Marketing / leads (period scoped)
    'marketing', jsonb_build_object(
      'by_form_type', (SELECT coalesce(jsonb_agg(x), '[]'::jsonb) FROM (
          SELECT coalesce(form_type,'unknown') AS label, count(*) AS n FROM form_submissions
          WHERE created_at >= _from AND created_at < _to GROUP BY 1 ORDER BY 2 DESC LIMIT 8) x),
      'by_status', (SELECT coalesce(jsonb_object_agg(coalesce(lead_status,'new'), n), '{}'::jsonb)
          FROM (SELECT lead_status, count(*) n FROM form_submissions WHERE created_at >= _from AND created_at < _to GROUP BY 1) s),
      'by_country', (SELECT coalesce(jsonb_agg(x), '[]'::jsonb) FROM (
          SELECT coalesce(nullif(country,''),'Unknown') AS label, count(*) AS n FROM form_submissions
          WHERE created_at >= _from AND created_at < _to GROUP BY 1 ORDER BY 2 DESC LIMIT 5) x),
      'by_referrer', (SELECT coalesce(jsonb_agg(x), '[]'::jsonb) FROM (
          SELECT coalesce(substring(metadata->'attribution'->>'referrer' from '^https?://(?:www\.)?([^/]+)'), 'direct') AS label,
                 count(*) AS n FROM form_submissions
          WHERE created_at >= _from AND created_at < _to GROUP BY 1 ORDER BY 2 DESC LIMIT 5) x),
      'by_utm_source', (SELECT coalesce(jsonb_agg(x), '[]'::jsonb) FROM (
          SELECT metadata->'attribution'->>'utm_source' AS label, count(*) AS n FROM form_submissions
          WHERE created_at >= _from AND created_at < _to AND nullif(metadata->'attribution'->>'utm_source','') IS NOT NULL
          GROUP BY 1 ORDER BY 2 DESC LIMIT 5) x),
      'by_signup_source', (SELECT coalesce(jsonb_agg(x), '[]'::jsonb) FROM (
          SELECT coalesce(nullif(signup_source,''),'direct') AS label, count(*) AS n FROM profiles
          WHERE created_at >= _from AND created_at < _to GROUP BY 1 ORDER BY 2 DESC LIMIT 5) x)
    ),

    -- Action centre (always current state)
    'actions', jsonb_build_object(
      'pending_partner_apps', (SELECT count(*) FROM partner_applications WHERE status='pending'),
      'deals_pending_review', (SELECT count(*) FROM deal_registrations WHERE status='pending'),
      'unreconciled_purchases', (SELECT count(*) FROM academy_course_purchases WHERE status='pending' AND created_at < now() - interval '1 hour'),
      'open_alerts', (SELECT count(*) FROM suite_alerts WHERE status='open'),
      'new_leads_untouched', (SELECT count(*) FROM form_submissions WHERE coalesce(lead_status,'new')='new'),
      'pending_business_accounts', (SELECT count(*) FROM business_accounts WHERE status <> 'active'),
      'pending_cobrand_requests', (SELECT count(*) FROM partner_cobrand_requests WHERE status='pending'),
      'courses_missing_price', (SELECT count(*) FROM academy_courses WHERE is_published AND (price_eur_cents IS NULL OR stripe_price_id IS NULL))
    )
  ) INTO result;

  RETURN result;
END;
$fn$;

REVOKE ALL ON FUNCTION public.admin_analytics(timestamptz, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_analytics(timestamptz, timestamptz) TO authenticated;
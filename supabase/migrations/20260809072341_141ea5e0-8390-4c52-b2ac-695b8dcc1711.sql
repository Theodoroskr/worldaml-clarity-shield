-- Internal helper must not be callable from the API
REVOKE EXECUTE ON FUNCTION public.record_ecosystem_event(TEXT, TEXT, UUID, UUID, UUID, TEXT, JSONB) FROM PUBLIC, anon, authenticated;

-- ── USER 360 ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_user_360(_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result JSONB;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorised';
  END IF;

  SELECT jsonb_build_object(
    'identity', (
      SELECT to_jsonb(p) - 'billing_address' - 'vat_number'
      FROM public.profiles p WHERE p.id = _user_id
    ),
    'auth', (
      SELECT jsonb_build_object('last_sign_in_at', u.last_sign_in_at,
                                'email_confirmed_at', u.email_confirmed_at,
                                'auth_created_at', u.created_at)
      FROM auth.users u WHERE u.id = _user_id
    ),
    'roles', COALESCE((SELECT jsonb_agg(r.role) FROM public.user_roles r WHERE r.user_id = _user_id), '[]'::jsonb),
    'academy', jsonb_build_object(
      'purchases', COALESCE((SELECT jsonb_agg(jsonb_build_object(
            'id', a.id, 'course_slug', a.course_slug, 'status', a.status,
            'amount_cents', a.amount_cents, 'currency', a.currency,
            'refund_amount_cents', a.refund_amount_cents,
            'paid_at', a.paid_at, 'created_at', a.created_at) ORDER BY a.created_at DESC)
          FROM public.academy_course_purchases a WHERE a.user_id = _user_id), '[]'::jsonb),
      'progress', COALESCE((SELECT jsonb_agg(jsonb_build_object(
            'course_id', pr.course_id, 'quiz_score', pr.quiz_score,
            'quiz_passed', pr.quiz_passed, 'completed_at', pr.completed_at))
          FROM public.academy_progress pr WHERE pr.user_id = _user_id), '[]'::jsonb),
      'certificates', COALESCE((SELECT jsonb_agg(jsonb_build_object(
            'course_id', c.course_id, 'score', c.score, 'issued_at', c.issued_at))
          FROM public.academy_certificates c WHERE c.user_id = _user_id), '[]'::jsonb)
    ),
    'business', jsonb_build_object(
      'accounts', COALESCE((SELECT jsonb_agg(jsonb_build_object(
            'id', b.id, 'company_name', b.company_name, 'status', b.status,
            'country', b.country, 'created_at', b.created_at))
          FROM public.business_accounts b WHERE b.user_id = _user_id), '[]'::jsonb),
      'memberships', COALESCE((SELECT jsonb_agg(jsonb_build_object(
            'business_account_id', m.business_account_id, 'role', m.role))
          FROM public.business_members m WHERE m.user_id = _user_id), '[]'::jsonb)
    ),
    'partner', (
      SELECT jsonb_build_object(
        'partner', jsonb_build_object('id', pa.id, 'display_name', pa.display_name,
            'partner_type', pa.partner_type, 'is_active', pa.is_active,
            'portal_access', pa.portal_access, 'referral_code', pa.referral_code,
            'commission_rate', pa.commission_rate, 'partner_since', pa.partner_since),
        'deals', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', d.id, 'prospect_company', d.prospect_company,
              'status', d.status, 'estimated_arr_eur', d.estimated_arr_eur, 'actual_arr_eur', d.actual_arr_eur))
            FROM public.deal_registrations d WHERE d.partner_id = pa.id), '[]'::jsonb),
        'referrals', COALESCE((SELECT count(*) FROM public.referrals rf WHERE rf.partner_id = pa.id), 0),
        'commission_cents', COALESCE((SELECT sum(pc.amount_cents) FROM public.partner_commissions pc WHERE pc.partner_id = pa.id), 0)
      )
      FROM public.partners pa WHERE pa.user_id = _user_id LIMIT 1
    ),
    'suite', jsonb_build_object(
      'memberships', COALESCE((SELECT jsonb_agg(jsonb_build_object(
            'organisation_id', som.organisation_id, 'role', som.role))
          FROM public.suite_org_members som WHERE som.user_id = _user_id), '[]'::jsonb),
      'screenings', COALESCE((SELECT count(*) FROM public.suite_screenings s WHERE s.user_id = _user_id), 0)
    ),
    'acquisition', (
      SELECT jsonb_build_object('signup_source', p.signup_source, 'signup_utm', p.signup_utm,
             'signup_landing_path', p.signup_landing_path, 'signup_referrer', p.signup_referrer,
             'signup_date', p.created_at, 'last_activity_at', p.last_activity_at)
      FROM public.profiles p WHERE p.id = _user_id
    ),
    'commercial', jsonb_build_object(
      'academy_gross_cents', COALESCE((SELECT sum(a.amount_cents) FROM public.academy_course_purchases a
          WHERE a.user_id = _user_id AND a.status = 'paid'), 0),
      'academy_refunded_cents', COALESCE((SELECT sum(a.refund_amount_cents) FROM public.academy_course_purchases a
          WHERE a.user_id = _user_id), 0),
      'paid_orders', COALESCE((SELECT count(*) FROM public.academy_course_purchases a
          WHERE a.user_id = _user_id AND a.status = 'paid'), 0)
    ),
    'timeline', COALESCE((SELECT jsonb_agg(jsonb_build_object(
          'event_type', e.event_type, 'portal', e.portal, 'occurred_at', e.occurred_at,
          'metadata', e.metadata) ORDER BY e.occurred_at DESC)
        FROM (SELECT * FROM public.ecosystem_events ev WHERE ev.user_id = _user_id
              ORDER BY ev.occurred_at DESC LIMIT 50) e), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_user_360(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_user_360(UUID) TO authenticated;

-- ── COMPANY 360 ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_company_360(_business_account_id UUID DEFAULT NULL, _domain TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result JSONB; dom TEXT; acct public.business_accounts%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorised';
  END IF;

  IF _business_account_id IS NOT NULL THEN
    SELECT * INTO acct FROM public.business_accounts WHERE id = _business_account_id;
    dom := lower(split_part(COALESCE(acct.work_email, ''), '@', 2));
  ELSE
    dom := lower(_domain);
  END IF;

  IF dom IS NULL OR dom = '' THEN
    RETURN jsonb_build_object('error', 'no reliable company identifier');
  END IF;

  SELECT jsonb_build_object(
    'domain', dom,
    'account', CASE WHEN acct.id IS NULL THEN NULL ELSE to_jsonb(acct) END,
    'users', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', p.id, 'email', p.email,
          'full_name', p.full_name, 'job_title', p.job_title, 'created_at', p.created_at,
          'last_activity_at', p.last_activity_at) ORDER BY p.created_at)
        FROM public.profiles p WHERE lower(split_part(p.email, '@', 2)) = dom), '[]'::jsonb),
    'academy', jsonb_build_object(
      'learners', COALESCE((SELECT count(DISTINCT a.user_id) FROM public.academy_course_purchases a
          JOIN public.profiles p ON p.id = a.user_id
          WHERE lower(split_part(p.email, '@', 2)) = dom AND a.status = 'paid'), 0),
      'gross_cents', COALESCE((SELECT sum(a.amount_cents) FROM public.academy_course_purchases a
          JOIN public.profiles p ON p.id = a.user_id
          WHERE lower(split_part(p.email, '@', 2)) = dom AND a.status = 'paid'), 0),
      'certificates', COALESCE((SELECT count(*) FROM public.academy_certificates c
          JOIN public.profiles p ON p.id = c.user_id
          WHERE lower(split_part(p.email, '@', 2)) = dom), 0)
    ),
    'products', COALESCE((SELECT jsonb_agg(jsonb_build_object('product_key', be.product_key,
          'plan', be.plan, 'status', be.status, 'seats', be.seats, 'renews_at', be.renews_at))
        FROM public.business_entitlements be WHERE be.business_account_id = acct.id), '[]'::jsonb),
    'partner', (SELECT jsonb_build_object('id', pa.id, 'display_name', pa.display_name,
          'partner_type', pa.partner_type, 'is_active', pa.is_active)
        FROM public.partners pa JOIN public.profiles p ON p.id = pa.user_id
        WHERE lower(split_part(p.email, '@', 2)) = dom LIMIT 1),
    'deals', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', d.id, 'prospect_company', d.prospect_company,
          'status', d.status, 'estimated_arr_eur', d.estimated_arr_eur))
        FROM public.deal_registrations d
        WHERE lower(split_part(COALESCE(d.prospect_email, ''), '@', 2)) = dom), '[]'::jsonb),
    'leads', COALESCE((SELECT count(*) FROM public.form_submissions f
        WHERE lower(split_part(COALESCE(f.email, ''), '@', 2)) = dom), 0)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_company_360(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_company_360(UUID, TEXT) TO authenticated;

-- ── DATA QUALITY ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_data_quality()
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result JSONB;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorised';
  END IF;

  SELECT jsonb_build_object(
    'stale_pending_payments', COALESCE((SELECT jsonb_agg(x) FROM (
        SELECT a.id, a.user_id, a.course_slug, a.amount_cents, a.created_at, a.stripe_session_id
        FROM public.academy_course_purchases a
        WHERE a.status = 'pending' AND a.created_at < now() - interval '2 hours'
        ORDER BY a.created_at DESC LIMIT 50) x), '[]'::jsonb),
    'purchases_without_user', COALESCE((SELECT jsonb_agg(x) FROM (
        SELECT a.id, a.course_slug, a.created_at FROM public.academy_course_purchases a
        LEFT JOIN public.profiles p ON p.id = a.user_id
        WHERE p.id IS NULL ORDER BY a.created_at DESC LIMIT 50) x), '[]'::jsonb),
    'portal_access_without_partner_record', COALESCE((SELECT jsonb_agg(x) FROM (
        SELECT pa.id, pa.display_name, pa.user_id FROM public.partners pa
        WHERE pa.portal_access IS TRUE AND pa.is_active IS NOT TRUE LIMIT 50) x), '[]'::jsonb),
    'orphaned_business_members', COALESCE((SELECT jsonb_agg(x) FROM (
        SELECT m.id, m.user_id, m.business_account_id FROM public.business_members m
        LEFT JOIN public.business_accounts b ON b.id = m.business_account_id
        WHERE b.id IS NULL LIMIT 50) x), '[]'::jsonb),
    'duplicate_identities', COALESCE((SELECT jsonb_agg(x) FROM (
        SELECT lower(p.email) AS email, count(*) AS profiles
        FROM public.profiles p WHERE p.email IS NOT NULL
        GROUP BY lower(p.email) HAVING count(*) > 1 LIMIT 50) x), '[]'::jsonb),
    'approved_apps_without_partner', COALESCE((SELECT jsonb_agg(x) FROM (
        SELECT ap.id, ap.company_name, ap.contact_email FROM public.partner_applications ap
        LEFT JOIN public.partners pa ON pa.user_id = ap.user_id
        WHERE ap.status = 'approved' AND pa.id IS NULL LIMIT 50) x), '[]'::jsonb),
    'generated_at', to_jsonb(now())
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_data_quality() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_data_quality() TO authenticated;
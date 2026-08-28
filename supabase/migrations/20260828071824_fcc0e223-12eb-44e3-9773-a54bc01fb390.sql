CREATE OR REPLACE FUNCTION public.admin_screening_overview()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  SELECT jsonb_build_object(
    'totals', (
      SELECT jsonb_build_object(
        'active_subscriptions', (SELECT count(*) FROM public.screening_subscriptions WHERE status = 'active'),
        'total_subscriptions', (SELECT count(*) FROM public.screening_subscriptions),
        'searches_30d', (SELECT count(*) FROM public.screening_searches WHERE created_at > now() - interval '30 days'),
        'open_cases', (SELECT count(*) FROM public.screening_cases WHERE status NOT IN ('closed','false_positives_resolved','no_potential_matches')),
        'monitored_subjects', (SELECT count(*) FROM public.monitoring_subjects WHERE status = 'active'),
        'pending_modules', (SELECT count(*) FROM public.screening_org_modules WHERE status = 'requested'),
        'active_modules', (SELECT count(*) FROM public.screening_org_modules WHERE status = 'active')
      )
    ),
    'subscriptions', COALESCE((
      SELECT jsonb_agg(x ORDER BY x->>'created_at' DESC)
      FROM (
        SELECT jsonb_build_object(
          'id', s.id,
          'organisation_id', s.organisation_id,
          'organisation_name', o.name,
          'plan', s.plan,
          'status', s.status,
          'monitored_entity_quota', s.monitored_entity_quota,
          'current_period_end', s.current_period_end,
          'created_at', s.created_at,
          'stripe_subscription_id', s.stripe_subscription_id
        ) AS x
        FROM public.screening_subscriptions s
        LEFT JOIN public.suite_organizations o ON o.id = s.organisation_id
      ) t
    ), '[]'::jsonb),
    'modules', COALESCE((
      SELECT jsonb_agg(x ORDER BY x->>'requested_at' DESC)
      FROM (
        SELECT jsonb_build_object(
          'id', m.id,
          'organisation_id', m.organisation_id,
          'organisation_name', o.name,
          'module', m.module,
          'status', m.status,
          'monthly_price_eur', m.monthly_price_eur,
          'requested_at', m.requested_at,
          'activated_at', m.activated_at,
          'cancelled_at', m.cancelled_at,
          'current_period_end', m.current_period_end,
          'notes', m.notes,
          'requested_by_email', p.email
        ) AS x
        FROM public.screening_org_modules m
        LEFT JOIN public.suite_organizations o ON o.id = m.organisation_id
        LEFT JOIN public.profiles p ON p.id = m.requested_by
      ) t
    ), '[]'::jsonb),
    'organisations', COALESCE((
      SELECT jsonb_agg(x ORDER BY (x->>'searches_30d')::int DESC)
      FROM (
        SELECT jsonb_build_object(
          'organisation_id', o.id,
          'organisation_name', o.name,
          'country', o.country,
          'members', (SELECT count(*) FROM public.suite_org_members mm WHERE mm.organization_id = o.id),
          'searches_30d', (SELECT count(*) FROM public.screening_searches ss WHERE ss.organisation_id = o.id AND ss.created_at > now() - interval '30 days'),
          'searches_total', (SELECT count(*) FROM public.screening_searches ss WHERE ss.organisation_id = o.id),
          'open_cases', (SELECT count(*) FROM public.screening_cases sc WHERE sc.organisation_id = o.id AND sc.status NOT IN ('closed','false_positives_resolved','no_potential_matches')),
          'monitored', (SELECT count(*) FROM public.monitoring_subjects ms WHERE ms.organisation_id = o.id AND ms.status = 'active'),
          'subscription_status', (SELECT s.status FROM public.screening_subscriptions s WHERE s.organisation_id = o.id ORDER BY s.created_at DESC LIMIT 1),
          'plan', (SELECT s.plan FROM public.screening_subscriptions s WHERE s.organisation_id = o.id ORDER BY s.created_at DESC LIMIT 1)
        ) AS x
        FROM public.suite_organizations o
      ) t
    ), '[]'::jsonb),
    'recent_searches', COALESCE((
      SELECT jsonb_agg(x ORDER BY x->>'created_at' DESC)
      FROM (
        SELECT jsonb_build_object(
          'id', ss.id,
          'reference', ss.reference,
          'organisation_name', o.name,
          'status', ss.status,
          'created_at', ss.created_at,
          'monitoring_requested', ss.monitoring_requested
        ) AS x
        FROM public.screening_searches ss
        LEFT JOIN public.suite_organizations o ON o.id = ss.organisation_id
        ORDER BY ss.created_at DESC
        LIMIT 25
      ) t
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_screening_overview() FROM public;
GRANT EXECUTE ON FUNCTION public.admin_screening_overview() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_screening_module(
  _module_id uuid,
  _status text,
  _monthly_price_eur numeric DEFAULT NULL,
  _current_period_end timestamptz DEFAULT NULL,
  _notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  row_out public.screening_org_modules;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  IF _status NOT IN ('requested','active','cancelled','expired') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  UPDATE public.screening_org_modules m
  SET status = _status,
      monthly_price_eur = COALESCE(_monthly_price_eur, m.monthly_price_eur),
      current_period_end = COALESCE(_current_period_end, m.current_period_end),
      notes = COALESCE(_notes, m.notes),
      activated_at = CASE WHEN _status = 'active' THEN COALESCE(m.activated_at, now()) ELSE m.activated_at END,
      cancelled_at = CASE WHEN _status = 'cancelled' THEN now() ELSE NULL END
  WHERE m.id = _module_id
  RETURNING * INTO row_out;

  IF row_out.id IS NULL THEN
    RAISE EXCEPTION 'Module not found';
  END IF;

  RETURN to_jsonb(row_out);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_screening_module(uuid, text, numeric, timestamptz, text) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_set_screening_module(uuid, text, numeric, timestamptz, text) TO authenticated;
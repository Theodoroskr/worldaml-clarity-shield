-- ============================================================
-- WorldAML Screening & Monitoring: annual packages + quota model
-- ============================================================

-- 1. Add annual quota columns to screening_subscriptions
ALTER TABLE public.screening_subscriptions
  ADD COLUMN IF NOT EXISTS search_quota_annual integer,
  ADD COLUMN IF NOT EXISTS monitor_quota integer,
  ADD COLUMN IF NOT EXISTS seat_quota integer;

-- Backfill existing subscriptions from the new annual plan table.
-- Plans are annual; the same number applies to searches and monitored entities.
UPDATE public.screening_subscriptions
SET
  search_quota_annual = CASE lower(plan)
    WHEN 'demo'        THEN 5
    WHEN 'essentials'  THEN 500
    WHEN 'starter'     THEN 1000
    WHEN 'professional'THEN 2000
    WHEN 'compliance'  THEN 5000
    WHEN 'enterprise'  THEN NULL
    ELSE search_quota_annual
  END,
  monitor_quota = CASE lower(plan)
    WHEN 'demo'        THEN 0
    WHEN 'essentials'  THEN 100
    WHEN 'starter'     THEN 200
    WHEN 'professional'THEN 500
    WHEN 'compliance'  THEN 1000
    WHEN 'enterprise'  THEN NULL
    ELSE monitor_quota
  END,
  seat_quota = CASE lower(plan)
    WHEN 'demo'        THEN 1
    WHEN 'essentials'  THEN 1
    WHEN 'starter'     THEN 3
    WHEN 'professional'THEN 5
    WHEN 'compliance'  THEN 10
    WHEN 'enterprise'  THEN NULL
    ELSE seat_quota
  END
WHERE search_quota_annual IS NULL;

-- 2. SLA configuration table for case management
CREATE TABLE IF NOT EXISTS public.screening_sla_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES public.suite_organizations(id) ON DELETE CASCADE,
  high_sla_hours integer NOT NULL DEFAULT 4,
  medium_sla_hours integer NOT NULL DEFAULT 24,
  low_sla_hours integer NOT NULL DEFAULT 72,
  auto_escalate boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id)
);

GRANT SELECT, INSERT, UPDATE ON public.screening_sla_settings TO authenticated;
GRANT ALL ON public.screening_sla_settings TO service_role;
ALTER TABLE public.screening_sla_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organisation members can read their SLA settings"
  ON public.screening_sla_settings
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.suite_org_members m
    WHERE m.organization_id = screening_sla_settings.organisation_id AND m.user_id = auth.uid()
  ));

CREATE POLICY "Screening admins can manage their SLA settings"
  ON public.screening_sla_settings
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.product_members pm
    WHERE pm.organisation_id = screening_sla_settings.organisation_id
      AND pm.product = 'screening'::public.product_key
      AND pm.user_id = auth.uid()
      AND pm.role = 'admin'::public.product_role
  ));

-- 3. Helper: read effective screening quota for an organisation
CREATE OR REPLACE FUNCTION public.get_screening_org_quota(_org_id uuid)
RETURNS TABLE (
  plan text,
  status text,
  search_quota_annual integer,
  monitor_quota integer,
  seat_quota integer,
  current_period_end timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Prefer product_access registry
  SELECT
    pa.plan::text,
    pa.status::text,
    COALESCE((pa.metadata->>'search_quota_annual')::integer, s.search_quota_annual),
    COALESCE((pa.metadata->>'monitor_quota')::integer, s.monitor_quota),
    COALESCE(pa.seats, s.seat_quota),
    pa.current_period_end
  FROM public.product_access pa
  LEFT JOIN public.screening_subscriptions s
    ON s.organisation_id = pa.organisation_id
  WHERE pa.organisation_id = _org_id
    AND pa.product = 'screening'::public.product_key
    AND pa.status IN ('active', 'trial')
  ORDER BY pa.created_at DESC
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_screening_org_quota(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_screening_org_quota(uuid) TO authenticated, service_role;

-- 4. Update entitlement function to expose annual quotas
DROP FUNCTION IF EXISTS public.current_user_screening_entitlement();

CREATE OR REPLACE FUNCTION public.current_user_screening_entitlement()
RETURNS TABLE (
  has_access boolean,
  is_admin boolean,
  plan text,
  status text,
  search_quota_annual integer,
  monitor_quota integer,
  seat_quota integer,
  seats_used integer,
  monitored_entity_quota integer,
  current_period_end timestamp with time zone
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RETURN QUERY SELECT false, false, NULL::text, NULL::text,
                        NULL::integer, NULL::integer, NULL::integer, NULL::integer,
                        NULL::integer, NULL::timestamptz;
    RETURN;
  END IF;

  IF public.has_role(v_user, 'admin') THEN
    RETURN QUERY SELECT true, true, 'admin'::text, 'active'::text,
                        NULL::integer, NULL::integer, NULL::integer, NULL::integer,
                        NULL::integer, NULL::timestamptz;
    RETURN;
  END IF;

  -- Registry lookup (product_access + screening_subscriptions quota)
  RETURN QUERY
  SELECT true,
    (pm.role = 'admin'::public.product_role),
    pa.plan,
    pa.status::text,
    COALESCE((pa.metadata->>'search_quota_annual')::integer, s.search_quota_annual),
    COALESCE((pa.metadata->>'monitor_quota')::integer, s.monitor_quota),
    COALESCE(pa.seats, s.seat_quota),
    pa.seats_used,
    COALESCE(s.monitored_entity_quota, s.monitor_quota),
    pa.current_period_end
  FROM public.product_access pa
  JOIN public.product_members pm
    ON pm.organisation_id = pa.organisation_id AND pm.product = pa.product
  LEFT JOIN public.screening_subscriptions s
    ON s.organisation_id = pa.organisation_id
  WHERE pa.product = 'screening'::public.product_key
    AND pa.status IN ('active', 'trial')
    AND pm.user_id = v_user
  ORDER BY pa.created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    -- Legacy fallback
    RETURN QUERY
    SELECT true,
      false,
      s.plan,
      s.status,
      s.search_quota_annual,
      s.monitor_quota,
      s.seat_quota,
      NULL::integer,
      s.monitored_entity_quota,
      s.current_period_end
    FROM public.screening_subscriptions s
    JOIN public.suite_org_members m
      ON m.organization_id = s.organisation_id AND m.user_id = v_user
    WHERE s.status IN ('active', 'trialing')
    ORDER BY s.created_at DESC
    LIMIT 1;
  END IF;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, false, NULL::text, NULL::text,
                        NULL::integer, NULL::integer, NULL::integer, NULL::integer,
                        NULL::integer, NULL::timestamptz;
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.current_user_screening_entitlement() FROM public;
GRANT EXECUTE ON FUNCTION public.current_user_screening_entitlement() TO authenticated;

-- 5. Update team invite to also consider screening_subscriptions seat_quota
DROP FUNCTION IF EXISTS public.invite_screening_member(text, public.product_role);

CREATE OR REPLACE FUNCTION public.invite_screening_member(
  _email text,
  _role public.product_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_org uuid;
  v_target uuid;
  v_is_admin boolean;
  v_seats integer;
  v_used integer;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT pm.organisation_id INTO v_org
  FROM public.product_members pm
  WHERE pm.user_id = v_user AND pm.product = 'screening'::public.product_key
  LIMIT 1;

  IF v_org IS NULL THEN
    SELECT m.organization_id INTO v_org
    FROM public.suite_org_members m
    WHERE m.user_id = v_user
    LIMIT 1;
  END IF;

  IF v_org IS NULL THEN
    RAISE EXCEPTION 'No screening organisation found';
  END IF;

  v_is_admin := public.has_role(v_user, 'admin') OR EXISTS (
    SELECT 1 FROM public.product_members pm
    WHERE pm.organisation_id = v_org
      AND pm.product = 'screening'::public.product_key
      AND pm.user_id = v_user
      AND pm.role = 'admin'::public.product_role
  );

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Not authorised: only Screening admins can invite members';
  END IF;

  -- Effective seat limit from product_access or screening_subscriptions
  SELECT COALESCE(pa.seats, ss.seat_quota, 1), COALESCE(pa.seats_used, 0)
  INTO v_seats, v_used
  FROM public.product_access pa
  LEFT JOIN public.screening_subscriptions ss ON ss.organisation_id = pa.organisation_id
  WHERE pa.organisation_id = v_org AND pa.product = 'screening'::public.product_key;

  IF v_seats IS NULL THEN
    SELECT COALESCE(ss.seat_quota, 1), 0
    INTO v_seats, v_used
    FROM public.screening_subscriptions ss
    WHERE ss.organisation_id = v_org;
  END IF;

  IF v_used >= v_seats THEN
    RAISE EXCEPTION 'Seat limit reached (% seats). Upgrade to add more members.', v_seats;
  END IF;

  SELECT id INTO v_target FROM auth.users WHERE lower(email) = lower(trim(_email)) LIMIT 1;

  IF v_target IS NOT NULL THEN
    INSERT INTO public.product_members (organisation_id, product, user_id, role, created_by)
    VALUES (v_org, 'screening'::public.product_key, v_target, _role, v_user)
    ON CONFLICT (organisation_id, product, user_id) DO UPDATE SET
      role = EXCLUDED.role,
      updated_at = now();
  ELSE
    INSERT INTO public.product_members (organisation_id, product, invited_email, role, is_invite, created_by)
    VALUES (v_org, 'screening'::public.product_key, lower(trim(_email)), _role, true, v_user)
    ON CONFLICT (organisation_id, product, user_id) DO NOTHING;
  END IF;

  UPDATE public.product_access pa
  SET seats_used = (
    SELECT count(*) FROM public.product_members pm
    WHERE pm.organisation_id = pa.organisation_id AND pm.product = pa.product AND pm.user_id IS NOT NULL
  )
  WHERE pa.organisation_id = v_org AND pa.product = 'screening'::public.product_key;
END;
$function$;

REVOKE ALL ON FUNCTION public.invite_screening_member(text, public.product_role) FROM public;
GRANT EXECUTE ON FUNCTION public.invite_screening_member(text, public.product_role) TO authenticated;

-- 6. Admin overview: include new quota fields
DROP FUNCTION IF EXISTS public.admin_screening_overview();

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
          'search_quota_annual', s.search_quota_annual,
          'monitor_quota', s.monitor_quota,
          'seat_quota', s.seat_quota,
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

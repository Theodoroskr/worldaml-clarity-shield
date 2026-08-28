DROP FUNCTION IF EXISTS public.current_user_screening_entitlement();

CREATE OR REPLACE FUNCTION public.current_user_screening_entitlement()
RETURNS TABLE (
  has_access boolean,
  is_admin boolean,
  plan text,
  status text,
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
    RETURN QUERY SELECT false, false, NULL::text, NULL::text, NULL::integer, NULL::timestamptz;
    RETURN;
  END IF;

  IF public.has_role(v_user, 'admin') THEN
    RETURN QUERY SELECT true, true, 'admin'::text, 'active'::text, NULL::integer, NULL::timestamptz;
    RETURN;
  END IF;

  -- New registry lookup
  RETURN QUERY
  SELECT true,
    (pm.role = 'admin'::public.product_role),
    pa.plan,
    pa.status::text,
    NULL::integer,
    pa.current_period_end
  FROM public.product_access pa
  JOIN public.product_members pm
    ON pm.organisation_id = pa.organisation_id AND pm.product = pa.product
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
    RETURN QUERY
    SELECT true,
      (m.role = 'admin'::org_member_role),
      COALESCE(o.subscription_tier, 'suite')::text,
      'active'::text,
      NULL::integer,
      NULL::timestamptz
    FROM public.suite_org_members m
    JOIN public.suite_organizations o ON o.id = m.organization_id
    WHERE m.user_id = v_user AND o.subscription_tier IN ('enterprise')
    LIMIT 1;
  END IF;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, false, NULL::text, NULL::text, NULL::integer, NULL::timestamptz;
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.current_user_screening_entitlement() FROM public;
GRANT EXECUTE ON FUNCTION public.current_user_screening_entitlement() TO authenticated;

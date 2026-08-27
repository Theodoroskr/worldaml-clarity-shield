CREATE TABLE IF NOT EXISTS public.screening_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES public.suite_organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  plan text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_session_id text,
  monitored_entity_quota integer NOT NULL DEFAULT 2000,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS screening_subscriptions_stripe_sub_key
  ON public.screening_subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS screening_subscriptions_org_idx ON public.screening_subscriptions (organisation_id);

GRANT SELECT ON public.screening_subscriptions TO authenticated;
GRANT ALL ON public.screening_subscriptions TO service_role;

ALTER TABLE public.screening_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "screening_subscriptions_select_org" ON public.screening_subscriptions;
CREATE POLICY "screening_subscriptions_select_org"
ON public.screening_subscriptions FOR SELECT TO authenticated
USING (public.screening_is_org_member(organisation_id) OR public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS screening_subscriptions_lock_org ON public.screening_subscriptions;
CREATE TRIGGER screening_subscriptions_lock_org
BEFORE UPDATE ON public.screening_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.screening_lock_org();

CREATE OR REPLACE FUNCTION public.current_user_screening_entitlement()
RETURNS TABLE (has_access boolean, plan text, status text, monitored_entity_quota integer, current_period_end timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RETURN QUERY SELECT false, NULL::text, NULL::text, NULL::integer, NULL::timestamptz;
    RETURN;
  END IF;

  IF public.has_role(v_user, 'admin') THEN
    RETURN QUERY SELECT true, 'admin'::text, 'active'::text, NULL::integer, NULL::timestamptz;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT true, s.plan, s.status, s.monitored_entity_quota, s.current_period_end
  FROM public.screening_subscriptions s
  JOIN public.suite_org_members m
    ON m.organization_id = s.organisation_id AND m.user_id = v_user
  WHERE s.status IN ('active', 'trialing')
  ORDER BY s.created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY
    SELECT true, COALESCE(o.subscription_tier, 'suite')::text, 'active'::text, NULL::integer, NULL::timestamptz
    FROM public.suite_org_members m
    JOIN public.suite_organizations o ON o.id = m.organization_id
    WHERE m.user_id = v_user AND o.subscription_tier IN ('enterprise')
    LIMIT 1;
  END IF;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::text, NULL::text, NULL::integer, NULL::timestamptz;
  END IF;
END; $$;

REVOKE ALL ON FUNCTION public.current_user_screening_entitlement() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_screening_entitlement() TO authenticated, service_role;
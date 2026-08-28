-- ============================================================
-- Product Access Registry
-- ============================================================

-- Enums
CREATE TYPE public.product_key AS ENUM ('screening', 'suite', 'academy');
CREATE TYPE public.suite_module_key AS ENUM ('kyc_kyb', 'rcm');
CREATE TYPE public.product_role AS ENUM (
  'admin',
  'manager',
  'analyst',
  'viewer',
  'mlro_approver',
  'reviewer',
  'submitter',
  'owner',
  'contributor',
  'learner',
  'seat_manager'
);
CREATE TYPE public.product_status AS ENUM ('trial', 'active', 'suspended', 'cancelled');

-- ============================================================
-- product_access
-- ============================================================
CREATE TABLE public.product_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES public.suite_organizations(id) ON DELETE CASCADE,
  product public.product_key NOT NULL,
  plan text,
  status public.product_status NOT NULL DEFAULT 'trial',
  seats integer NOT NULL DEFAULT 1,
  seats_used integer NOT NULL DEFAULT 0,
  started_at timestamp with time zone,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, product)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_access TO authenticated;
GRANT ALL ON public.product_access TO service_role;

ALTER TABLE public.product_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their organisation product access"
  ON public.product_access FOR SELECT
  TO authenticated
  USING (organisation_id IN (
    SELECT organization_id FROM public.suite_org_members WHERE user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage product access"
  ON public.product_access FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- suite_module_access
-- ============================================================
CREATE TABLE public.suite_module_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES public.suite_organizations(id) ON DELETE CASCADE,
  module public.suite_module_key NOT NULL,
  status public.product_status NOT NULL DEFAULT 'trial',
  seats integer NOT NULL DEFAULT 1,
  seats_used integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, module)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.suite_module_access TO authenticated;
GRANT ALL ON public.suite_module_access TO service_role;

ALTER TABLE public.suite_module_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their organisation module access"
  ON public.suite_module_access FOR SELECT
  TO authenticated
  USING (organisation_id IN (
    SELECT organization_id FROM public.suite_org_members WHERE user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage module access"
  ON public.suite_module_access FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- product_members
-- ============================================================
CREATE TABLE public.product_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES public.suite_organizations(id) ON DELETE CASCADE,
  product public.product_key NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email text,
  role public.product_role NOT NULL,
  is_invite boolean NOT NULL DEFAULT false,
  invite_token text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, product, user_id),
  CONSTRAINT user_or_invite CHECK (
    (user_id IS NOT NULL) OR (invited_email IS NOT NULL AND is_invite = true)
  )
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_members TO authenticated;
GRANT ALL ON public.product_members TO service_role;

ALTER TABLE public.product_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their organisation product members"
  ON public.product_members FOR SELECT
  TO authenticated
  USING (organisation_id IN (
    SELECT organization_id FROM public.suite_org_members WHERE user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage product members"
  ON public.product_members FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- Triggers: updated_at and org-locking
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_product_access_updated_at
  BEFORE UPDATE ON public.product_access
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suite_module_access_updated_at
  BEFORE UPDATE ON public.suite_module_access
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_members_updated_at
  BEFORE UPDATE ON public.product_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Org-locking: prevent changing organisation_id on update
CREATE OR REPLACE FUNCTION public.prevent_org_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organisation_id IS DISTINCT FROM OLD.organisation_id THEN
    RAISE EXCEPTION 'Changing organisation_id is not allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER lock_product_access_org
  BEFORE UPDATE ON public.product_access
  FOR EACH ROW EXECUTE FUNCTION public.prevent_org_change();

CREATE TRIGGER lock_suite_module_access_org
  BEFORE UPDATE ON public.suite_module_access
  FOR EACH ROW EXECUTE FUNCTION public.prevent_org_change();

CREATE TRIGGER lock_product_members_org
  BEFORE UPDATE ON public.product_members
  FOR EACH ROW EXECUTE FUNCTION public.prevent_org_change();

-- ============================================================
-- Backfill from existing data
-- ============================================================

-- 1. Screening subscriptions -> product_access
INSERT INTO public.product_access (
  organisation_id, product, plan, status, seats, seats_used,
  current_period_end, metadata, created_at, updated_at
)
SELECT
  s.organisation_id,
  'screening'::public.product_key,
  s.plan,
  CASE
    WHEN s.status IN ('active', 'trialing') THEN 'active'::public.product_status
    WHEN s.status = 'cancelled' THEN 'cancelled'::public.product_status
    ELSE 'suspended'::public.product_status
  END,
  1,
  (SELECT count(*) FROM public.suite_org_members m WHERE m.organization_id = s.organisation_id),
  s.current_period_end,
  jsonb_build_object('migrated_from', 'screening_subscriptions', 'legacy_id', s.id::text),
  s.created_at,
  s.updated_at
FROM public.screening_subscriptions s
ON CONFLICT (organisation_id, product) DO UPDATE SET
  plan = EXCLUDED.plan,
  status = EXCLUDED.status,
  current_period_end = EXCLUDED.current_period_end,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- 2. Suite org members -> product_members for screening and suite
INSERT INTO public.product_members (
  organisation_id, product, user_id, role, created_at, updated_at
)
SELECT
  m.organization_id,
  'screening'::public.product_key,
  m.user_id,
  CASE m.role
    WHEN 'admin'::public.org_member_role THEN 'admin'::public.product_role
    WHEN 'mlro'::public.org_member_role THEN 'mlro_approver'::public.product_role
    WHEN 'compliance_officer'::public.org_member_role THEN 'manager'::public.product_role
    WHEN 'analyst'::public.org_member_role THEN 'analyst'::public.product_role
    WHEN 'viewer'::public.org_member_role THEN 'viewer'::public.product_role
  END,
  m.created_at,
  now()
FROM public.suite_org_members m
ON CONFLICT (organisation_id, product, user_id) DO UPDATE SET
  role = EXCLUDED.role,
  updated_at = now();

INSERT INTO public.product_members (
  organisation_id, product, user_id, role, created_at, updated_at
)
SELECT
  m.organization_id,
  'suite'::public.product_key,
  m.user_id,
  CASE m.role
    WHEN 'admin'::public.org_member_role THEN 'admin'::public.product_role
    WHEN 'mlro'::public.org_member_role THEN 'mlro_approver'::public.product_role
    WHEN 'compliance_officer'::public.org_member_role THEN 'manager'::public.product_role
    WHEN 'analyst'::public.org_member_role THEN 'analyst'::public.product_role
    WHEN 'viewer'::public.org_member_role THEN 'viewer'::public.product_role
  END,
  m.created_at,
  now()
FROM public.suite_org_members m
ON CONFLICT (organisation_id, product, user_id) DO UPDATE SET
  role = EXCLUDED.role,
  updated_at = now();

-- 3. RCM org members -> suite module access + suite product members (only where org exists)
INSERT INTO public.suite_module_access (
  organisation_id, module, status, seats, seats_used, created_at, updated_at
)
SELECT
  m.organization_id,
  'rcm'::public.suite_module_key,
  'active'::public.product_status,
  (SELECT count(*) FROM public.rcm_org_members x WHERE x.organization_id = m.organization_id),
  (SELECT count(*) FROM public.rcm_org_members x WHERE x.organization_id = m.organization_id),
  now(),
  now()
FROM public.rcm_org_members m
WHERE EXISTS (SELECT 1 FROM public.suite_organizations o WHERE o.id = m.organization_id)
ON CONFLICT (organisation_id, module) DO UPDATE SET
  seats = EXCLUDED.seats,
  seats_used = EXCLUDED.seats_used,
  updated_at = now();

INSERT INTO public.product_members (
  organisation_id, product, user_id, role, created_at, updated_at
)
SELECT
  m.organization_id,
  'suite'::public.product_key,
  m.user_id,
  CASE m.role
    WHEN 'admin'::public.org_member_role THEN 'admin'::public.product_role
    WHEN 'mlro'::public.org_member_role THEN 'owner'::public.product_role
    WHEN 'compliance_officer'::public.org_member_role THEN 'contributor'::public.product_role
    WHEN 'analyst'::public.org_member_role THEN 'contributor'::public.product_role
    WHEN 'viewer'::public.org_member_role THEN 'viewer'::public.product_role
  END,
  m.created_at,
  now()
FROM public.rcm_org_members m
WHERE EXISTS (SELECT 1 FROM public.suite_organizations o WHERE o.id = m.organization_id)
ON CONFLICT (organisation_id, product, user_id) DO UPDATE SET
  role = CASE
    WHEN public.product_members.role IN ('admin', 'manager', 'mlro_approver') THEN public.product_members.role
    ELSE EXCLUDED.role
  END,
  updated_at = now();

-- 4. Update seats_used counts
UPDATE public.product_access pa
SET seats_used = (
  SELECT count(*) FROM public.product_members pm
  WHERE pm.organisation_id = pa.organisation_id AND pm.product = pa.product AND pm.user_id IS NOT NULL
);

-- ============================================================
-- RPCs
-- ============================================================

-- Admin overview of clients and product access
CREATE OR REPLACE FUNCTION public.admin_client_access_overview()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  SELECT COALESCE(jsonb_agg(x ORDER BY (x->>'organisation_name')), '[]'::jsonb)
  INTO result
  FROM (
    SELECT jsonb_build_object(
      'organisation_id', o.id,
      'organisation_name', o.name,
      'country', o.country,
      'industry', o.industry,
      'subscription_tier', o.subscription_tier,
      'products', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'product', pa.product,
          'plan', pa.plan,
          'status', pa.status,
          'seats', pa.seats,
          'seats_used', pa.seats_used,
          'current_period_end', pa.current_period_end
        ) ORDER BY pa.product)
        FROM public.product_access pa WHERE pa.organisation_id = o.id
      ), '[]'::jsonb),
      'suite_modules', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'module', sma.module,
          'status', sma.status,
          'seats', sma.seats,
          'seats_used', sma.seats_used
        ) ORDER BY sma.module)
        FROM public.suite_module_access sma WHERE sma.organisation_id = o.id
      ), '[]'::jsonb),
      'member_count', (SELECT count(*) FROM public.product_members pm WHERE pm.organisation_id = o.id),
      'last_activity', (SELECT max(updated_at) FROM public.product_members pm WHERE pm.organisation_id = o.id)
    ) AS x
    FROM public.suite_organizations o
  ) t;

  RETURN result;
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_client_access_overview() FROM public;
GRANT EXECUTE ON FUNCTION public.admin_client_access_overview() TO authenticated;

-- Set product access for an organisation
CREATE OR REPLACE FUNCTION public.admin_set_product_access(
  _organisation_id uuid,
  _product public.product_key,
  _status public.product_status,
  _plan text DEFAULT NULL,
  _seats integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  INSERT INTO public.product_access (organisation_id, product, status, plan, seats, seats_used)
  VALUES (_organisation_id, _product, _status, _plan, COALESCE(_seats, 1), 0)
  ON CONFLICT (organisation_id, product) DO UPDATE SET
    status = EXCLUDED.status,
    plan = COALESCE(EXCLUDED.plan, public.product_access.plan),
    seats = COALESCE(EXCLUDED.seats, public.product_access.seats),
    updated_at = now();

  PERFORM public.log_admin_access_event(
    _organisation_id::text,
    'product_access_changed',
    _product::text,
    NULL,
    jsonb_build_object('status', _status, 'plan', _plan, 'seats', _seats)::text
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_set_product_access(uuid, public.product_key, public.product_status, text, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_set_product_access(uuid, public.product_key, public.product_status, text, integer) TO authenticated;

-- Set a member's role for a product (admin or client admin)
CREATE OR REPLACE FUNCTION public.set_product_member_role(
  _organisation_id uuid,
  _product public.product_key,
  _user_id uuid,
  _role public.product_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _is_org_admin boolean;
BEGIN
  _is_org_admin := EXISTS (
    SELECT 1 FROM public.product_members
    WHERE organisation_id = _organisation_id
      AND product = _product
      AND user_id = auth.uid()
      AND role = 'admin'::public.product_role
  );

  IF NOT _is_org_admin AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  INSERT INTO public.product_members (organisation_id, product, user_id, role)
  VALUES (_organisation_id, _product, _user_id, _role)
  ON CONFLICT (organisation_id, product, user_id) DO UPDATE SET
    role = EXCLUDED.role,
    updated_at = now();

  -- Update seats_used
  UPDATE public.product_access pa
  SET seats_used = (
    SELECT count(*) FROM public.product_members pm
    WHERE pm.organisation_id = pa.organisation_id AND pm.product = pa.product AND pm.user_id IS NOT NULL
  )
  WHERE pa.organisation_id = _organisation_id AND pa.product = _product;
END;
$function$;

REVOKE ALL ON FUNCTION public.set_product_member_role(uuid, public.product_key, uuid, public.product_role) FROM public;
GRANT EXECUTE ON FUNCTION public.set_product_member_role(uuid, public.product_key, uuid, public.product_role) TO authenticated;

-- ============================================================
-- Update screening entitlement to use registry first
-- ============================================================
CREATE OR REPLACE FUNCTION public.current_user_screening_entitlement()
RETURNS TABLE(has_access boolean, plan text, status text, monitored_entity_quota integer, current_period_end timestamp with time zone)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

  -- New registry lookup
  RETURN QUERY
  SELECT true, pa.plan, pa.status::text, NULL::integer, pa.current_period_end
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
    SELECT true, s.plan, s.status, s.monitored_entity_quota, s.current_period_end
    FROM public.screening_subscriptions s
    JOIN public.suite_org_members m
      ON m.organization_id = s.organisation_id AND m.user_id = v_user
    WHERE s.status IN ('active', 'trialing')
    ORDER BY s.created_at DESC
    LIMIT 1;
  END IF;

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
END; $function$;

REVOKE ALL ON FUNCTION public.current_user_screening_entitlement() FROM public;
GRANT EXECUTE ON FUNCTION public.current_user_screening_entitlement() TO authenticated;

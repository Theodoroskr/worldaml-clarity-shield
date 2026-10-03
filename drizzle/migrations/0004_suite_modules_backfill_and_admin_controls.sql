-- Company-level on/off switch managed by the client's own Suite admin
ALTER TABLE public.suite_module_access ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true;
ALTER TABLE public.suite_module_access ADD COLUMN IF NOT EXISTS ends_at timestamptz;

-- Backfill: every company with Screening keeps access after the move
INSERT INTO public.suite_module_access (organisation_id, module, status)
SELECT DISTINCT organisation_id, 'screening'::public.suite_module_key, 'active'::public.product_status
FROM public.product_access
WHERE product = 'screening' AND status IN ('active','trial') AND organisation_id IS NOT NULL
ON CONFLICT (organisation_id, module) DO NOTHING;

INSERT INTO public.suite_module_access (organisation_id, module, status)
SELECT DISTINCT organisation_id, 'screening'::public.suite_module_key, 'active'::public.product_status
FROM public.screening_subscriptions
WHERE status IN ('active','trialing','trial') AND organisation_id IS NOT NULL
ON CONFLICT (organisation_id, module) DO NOTHING;

-- Keep the Screening module in sync with Screening product access going forward
CREATE OR REPLACE FUNCTION public.sync_screening_module_from_product_access()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.product = 'screening' AND NEW.organisation_id IS NOT NULL THEN
    INSERT INTO public.suite_module_access (organisation_id, module, status)
    VALUES (NEW.organisation_id, 'screening', NEW.status)
    ON CONFLICT (organisation_id, module) DO UPDATE SET status = EXCLUDED.status, updated_at = now();
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_sync_screening_module ON public.product_access;
CREATE TRIGGER trg_sync_screening_module AFTER INSERT OR UPDATE OF status ON public.product_access
FOR EACH ROW EXECUTE FUNCTION public.sync_screening_module_from_product_access();

-- Per-member module access (no rows for a member = all company modules)
CREATE TABLE IF NOT EXISTS public.suite_member_module_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES public.suite_organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  module public.suite_module_key NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, user_id, module)
);
GRANT SELECT ON public.suite_member_module_access TO authenticated;
GRANT ALL ON public.suite_member_module_access TO service_role;
ALTER TABLE public.suite_member_module_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members read own org member modules" ON public.suite_member_module_access
FOR SELECT TO authenticated
USING (organisation_id = public.current_user_org_id() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.is_suite_org_admin(_org uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.suite_org_members
    WHERE organization_id = _org AND user_id = auth.uid() AND role = 'admin');
$$;

-- What the signed-in user can use, per module
CREATE OR REPLACE FUNCTION public.current_user_suite_modules()
RETURNS TABLE(module text, status text, purchased boolean, enabled boolean, member_allowed boolean, ends_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH org AS (SELECT public.current_user_org_id() AS id),
  restricted AS (
    SELECT EXISTS (SELECT 1 FROM public.suite_member_module_access m, org
      WHERE m.organisation_id = org.id AND m.user_id = auth.uid()) AS r
  )
  SELECT k::text,
    a.status::text,
    COALESCE(a.status IN ('active','trial') AND (a.ends_at IS NULL OR a.ends_at > now()), false),
    COALESCE(a.enabled, false),
    (NOT (SELECT r FROM restricted)) OR EXISTS (
      SELECT 1 FROM public.suite_member_module_access m, org
      WHERE m.organisation_id = org.id AND m.user_id = auth.uid() AND m.module = k),
    a.ends_at
  FROM unnest(enum_range(NULL::public.suite_module_key)) k
  LEFT JOIN public.suite_module_access a ON a.module = k AND a.organisation_id = (SELECT id FROM org);
$$;

-- Client Suite admin: switch a purchased module on/off for their company
CREATE OR REPLACE FUNCTION public.org_set_module_enabled(_module public.suite_module_key, _enabled boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid := public.current_user_org_id();
BEGIN
  IF v_org IS NULL OR NOT public.is_suite_org_admin(v_org) THEN RAISE EXCEPTION 'not authorised'; END IF;
  UPDATE public.suite_module_access SET enabled = _enabled, updated_at = now()
   WHERE organisation_id = v_org AND module = _module AND status IN ('active','trial');
  IF NOT FOUND THEN RAISE EXCEPTION 'module not included in your plan'; END IF;
  INSERT INTO public.suite_audit_log (user_id, organisation_id, action, entity_type, details)
  VALUES (auth.uid(), v_org, 'Module ' || _module || CASE WHEN _enabled THEN ' switched on' ELSE ' switched off' END,
          'module', jsonb_build_object('module', _module, 'enabled', _enabled));
END $$;

-- Client Suite admin: choose which modules a team member can use (empty = all)
CREATE OR REPLACE FUNCTION public.org_set_member_modules(_user_id uuid, _modules public.suite_module_key[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid := public.current_user_org_id();
BEGIN
  IF v_org IS NULL OR NOT public.is_suite_org_admin(v_org) THEN RAISE EXCEPTION 'not authorised'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.suite_org_members WHERE organization_id = v_org AND user_id = _user_id) THEN
    RAISE EXCEPTION 'user is not a member of your organisation';
  END IF;
  DELETE FROM public.suite_member_module_access WHERE organisation_id = v_org AND user_id = _user_id;
  INSERT INTO public.suite_member_module_access (organisation_id, user_id, module, created_by)
  SELECT v_org, _user_id, m, auth.uid() FROM unnest(COALESCE(_modules, '{}')) m;
  INSERT INTO public.suite_audit_log (user_id, organisation_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), v_org, 'Member module access changed', 'member', _user_id,
          jsonb_build_object('modules', _modules));
END $$;

-- WorldAML platform admin: set what a company has bought
CREATE OR REPLACE FUNCTION public.admin_set_org_module(_org uuid, _module public.suite_module_key, _status public.product_status, _ends_at timestamptz DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not authorised'; END IF;
  INSERT INTO public.suite_module_access (organisation_id, module, status, ends_at)
  VALUES (_org, _module, _status, _ends_at)
  ON CONFLICT (organisation_id, module) DO UPDATE SET status = EXCLUDED.status, ends_at = EXCLUDED.ends_at, updated_at = now();
END $$;

REVOKE ALL ON FUNCTION public.org_set_module_enabled(public.suite_module_key, boolean) FROM anon, public;
REVOKE ALL ON FUNCTION public.org_set_member_modules(uuid, public.suite_module_key[]) FROM anon, public;
REVOKE ALL ON FUNCTION public.admin_set_org_module(uuid, public.suite_module_key, public.product_status, timestamptz) FROM anon, public;
REVOKE ALL ON FUNCTION public.current_user_suite_modules() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.org_set_module_enabled(public.suite_module_key, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.org_set_member_modules(uuid, public.suite_module_key[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_org_module(uuid, public.suite_module_key, public.product_status, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_suite_modules() TO authenticated;
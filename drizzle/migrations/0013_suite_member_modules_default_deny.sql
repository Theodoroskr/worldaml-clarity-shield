CREATE OR REPLACE FUNCTION public.current_user_suite_modules()
 RETURNS TABLE(module text, status text, purchased boolean, enabled boolean, member_allowed boolean, ends_at timestamp with time zone)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  WITH org AS (SELECT public.current_user_org_id() AS id),
  adm AS (
    SELECT EXISTS (SELECT 1 FROM public.suite_org_members s, org
      WHERE s.organization_id = org.id AND s.user_id = auth.uid() AND s.role = 'admin') AS a
  )
  SELECT k::text,
    a.status::text,
    COALESCE(c.status = 'live' AND a.status IN ('active','trial') AND (a.ends_at IS NULL OR a.ends_at > now()), false),
    COALESCE(a.enabled, false),
    (SELECT a FROM adm) OR EXISTS (
      SELECT 1 FROM public.suite_member_module_access m, org
      WHERE m.organisation_id = org.id AND m.user_id = auth.uid() AND m.module = k),
    a.ends_at
  FROM unnest(enum_range(NULL::public.suite_module_key)) k
  LEFT JOIN public.suite_module_catalog c ON c.module = k
  LEFT JOIN public.suite_module_access a ON a.module = k AND a.organisation_id = (SELECT id FROM org)
  WHERE COALESCE(c.status, 'hidden') <> 'hidden';
$function$;

CREATE OR REPLACE FUNCTION public.org_set_member_modules(_user_id uuid, _modules suite_module_key[])
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_org uuid := public.current_user_org_id(); v_role org_member_role;
BEGIN
  IF v_org IS NULL OR NOT public.is_suite_org_admin(v_org) THEN RAISE EXCEPTION 'not authorised'; END IF;
  SELECT role INTO v_role FROM public.suite_org_members WHERE organization_id = v_org AND user_id = _user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'user is not a member of your organisation'; END IF;
  DELETE FROM public.suite_member_module_access WHERE organisation_id = v_org AND user_id = _user_id;
  INSERT INTO public.suite_member_module_access (organisation_id, user_id, module, created_by)
  SELECT v_org, _user_id, m, auth.uid() FROM unnest(COALESCE(_modules, '{}')) m;
  IF 'screening' = ANY(COALESCE(_modules,'{}')) THEN
    INSERT INTO public.product_members (organisation_id, product, user_id, role, created_by)
    VALUES (v_org, 'screening', _user_id, public.product_role_from_suite(v_role), auth.uid())
    ON CONFLICT (organisation_id, product, user_id) DO UPDATE SET role = EXCLUDED.role, updated_at = now();
  ELSIF v_role <> 'admin' THEN
    DELETE FROM public.product_members WHERE organisation_id = v_org AND product = 'screening' AND user_id = _user_id;
  END IF;
  INSERT INTO public.suite_audit_log (user_id, organisation_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), v_org, 'Member module access changed', 'member', _user_id,
          jsonb_build_object('modules', _modules));
END $function$;
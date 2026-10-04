CREATE OR REPLACE FUNCTION public.suite_role_from_product(_r public.product_role)
RETURNS public.org_member_role LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE _r::text WHEN 'admin' THEN 'admin' WHEN 'owner' THEN 'admin' WHEN 'mlro_approver' THEN 'mlro'
    WHEN 'viewer' THEN 'viewer' ELSE 'analyst' END::public.org_member_role $$;

CREATE OR REPLACE FUNCTION public.product_role_from_suite(_r public.org_member_role)
RETURNS public.product_role LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE _r::text WHEN 'admin' THEN 'admin' WHEN 'mlro' THEN 'mlro_approver'
    WHEN 'viewer' THEN 'viewer' ELSE 'analyst' END::public.product_role $$;

INSERT INTO public.suite_org_members (organization_id, user_id, role, joined_at)
SELECT pm.organisation_id, pm.user_id, public.suite_role_from_product(pm.role), pm.created_at
FROM public.product_members pm
JOIN public.suite_organizations o ON o.id = pm.organisation_id
WHERE pm.product = 'screening' AND pm.user_id IS NOT NULL
ON CONFLICT (organization_id, user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.suite_sync_product_members()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.product_members WHERE organisation_id = OLD.organization_id AND product='screening' AND user_id = OLD.user_id;
    DELETE FROM public.suite_member_module_access WHERE organisation_id = OLD.organization_id AND user_id = OLD.user_id;
    RETURN OLD;
  END IF;
  UPDATE public.product_members SET role = public.product_role_from_suite(NEW.role), updated_at = now()
   WHERE organisation_id = NEW.organization_id AND product='screening' AND user_id = NEW.user_id;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_suite_sync_product_members ON public.suite_org_members;
CREATE TRIGGER trg_suite_sync_product_members AFTER UPDATE OF role OR DELETE ON public.suite_org_members
FOR EACH ROW EXECUTE FUNCTION public.suite_sync_product_members();

CREATE OR REPLACE FUNCTION public.suite_team_members()
RETURNS TABLE(id uuid, user_id uuid, email text, full_name text, role public.org_member_role,
              joined_at timestamptz, created_at timestamptz, modules public.suite_module_key[])
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.id, m.user_id, COALESCE(p.email, m.invited_email), p.full_name, m.role, m.joined_at, m.created_at,
         COALESCE((SELECT array_agg(a.module ORDER BY a.module) FROM public.suite_member_module_access a
                   WHERE a.organisation_id = m.organization_id AND a.user_id = m.user_id), '{}')
  FROM public.suite_org_members m
  LEFT JOIN public.profiles p ON p.user_id = m.user_id
  WHERE m.organization_id = public.current_user_org_id()
  ORDER BY m.created_at $$;

CREATE OR REPLACE FUNCTION public.suite_invite_member(_email text, _role public.org_member_role, _modules public.suite_module_key[] DEFAULT '{}')
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid := public.current_user_org_id(); v_target uuid; v_max int; v_used int;
BEGIN
  IF v_org IS NULL OR NOT public.is_suite_org_admin(v_org) THEN RAISE EXCEPTION 'Only Suite admins can invite members' USING ERRCODE='42501'; END IF;
  SELECT COALESCE(max_users, 10) INTO v_max FROM public.suite_organizations WHERE id = v_org;
  SELECT count(*) INTO v_used FROM public.suite_org_members WHERE organization_id = v_org;
  IF v_used >= v_max THEN RAISE EXCEPTION 'Seat limit reached (% seats). Contact WorldAML to add more.', v_max; END IF;
  SELECT id INTO v_target FROM auth.users WHERE lower(email) = lower(trim(_email)) LIMIT 1;
  IF v_target IS NULL THEN RAISE EXCEPTION 'No WorldAML account found for this email. Ask them to sign up first, then add them.'; END IF;
  IF EXISTS (SELECT 1 FROM public.suite_org_members WHERE organization_id = v_org AND user_id = v_target) THEN
    RAISE EXCEPTION 'This person is already in your team.'; END IF;
  INSERT INTO public.suite_org_members (organization_id, user_id, role, invited_email, joined_at)
  VALUES (v_org, v_target, _role, lower(trim(_email)), now());
  INSERT INTO public.suite_member_module_access (organisation_id, user_id, module, created_by)
  SELECT v_org, v_target, m, auth.uid() FROM unnest(COALESCE(_modules,'{}')) m ON CONFLICT DO NOTHING;
  IF 'screening' = ANY(COALESCE(_modules,'{}')) THEN
    INSERT INTO public.product_members (organisation_id, product, user_id, role, created_by)
    VALUES (v_org, 'screening', v_target, public.product_role_from_suite(_role), auth.uid())
    ON CONFLICT (organisation_id, product, user_id) DO UPDATE SET role = EXCLUDED.role, updated_at = now();
  END IF;
  INSERT INTO public.suite_audit_log (user_id, organisation_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), v_org, 'Team member added', 'team', v_target,
    jsonb_build_object('detail', lower(trim(_email))||' as '||_role::text, 'module','team', 'modules', _modules));
  RETURN v_target;
END $$;

CREATE OR REPLACE FUNCTION public.suite_set_member_role(_user_id uuid, _role public.org_member_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid := public.current_user_org_id(); v_old public.org_member_role;
BEGIN
  IF v_org IS NULL OR NOT public.is_suite_org_admin(v_org) THEN RAISE EXCEPTION 'Only Suite admins can change roles' USING ERRCODE='42501'; END IF;
  SELECT role INTO v_old FROM public.suite_org_members WHERE organization_id = v_org AND user_id = _user_id;
  IF v_old IS NULL THEN RAISE EXCEPTION 'Not a member of your organisation'; END IF;
  IF v_old = 'admin' AND _role <> 'admin' AND (SELECT count(*) FROM public.suite_org_members WHERE organization_id=v_org AND role='admin') <= 1 THEN
    RAISE EXCEPTION 'Cannot remove the last admin. Promote another member first.'; END IF;
  UPDATE public.suite_org_members SET role = _role WHERE organization_id = v_org AND user_id = _user_id;
  INSERT INTO public.suite_audit_log (user_id, organisation_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), v_org, 'Team member role changed', 'team', _user_id,
    jsonb_build_object('detail', v_old::text||' → '||_role::text, 'module','team', 'before', v_old, 'after', _role));
END $$;

CREATE OR REPLACE FUNCTION public.suite_remove_member(_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid := public.current_user_org_id(); v_old public.org_member_role; v_email text;
BEGIN
  IF v_org IS NULL OR NOT public.is_suite_org_admin(v_org) THEN RAISE EXCEPTION 'Only Suite admins can remove members' USING ERRCODE='42501'; END IF;
  SELECT m.role, COALESCE(p.email, m.invited_email) INTO v_old, v_email FROM public.suite_org_members m
    LEFT JOIN public.profiles p ON p.user_id = m.user_id WHERE m.organization_id = v_org AND m.user_id = _user_id;
  IF v_old IS NULL THEN RAISE EXCEPTION 'Not a member of your organisation'; END IF;
  IF v_old = 'admin' AND (SELECT count(*) FROM public.suite_org_members WHERE organization_id=v_org AND role='admin') <= 1 THEN
    RAISE EXCEPTION 'Cannot remove the last admin. Promote another member first.'; END IF;
  DELETE FROM public.suite_org_members WHERE organization_id = v_org AND user_id = _user_id;
  INSERT INTO public.suite_audit_log (user_id, organisation_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), v_org, 'Team member removed', 'team', _user_id, jsonb_build_object('detail', v_email, 'module','team'));
END $$;

CREATE OR REPLACE FUNCTION public.suite_mirror_screening_audit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.suite_audit_log (user_id, organisation_id, action, entity_type, entity_id, details, created_at)
  VALUES (NEW.actor_id, NEW.organisation_id, COALESCE(NULLIF(NEW.description,''), replace(NEW.event_type,'_',' ')),
          'screening', COALESCE(NEW.case_id::text, NEW.match_id::text),
          jsonb_build_object('detail', NEW.event_type, 'module','screening', 'source_event_id', NEW.id,
                             'case_id', NEW.case_id, 'match_id', NEW.match_id), NEW.created_at);
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_suite_mirror_screening_audit ON public.screening_audit_events;
CREATE TRIGGER trg_suite_mirror_screening_audit AFTER INSERT ON public.screening_audit_events
FOR EACH ROW EXECUTE FUNCTION public.suite_mirror_screening_audit();

INSERT INTO public.suite_audit_log (user_id, organisation_id, action, entity_type, entity_id, details, created_at)
SELECT e.actor_id, e.organisation_id, COALESCE(NULLIF(e.description,''), replace(e.event_type,'_',' ')),
       'screening', COALESCE(e.case_id::text, e.match_id::text),
       jsonb_build_object('detail', e.event_type, 'module','screening', 'source_event_id', e.id, 'case_id', e.case_id, 'match_id', e.match_id),
       e.created_at
FROM public.screening_audit_events e
WHERE e.organisation_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.suite_audit_log l WHERE l.details->>'source_event_id' = e.id::text);

CREATE OR REPLACE FUNCTION public.suite_audit_feed(_limit int DEFAULT 200, _offset int DEFAULT 0)
RETURNS TABLE(id uuid, created_at timestamptz, actor_id uuid, actor_name text, action text, entity_type text,
              entity_id text, details jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM (
    SELECT l.id, l.created_at, l.user_id, COALESCE(NULLIF(p.full_name,''), p.email, 'System'), l.action, l.entity_type, l.entity_id, l.details
    FROM public.suite_audit_log l LEFT JOIN public.profiles p ON p.user_id = l.user_id
    WHERE l.organisation_id = public.current_user_org_id()
    UNION ALL
    SELECT a.id, a.created_at, a.user_id, COALESCE(NULLIF(p.full_name,''), p.email, 'System'),
           'Sensitive details viewed', 'pii', a.record_id::text,
           jsonb_build_object('detail', a.record_table||': '||COALESCE(a.purpose,''), 'module','security')
    FROM public.suite_pii_access_log a LEFT JOIN public.profiles p ON p.user_id = a.user_id
    WHERE a.organisation_id = public.current_user_org_id() AND public.is_suite_org_admin(a.organisation_id)
  ) f
  ORDER BY 2 DESC LIMIT LEAST(GREATEST(_limit,1),1000) OFFSET GREATEST(_offset,0) $$;

REVOKE EXECUTE ON FUNCTION public.suite_team_members(), public.suite_invite_member(text, public.org_member_role, public.suite_module_key[]),
  public.suite_set_member_role(uuid, public.org_member_role), public.suite_remove_member(uuid), public.suite_audit_feed(int,int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.suite_team_members(), public.suite_invite_member(text, public.org_member_role, public.suite_module_key[]),
  public.suite_set_member_role(uuid, public.org_member_role), public.suite_remove_member(uuid), public.suite_audit_feed(int,int) TO authenticated;

COMMENT ON FUNCTION public.screening_team_members() IS 'DEPRECATED: replaced by suite_team_members';
COMMENT ON FUNCTION public.invite_screening_member(text, public.product_role) IS 'DEPRECATED: replaced by suite_invite_member';
CREATE TABLE public.suite_module_catalog (
  module public.suite_module_key PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'Boxes',
  status text NOT NULL DEFAULT 'live' CHECK (status IN ('live','coming_soon','hidden')),
  acquisition text NOT NULL DEFAULT 'request' CHECK (acquisition IN ('request','checkout')),
  price_label text,
  stripe_price_id text,
  default_trial_days integer NOT NULL DEFAULT 14 CHECK (default_trial_days BETWEEN 1 AND 90),
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.suite_module_catalog TO authenticated;
GRANT ALL ON public.suite_module_catalog TO service_role;
ALTER TABLE public.suite_module_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read visible modules" ON public.suite_module_catalog FOR SELECT TO authenticated
  USING (status <> 'hidden' OR public.has_role(auth.uid(), 'admin'));

INSERT INTO public.suite_module_catalog (module, name, description, icon, status, sort_order) VALUES
 ('screening','Screening','Manual and automatic sanctions, PEP and adverse media screening with ongoing monitoring.','ShieldCheck','live',1),
 ('kyc_kyb','KYC / KYB','Client onboarding, UBOs, documents, risk scoring and reviews.','Users','live',2),
 ('rcm','Regulatory Compliance Management','Obligations, controls, tasks and evidence.','Scale','hidden',3)
ON CONFLICT DO NOTHING;

CREATE TABLE public.suite_module_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES public.suite_organizations(id) ON DELETE CASCADE,
  module public.suite_module_key NOT NULL,
  requested_by uuid NOT NULL,
  note text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','declined')),
  decided_by uuid,
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX suite_module_requests_one_pending ON public.suite_module_requests (organisation_id, module) WHERE status = 'pending';
GRANT SELECT ON public.suite_module_requests TO authenticated;
GRANT ALL ON public.suite_module_requests TO service_role;
ALTER TABLE public.suite_module_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members read own requests; admins read all" ON public.suite_module_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR organisation_id = public.current_user_org_id());

CREATE TABLE public.admin_module_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  organisation_id uuid,
  module public.suite_module_key,
  action text NOT NULL,
  before jsonb,
  after jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_module_audit TO authenticated;
GRANT ALL ON public.admin_module_audit TO service_role;
ALTER TABLE public.admin_module_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read module audit" ON public.admin_module_audit FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Hidden / not-live modules are never usable or listed to clients
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
    COALESCE(c.status = 'live' AND a.status IN ('active','trial') AND (a.ends_at IS NULL OR a.ends_at > now()), false),
    COALESCE(a.enabled, false),
    (NOT (SELECT r FROM restricted)) OR EXISTS (
      SELECT 1 FROM public.suite_member_module_access m, org
      WHERE m.organisation_id = org.id AND m.user_id = auth.uid() AND m.module = k),
    a.ends_at
  FROM unnest(enum_range(NULL::public.suite_module_key)) k
  LEFT JOIN public.suite_module_catalog c ON c.module = k
  LEFT JOIN public.suite_module_access a ON a.module = k AND a.organisation_id = (SELECT id FROM org)
  WHERE COALESCE(c.status, 'hidden') <> 'hidden';
$$;

CREATE OR REPLACE FUNCTION public.admin_set_org_module(_org uuid, _module public.suite_module_key, _status public.product_status, _ends_at timestamptz DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_before jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not authorised'; END IF;
  SELECT jsonb_build_object('status', status, 'ends_at', ends_at) INTO v_before
    FROM public.suite_module_access WHERE organisation_id = _org AND module = _module;
  INSERT INTO public.suite_module_access (organisation_id, module, status, ends_at)
  VALUES (_org, _module, _status, _ends_at)
  ON CONFLICT (organisation_id, module) DO UPDATE SET status = EXCLUDED.status, ends_at = EXCLUDED.ends_at, updated_at = now();
  INSERT INTO public.admin_module_audit (actor_id, organisation_id, module, action, before, after)
  VALUES (auth.uid(), _org, _module, 'grant_change', v_before, jsonb_build_object('status', _status, 'ends_at', _ends_at));
  INSERT INTO public.suite_audit_log (user_id, organisation_id, action, entity_type, details)
  VALUES (auth.uid(), _org, 'WorldAML set module ' || _module || ' to ' || _status, 'module',
          jsonb_build_object('module', _module, 'status', _status, 'ends_at', _ends_at, 'by', 'worldaml'));
END $$;

CREATE OR REPLACE FUNCTION public.admin_bulk_set_org_module(_orgs uuid[], _module public.suite_module_key, _status public.product_status, _ends_at timestamptz DEFAULT NULL)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o uuid; n integer := 0;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not authorised'; END IF;
  FOREACH o IN ARRAY COALESCE(_orgs, '{}') LOOP
    PERFORM public.admin_set_org_module(o, _module, _status, _ends_at); n := n + 1;
  END LOOP;
  RETURN n;
END $$;

CREATE OR REPLACE FUNCTION public.admin_update_module_catalog(_module public.suite_module_key, _name text, _description text, _status text, _acquisition text, _price_label text, _stripe_price_id text, _default_trial_days integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_before jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not authorised'; END IF;
  SELECT to_jsonb(c) INTO v_before FROM public.suite_module_catalog c WHERE module = _module;
  INSERT INTO public.suite_module_catalog (module, name, description, status, acquisition, price_label, stripe_price_id, default_trial_days)
  VALUES (_module, _name, COALESCE(_description,''), _status, _acquisition, NULLIF(_price_label,''), NULLIF(_stripe_price_id,''), _default_trial_days)
  ON CONFLICT (module) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, status = EXCLUDED.status,
    acquisition = EXCLUDED.acquisition, price_label = EXCLUDED.price_label, stripe_price_id = EXCLUDED.stripe_price_id,
    default_trial_days = EXCLUDED.default_trial_days, updated_at = now();
  INSERT INTO public.admin_module_audit (actor_id, module, action, before, after)
  SELECT auth.uid(), _module, 'catalog_change', v_before, to_jsonb(c) FROM public.suite_module_catalog c WHERE module = _module;
END $$;

CREATE OR REPLACE FUNCTION public.org_request_module(_module public.suite_module_key, _note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid := public.current_user_org_id();
BEGIN
  IF v_org IS NULL OR NOT public.is_suite_org_admin(v_org) THEN RAISE EXCEPTION 'not authorised'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.suite_module_catalog WHERE module = _module AND status = 'live') THEN
    RAISE EXCEPTION 'this module cannot be requested yet';
  END IF;
  IF EXISTS (SELECT 1 FROM public.suite_module_requests WHERE organisation_id = v_org AND module = _module AND status = 'pending') THEN
    RAISE EXCEPTION 'a request for this module is already pending';
  END IF;
  INSERT INTO public.suite_module_requests (organisation_id, module, requested_by, note)
  VALUES (v_org, _module, auth.uid(), left(_note, 1000));
  INSERT INTO public.suite_audit_log (user_id, organisation_id, action, entity_type, details)
  VALUES (auth.uid(), v_org, 'Module ' || _module || ' requested', 'module', jsonb_build_object('module', _module));
END $$;

CREATE OR REPLACE FUNCTION public.admin_decide_module_request(_id uuid, _approve boolean, _status public.product_status DEFAULT 'active', _ends_at timestamptz DEFAULT NULL, _note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.suite_module_requests;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not authorised'; END IF;
  SELECT * INTO r FROM public.suite_module_requests WHERE id = _id AND status = 'pending' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'request not found or already decided'; END IF;
  UPDATE public.suite_module_requests SET status = CASE WHEN _approve THEN 'approved' ELSE 'declined' END,
    decided_by = auth.uid(), decided_at = now(), decision_note = left(_note, 1000) WHERE id = _id;
  IF _approve THEN PERFORM public.admin_set_org_module(r.organisation_id, r.module, _status, _ends_at); END IF;
  INSERT INTO public.admin_module_audit (actor_id, organisation_id, module, action, after)
  VALUES (auth.uid(), r.organisation_id, r.module, CASE WHEN _approve THEN 'request_approved' ELSE 'request_declined' END,
          jsonb_build_object('note', _note, 'status', _status));
  INSERT INTO public.suite_audit_log (user_id, organisation_id, action, entity_type, details)
  VALUES (auth.uid(), r.organisation_id, 'Module ' || r.module || ' request ' || CASE WHEN _approve THEN 'approved' ELSE 'declined' END,
          'module', jsonb_build_object('module', r.module, 'note', _note));
END $$;

REVOKE ALL ON FUNCTION public.admin_bulk_set_org_module(uuid[], public.suite_module_key, public.product_status, timestamptz) FROM anon, public;
REVOKE ALL ON FUNCTION public.admin_update_module_catalog(public.suite_module_key, text, text, text, text, text, text, integer) FROM anon, public;
REVOKE ALL ON FUNCTION public.org_request_module(public.suite_module_key, text) FROM anon, public;
REVOKE ALL ON FUNCTION public.admin_decide_module_request(uuid, boolean, public.product_status, timestamptz, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.admin_bulk_set_org_module(uuid[], public.suite_module_key, public.product_status, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_module_catalog(public.suite_module_key, text, text, text, text, text, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.org_request_module(public.suite_module_key, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_decide_module_request(uuid, boolean, public.product_status, timestamptz, text) TO authenticated;
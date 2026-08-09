-- Guard: only admins may change access/commercial fields on partners
CREATE OR REPLACE FUNCTION public.protect_partner_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  NEW.portal_access := OLD.portal_access;
  NEW.commission_rate := OLD.commission_rate;
  NEW.is_active := OLD.is_active;
  NEW.certification_level := OLD.certification_level;
  NEW.partner_type := OLD.partner_type;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_protect_partner_privileged_fields ON public.partners;
CREATE TRIGGER trg_protect_partner_privileged_fields
BEFORE UPDATE ON public.partners
FOR EACH ROW EXECUTE FUNCTION public.protect_partner_privileged_fields();

-- Server-side entitlement check
CREATE OR REPLACE FUNCTION public.has_partner_portal_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partners
    WHERE user_id = _user_id AND is_active = true AND portal_access = 'active'
  )
$$;
REVOKE EXECUTE ON FUNCTION public.has_partner_portal_access(uuid) FROM anon;

CREATE OR REPLACE FUNCTION public.partner_audit(
  _action text, _entity_type text, _entity_id uuid, _entity_label text, _changes jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.partner_admin_audit_log
    (actor_user_id, actor_email, action, entity_type, entity_id, entity_label, changes)
  VALUES (
    auth.uid(),
    (SELECT email FROM public.profiles WHERE user_id = auth.uid()),
    _action, _entity_type, _entity_id, _entity_label, _changes
  );
END $$;
REVOKE EXECUTE ON FUNCTION public.partner_audit(text,text,uuid,text,jsonb) FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_approve_partner_application(
  _app_id uuid,
  _partner_type public.partner_type,
  _commission_rate numeric,
  _certification public.partner_certification DEFAULT 'none',
  _verticals text[] DEFAULT NULL,
  _manager_id uuid DEFAULT NULL,
  _grant_portal boolean DEFAULT true,
  _internal_notes text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _app public.partner_applications%ROWTYPE;
  _partner public.partners%ROWTYPE;
  _access text;
  _created boolean := false;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;
  SELECT * INTO _app FROM public.partner_applications WHERE id = _app_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Application not found'; END IF;

  _access := CASE WHEN _grant_portal THEN 'active' ELSE 'not_granted' END;

  SELECT * INTO _partner FROM public.partners WHERE user_id = _app.user_id LIMIT 1;

  IF FOUND THEN
    UPDATE public.partners SET
      partner_type = _partner_type,
      commission_rate = _commission_rate,
      certification_level = COALESCE(_certification, certification_level),
      verticals = COALESCE(_verticals, verticals),
      partner_manager_id = COALESCE(_manager_id, partner_manager_id),
      display_name = COALESCE(display_name, _app.company_name),
      website_url = COALESCE(website_url, _app.website),
      internal_notes = COALESCE(_internal_notes, internal_notes),
      portal_access = _access,
      is_active = true,
      partner_since = COALESCE(partner_since, now())
    WHERE id = _partner.id
    RETURNING * INTO _partner;
  ELSE
    INSERT INTO public.partners (
      user_id, partner_type, commission_rate, certification_level, verticals,
      partner_manager_id, display_name, website_url, internal_notes,
      portal_access, is_active, partner_since
    ) VALUES (
      _app.user_id, _partner_type, _commission_rate, COALESCE(_certification,'none'), _verticals,
      _manager_id, _app.company_name, _app.website, _internal_notes,
      _access, true, now()
    ) RETURNING * INTO _partner;
    _created := true;
  END IF;

  UPDATE public.partner_applications SET
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = auth.uid(),
    approved_partner_type = _partner_type,
    partner_id = _partner.id,
    internal_notes = COALESCE(_internal_notes, internal_notes)
  WHERE id = _app_id;

  PERFORM public.partner_audit(
    'partner_application_approved', 'partner_application', _app_id, _app.company_name,
    jsonb_build_object(
      'status', jsonb_build_object('from', _app.status, 'to', 'approved'),
      'partner_type', _partner_type,
      'commission_rate', _commission_rate,
      'portal_access', _access,
      'partner_record', CASE WHEN _created THEN 'created' ELSE 'updated' END
    )
  );

  IF _grant_portal THEN
    PERFORM public.partner_audit(
      'partner_portal_activated', 'partner', _partner.id,
      COALESCE(_partner.display_name, _app.company_name),
      jsonb_build_object('portal_access', jsonb_build_object('to', 'active'))
    );
  END IF;

  RETURN jsonb_build_object(
    'partner_id', _partner.id,
    'user_id', _app.user_id,
    'created', _created,
    'portal_access', _access
  );
END $$;
REVOKE EXECUTE ON FUNCTION public.admin_approve_partner_application(uuid, public.partner_type, numeric, public.partner_certification, text[], uuid, boolean, text) FROM anon;

CREATE OR REPLACE FUNCTION public.admin_review_partner_application(
  _app_id uuid, _decision text, _message text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _app public.partner_applications%ROWTYPE; _new public.partner_status;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorised'; END IF;
  IF _decision NOT IN ('rejected','more_info','withdrawn','pending') THEN
    RAISE EXCEPTION 'Invalid decision';
  END IF;
  SELECT * INTO _app FROM public.partner_applications WHERE id = _app_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Application not found'; END IF;
  _new := _decision::public.partner_status;

  UPDATE public.partner_applications SET
    status = _new,
    reviewed_at = now(),
    reviewed_by = auth.uid(),
    review_message = COALESCE(_message, review_message)
  WHERE id = _app_id;

  PERFORM public.partner_audit(
    CASE _decision
      WHEN 'rejected' THEN 'partner_application_rejected'
      WHEN 'more_info' THEN 'partner_application_more_info_requested'
      WHEN 'withdrawn' THEN 'partner_application_withdrawn'
      ELSE 'partner_application_reopened' END,
    'partner_application', _app_id, _app.company_name,
    jsonb_build_object('status', jsonb_build_object('from', _app.status, 'to', _new), 'message', _message)
  );
END $$;
REVOKE EXECUTE ON FUNCTION public.admin_review_partner_application(uuid, text, text) FROM anon;

CREATE OR REPLACE FUNCTION public.admin_set_partner_portal_access(
  _partner_id uuid, _access text, _reason text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _p public.partners%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorised'; END IF;
  IF _access NOT IN ('not_granted','invitation_pending','active','suspended','revoked') THEN
    RAISE EXCEPTION 'Invalid access state';
  END IF;
  SELECT * INTO _p FROM public.partners WHERE id = _partner_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Partner not found'; END IF;

  UPDATE public.partners SET portal_access = _access WHERE id = _partner_id;

  PERFORM public.partner_audit(
    CASE _access
      WHEN 'active' THEN 'partner_portal_activated'
      WHEN 'suspended' THEN 'partner_portal_suspended'
      WHEN 'revoked' THEN 'partner_portal_revoked'
      ELSE 'partner_portal_access_changed' END,
    'partner', _partner_id, COALESCE(_p.display_name, _p.referral_code),
    jsonb_build_object(
      'portal_access', jsonb_build_object('from', _p.portal_access, 'to', _access),
      'reason', _reason)
  );
END $$;
REVOKE EXECUTE ON FUNCTION public.admin_set_partner_portal_access(uuid, text, text) FROM anon;

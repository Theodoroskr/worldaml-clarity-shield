
-- 1. Portal users (link auth.users -> suite_customers)
CREATE TABLE public.suite_customer_portal_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.suite_customers(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'invited',
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  invited_by UUID,
  activated_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  disabled_at TIMESTAMPTZ,
  disabled_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT suite_customer_portal_users_status_check CHECK (status IN ('invited','active','disabled'))
);

CREATE UNIQUE INDEX uq_portal_user_per_customer ON public.suite_customer_portal_users(customer_id) WHERE status <> 'disabled';
CREATE UNIQUE INDEX uq_portal_user_auth ON public.suite_customer_portal_users(auth_user_id) WHERE auth_user_id IS NOT NULL;
CREATE INDEX idx_portal_users_org ON public.suite_customer_portal_users(organisation_id);
CREATE INDEX idx_portal_users_email ON public.suite_customer_portal_users(LOWER(email));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.suite_customer_portal_users TO authenticated;
GRANT ALL ON public.suite_customer_portal_users TO service_role;

ALTER TABLE public.suite_customer_portal_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff read portal users"
  ON public.suite_customer_portal_users FOR SELECT TO authenticated
  USING (organisation_id IN (SELECT get_user_org_ids(auth.uid())) OR has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "staff insert portal users"
  ON public.suite_customer_portal_users FOR INSERT TO authenticated
  WITH CHECK (organisation_id IN (SELECT get_user_org_ids(auth.uid())) OR has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "staff update portal users"
  ON public.suite_customer_portal_users FOR UPDATE TO authenticated
  USING (organisation_id IN (SELECT get_user_org_ids(auth.uid())) OR has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "portal user read self"
  ON public.suite_customer_portal_users FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

CREATE TRIGGER trg_portal_users_updated BEFORE UPDATE ON public.suite_customer_portal_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Audit log
CREATE TABLE public.suite_customer_portal_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.suite_customers(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL,
  portal_user_id UUID REFERENCES public.suite_customer_portal_users(id) ON DELETE SET NULL,
  actor_auth_id UUID,
  actor_role TEXT NOT NULL,
  event TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT portal_audit_role_check CHECK (actor_role IN ('portal','staff','system'))
);
CREATE INDEX idx_portal_audit_customer ON public.suite_customer_portal_audit(customer_id, created_at DESC);
CREATE INDEX idx_portal_audit_org ON public.suite_customer_portal_audit(organisation_id, created_at DESC);

GRANT SELECT, INSERT ON public.suite_customer_portal_audit TO authenticated;
GRANT ALL ON public.suite_customer_portal_audit TO service_role;

ALTER TABLE public.suite_customer_portal_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff read portal audit"
  ON public.suite_customer_portal_audit FOR SELECT TO authenticated
  USING (organisation_id IN (SELECT get_user_org_ids(auth.uid())) OR has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "portal user read own audit"
  ON public.suite_customer_portal_audit FOR SELECT TO authenticated
  USING (portal_user_id IN (
    SELECT id FROM public.suite_customer_portal_users WHERE auth_user_id = auth.uid()
  ));

-- inserts only via SECURITY DEFINER functions; no direct-insert policy

-- 3. Extend customer documents
ALTER TABLE public.suite_customer_documents
  ADD COLUMN uploaded_via_portal BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN replaces_document_id UUID REFERENCES public.suite_customer_documents(id) ON DELETE SET NULL,
  ADD COLUMN portal_uploaded_by UUID REFERENCES public.suite_customer_portal_users(id) ON DELETE SET NULL;

-- Update validation to accept 'pending_review'
CREATE OR REPLACE FUNCTION public.validate_customer_document()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('valid','expiring_soon','expired','rerequested','replaced','archived','pending_review') THEN
    RAISE EXCEPTION 'Invalid document status: %', NEW.status;
  END IF;
  IF NEW.issued_on IS NOT NULL AND NEW.expires_on IS NOT NULL AND NEW.expires_on < NEW.issued_on THEN
    RAISE EXCEPTION 'expires_on cannot be before issued_on';
  END IF;
  RETURN NEW;
END; $$;

-- 4. Helper: is current auth user a portal user for a customer?
CREATE OR REPLACE FUNCTION public.is_portal_user_of(_customer_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.suite_customer_portal_users
    WHERE customer_id = _customer_id
      AND auth_user_id = auth.uid()
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_portal_customer_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT customer_id FROM public.suite_customer_portal_users
  WHERE auth_user_id = auth.uid() AND status = 'active' LIMIT 1;
$$;

-- Allow portal user to read their own customer row + documents
CREATE POLICY "portal user read own customer"
  ON public.suite_customers FOR SELECT TO authenticated
  USING (public.is_portal_user_of(id));

CREATE POLICY "portal user read own docs"
  ON public.suite_customer_documents FOR SELECT TO authenticated
  USING (public.is_portal_user_of(customer_id));

-- 5. RPC: invite (staff-side; auth user creation still handled by edge function; this row is created by the edge function directly)
-- Provided here as a fallback / manual insert helper
CREATE OR REPLACE FUNCTION public.portal_invite_customer(_customer_id UUID, _email TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _org UUID; _id UUID;
BEGIN
  SELECT organisation_id INTO _org FROM public.suite_customers WHERE id = _customer_id;
  IF _org IS NULL THEN RAISE EXCEPTION 'Customer not found'; END IF;

  IF NOT (has_role(auth.uid(),'admin'::app_role) OR EXISTS (
    SELECT 1 FROM public.suite_org_members
    WHERE organization_id = _org AND user_id = auth.uid()
      AND role IN ('admin','mlro','compliance_officer')
  )) THEN
    RAISE EXCEPTION 'Not authorised to invite portal users for this org';
  END IF;

  INSERT INTO public.suite_customer_portal_users(customer_id, organisation_id, email, invited_by)
  VALUES (_customer_id, _org, LOWER(_email), auth.uid())
  ON CONFLICT DO NOTHING
  RETURNING id INTO _id;

  IF _id IS NULL THEN
    SELECT id INTO _id FROM public.suite_customer_portal_users
    WHERE customer_id = _customer_id AND status <> 'disabled' LIMIT 1;
  END IF;

  INSERT INTO public.suite_customer_portal_audit(customer_id, organisation_id, portal_user_id, actor_auth_id, actor_role, event, details)
  VALUES (_customer_id, _org, _id, auth.uid(), 'staff', 'invite_sent', jsonb_build_object('email', LOWER(_email)));

  RETURN _id;
END; $$;

-- 6. RPC: portal user submits a replacement
CREATE OR REPLACE FUNCTION public.portal_submit_document(
  _replaces_id UUID,
  _file_path TEXT,
  _file_name TEXT,
  _mime_type TEXT,
  _size_bytes BIGINT,
  _issued_on DATE,
  _expires_on DATE,
  _notes TEXT
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _old RECORD; _new_id UUID; _pu RECORD;
BEGIN
  SELECT * INTO _pu FROM public.suite_customer_portal_users
  WHERE auth_user_id = auth.uid() AND status = 'active' LIMIT 1;
  IF _pu.id IS NULL THEN RAISE EXCEPTION 'Not a portal user'; END IF;

  SELECT * INTO _old FROM public.suite_customer_documents WHERE id = _replaces_id;
  IF _old.id IS NULL OR _old.customer_id <> _pu.customer_id THEN
    RAISE EXCEPTION 'Document not accessible';
  END IF;

  INSERT INTO public.suite_customer_documents(
    customer_id, organisation_id, user_id, document_type, document_label,
    file_path, file_name, mime_type, size_bytes,
    issued_on, expires_on, status, notes, uploaded_by,
    uploaded_via_portal, replaces_document_id, portal_uploaded_by
  ) VALUES (
    _old.customer_id, _old.organisation_id, _old.user_id, _old.document_type, _old.document_label,
    _file_path, _file_name, _mime_type, _size_bytes,
    _issued_on, _expires_on, 'pending_review', _notes, NULL,
    TRUE, _old.id, _pu.id
  ) RETURNING id INTO _new_id;

  INSERT INTO public.suite_customer_portal_audit(customer_id, organisation_id, portal_user_id, actor_auth_id, actor_role, event, details)
  VALUES (_pu.customer_id, _pu.organisation_id, _pu.id, auth.uid(), 'portal', 'document_uploaded',
    jsonb_build_object('new_document_id', _new_id, 'replaces_document_id', _old.id, 'file_name', _file_name));

  RETURN _new_id;
END; $$;

-- 7. RPC: staff accept replacement
CREATE OR REPLACE FUNCTION public.portal_accept_document(_new_doc_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _new RECORD;
BEGIN
  SELECT * INTO _new FROM public.suite_customer_documents WHERE id = _new_doc_id;
  IF _new.id IS NULL OR _new.status <> 'pending_review' THEN
    RAISE EXCEPTION 'Document not in pending_review state';
  END IF;
  IF NOT (has_role(auth.uid(),'admin'::app_role) OR EXISTS (
    SELECT 1 FROM public.suite_org_members
    WHERE organization_id = _new.organisation_id AND user_id = auth.uid()
      AND role IN ('admin','mlro','compliance_officer','analyst')
  )) THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  UPDATE public.suite_customer_documents
  SET status = CASE WHEN expires_on IS NOT NULL AND expires_on <= (CURRENT_DATE + INTERVAL '30 days') THEN 'expiring_soon' ELSE 'valid' END,
      uploaded_by = auth.uid()
  WHERE id = _new_doc_id;

  IF _new.replaces_document_id IS NOT NULL THEN
    UPDATE public.suite_customer_documents
    SET status = 'replaced', replaced_by_document_id = _new_doc_id, archived_at = now()
    WHERE id = _new.replaces_document_id;

    UPDATE public.suite_alerts
    SET status = 'resolved', resolved_at = now(), resolved_by = auth.uid()
    WHERE status = 'open' AND alert_type = 'document'
      AND customer_id = _new.customer_id
      AND metadata->>'document_id' = _new.replaces_document_id::text;
  END IF;

  INSERT INTO public.suite_customer_portal_audit(customer_id, organisation_id, portal_user_id, actor_auth_id, actor_role, event, details)
  VALUES (_new.customer_id, _new.organisation_id, _new.portal_uploaded_by, auth.uid(), 'staff', 'document_replaced',
    jsonb_build_object('new_document_id', _new_doc_id, 'replaces_document_id', _new.replaces_document_id));
END; $$;

CREATE OR REPLACE FUNCTION public.portal_reject_document(_new_doc_id UUID, _reason TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _new RECORD;
BEGIN
  SELECT * INTO _new FROM public.suite_customer_documents WHERE id = _new_doc_id;
  IF _new.id IS NULL OR _new.status <> 'pending_review' THEN
    RAISE EXCEPTION 'Document not in pending_review state';
  END IF;
  IF NOT (has_role(auth.uid(),'admin'::app_role) OR EXISTS (
    SELECT 1 FROM public.suite_org_members
    WHERE organization_id = _new.organisation_id AND user_id = auth.uid()
      AND role IN ('admin','mlro','compliance_officer','analyst')
  )) THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  UPDATE public.suite_customer_documents
  SET status = 'archived', archived_at = now(), notes = COALESCE(notes,'') || E'\nRejected: ' || COALESCE(_reason,'')
  WHERE id = _new_doc_id;

  INSERT INTO public.suite_customer_portal_audit(customer_id, organisation_id, portal_user_id, actor_auth_id, actor_role, event, details)
  VALUES (_new.customer_id, _new.organisation_id, _new.portal_uploaded_by, auth.uid(), 'staff', 'document_rejected',
    jsonb_build_object('new_document_id', _new_doc_id, 'reason', _reason));
END; $$;

-- 8. RPC: portal user activation (called after auth signup) — links auth.uid to portal row by email
CREATE OR REPLACE FUNCTION public.portal_activate_session()
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _u RECORD; _pu RECORD;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT id, email INTO _u FROM auth.users WHERE id = auth.uid();

  -- Link by auth_user_id first
  SELECT * INTO _pu FROM public.suite_customer_portal_users WHERE auth_user_id = auth.uid() LIMIT 1;

  IF _pu.id IS NULL THEN
    -- Link by email (invited state)
    UPDATE public.suite_customer_portal_users
    SET auth_user_id = auth.uid(),
        status = 'active',
        activated_at = COALESCE(activated_at, now()),
        last_login_at = now()
    WHERE LOWER(email) = LOWER(_u.email) AND status = 'invited'
    RETURNING * INTO _pu;
  ELSE
    UPDATE public.suite_customer_portal_users
    SET last_login_at = now(),
        status = CASE WHEN status = 'invited' THEN 'active' ELSE status END,
        activated_at = COALESCE(activated_at, now())
    WHERE id = _pu.id
    RETURNING * INTO _pu;
  END IF;

  IF _pu.id IS NULL THEN
    RAISE EXCEPTION 'No portal invitation found for this email';
  END IF;

  INSERT INTO public.suite_customer_portal_audit(customer_id, organisation_id, portal_user_id, actor_auth_id, actor_role, event, details)
  VALUES (_pu.customer_id, _pu.organisation_id, _pu.id, auth.uid(), 'portal', 'logged_in', '{}'::jsonb);

  RETURN _pu.customer_id;
END; $$;

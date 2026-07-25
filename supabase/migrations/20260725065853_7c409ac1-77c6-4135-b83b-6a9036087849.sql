
-- 1) Table
CREATE TABLE public.suite_customer_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.suite_customers(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  document_label TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  issued_on DATE,
  expires_on DATE,
  status TEXT NOT NULL DEFAULT 'valid',
  notes TEXT,
  uploaded_by UUID,
  rerequested_at TIMESTAMPTZ,
  rerequested_by UUID,
  rerequest_reason TEXT,
  rerequest_due DATE,
  rerequest_message TEXT,
  replaced_by_document_id UUID REFERENCES public.suite_customer_documents(id) ON DELETE SET NULL,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_suite_customer_documents_customer ON public.suite_customer_documents(customer_id);
CREATE INDEX idx_suite_customer_documents_org ON public.suite_customer_documents(organisation_id);
CREATE INDEX idx_suite_customer_documents_expires ON public.suite_customer_documents(expires_on) WHERE status IN ('valid','expiring_soon','rerequested');
CREATE INDEX idx_suite_customer_documents_status ON public.suite_customer_documents(status);

-- 2) Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suite_customer_documents TO authenticated;
GRANT ALL ON public.suite_customer_documents TO service_role;

-- 3) RLS
ALTER TABLE public.suite_customer_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read customer docs"
ON public.suite_customer_documents FOR SELECT TO authenticated
USING (
  organisation_id IN (SELECT public.get_user_org_ids(auth.uid()))
  OR user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "org members insert customer docs"
ON public.suite_customer_documents FOR INSERT TO authenticated
WITH CHECK (
  (organisation_id IN (SELECT public.get_user_org_ids(auth.uid())) OR user_id = auth.uid())
  AND uploaded_by = auth.uid()
);

CREATE POLICY "org members update customer docs"
ON public.suite_customer_documents FOR UPDATE TO authenticated
USING (
  organisation_id IN (SELECT public.get_user_org_ids(auth.uid()))
  OR user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "org members delete customer docs"
ON public.suite_customer_documents FOR DELETE TO authenticated
USING (
  organisation_id IN (SELECT public.get_user_org_ids(auth.uid()))
  OR user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- 4) Validation trigger
CREATE OR REPLACE FUNCTION public.validate_customer_document()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('valid','expiring_soon','expired','rerequested','replaced','archived') THEN
    RAISE EXCEPTION 'Invalid document status: %', NEW.status;
  END IF;
  IF NEW.issued_on IS NOT NULL AND NEW.expires_on IS NOT NULL AND NEW.expires_on < NEW.issued_on THEN
    RAISE EXCEPTION 'expires_on cannot be before issued_on';
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER validate_customer_document_trg
BEFORE INSERT OR UPDATE ON public.suite_customer_documents
FOR EACH ROW EXECUTE FUNCTION public.validate_customer_document();

CREATE TRIGGER update_customer_documents_updated_at
BEFORE UPDATE ON public.suite_customer_documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Sweep function — refreshes statuses and emits alerts
CREATE OR REPLACE FUNCTION public.sweep_customer_document_expiry()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _expired INT := 0;
  _expiring INT := 0;
  _rerequest_overdue INT := 0;
  d RECORD;
  _severity TEXT;
  _title TEXT;
  _desc TEXT;
BEGIN
  -- Transition valid -> expired
  UPDATE public.suite_customer_documents
  SET status = 'expired'
  WHERE status IN ('valid','expiring_soon','rerequested')
    AND expires_on IS NOT NULL
    AND expires_on < CURRENT_DATE;
  GET DIAGNOSTICS _expired = ROW_COUNT;

  -- Transition valid -> expiring_soon (within 30 days)
  UPDATE public.suite_customer_documents
  SET status = 'expiring_soon'
  WHERE status = 'valid'
    AND expires_on IS NOT NULL
    AND expires_on >= CURRENT_DATE
    AND expires_on <= (CURRENT_DATE + INTERVAL '30 days');
  GET DIAGNOSTICS _expiring = ROW_COUNT;

  -- Emit alerts for expired / expiring / overdue re-requests
  FOR d IN
    SELECT cd.*, c.name AS customer_name
    FROM public.suite_customer_documents cd
    JOIN public.suite_customers c ON c.id = cd.customer_id
    WHERE cd.status IN ('expired','expiring_soon','rerequested')
      AND NOT EXISTS (
        SELECT 1 FROM public.suite_alerts a
        WHERE a.customer_id = cd.customer_id
          AND a.alert_type = 'document_expiry'
          AND a.status = 'open'
          AND a.metadata->>'document_id' = cd.id::text
      )
  LOOP
    IF d.status = 'rerequested' AND d.rerequest_due IS NOT NULL AND d.rerequest_due < CURRENT_DATE THEN
      _severity := 'critical';
      _title := 'Document re-request overdue';
      _desc := format('%s did not resubmit %s by %s.', d.customer_name, COALESCE(d.document_label, d.document_type), d.rerequest_due);
      _rerequest_overdue := _rerequest_overdue + 1;
    ELSIF d.status = 'expired' THEN
      _severity := 'high';
      _title := 'Customer document expired';
      _desc := format('%s document "%s" expired on %s.', d.customer_name, COALESCE(d.document_label, d.document_type), d.expires_on);
    ELSIF d.status = 'expiring_soon' THEN
      _severity := 'medium';
      _title := 'Customer document expiring soon';
      _desc := format('%s document "%s" expires on %s.', d.customer_name, COALESCE(d.document_label, d.document_type), d.expires_on);
    ELSE
      CONTINUE;
    END IF;

    INSERT INTO public.suite_alerts (
      user_id, organisation_id, customer_id, alert_type, severity,
      title, description, status, metadata
    ) VALUES (
      d.user_id, d.organisation_id, d.customer_id, 'document_expiry', _severity,
      _title, _desc, 'open',
      jsonb_build_object(
        'document_id', d.id,
        'document_type', d.document_type,
        'expires_on', d.expires_on,
        'rerequest_due', d.rerequest_due
      )
    );
  END LOOP;

  RETURN jsonb_build_object(
    'expired', _expired,
    'expiring', _expiring,
    'rerequest_overdue', _rerequest_overdue,
    'ran_at', now()
  );
END; $$;

GRANT EXECUTE ON FUNCTION public.sweep_customer_document_expiry() TO authenticated, service_role;

-- 6) Extend storage prefix allowlist to include customers/
DROP POLICY IF EXISTS "customer-documents prefix allowlist" ON storage.objects;
CREATE POLICY "customer-documents prefix allowlist"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id <> 'customer-documents'
  OR (storage.foldername(name))[1] IN ('sof','customers')
)
WITH CHECK (
  bucket_id <> 'customer-documents'
  OR (storage.foldername(name))[1] IN ('sof','customers')
);

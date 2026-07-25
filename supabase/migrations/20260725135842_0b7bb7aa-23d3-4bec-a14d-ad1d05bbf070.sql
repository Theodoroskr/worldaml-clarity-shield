
-- ============================================================
-- DSAR + Retention policies + Erasure log
-- ============================================================

CREATE TABLE public.suite_dsar_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.suite_organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,

  request_kind TEXT NOT NULL,         -- 'access'|'erasure'|'rectification'|'portability'|'restriction'|'objection'
  status TEXT NOT NULL DEFAULT 'received', -- received|verifying|in_progress|fulfilled|rejected|partially_fulfilled|withdrawn
  received_via TEXT,                  -- 'email'|'portal'|'phone'|'letter'|'agent'
  legal_basis TEXT,                   -- 'gdpr_15'|'gdpr_17'|'ccpa_105'|...

  -- Subject identification
  subject_name TEXT NOT NULL,
  subject_email TEXT,
  subject_phone TEXT,
  subject_customer_id UUID REFERENCES public.suite_customers(id) ON DELETE SET NULL,
  identity_verified BOOLEAN NOT NULL DEFAULT false,
  identity_verified_at TIMESTAMPTZ,
  identity_verified_by UUID,
  verification_notes TEXT,

  -- SLA / lifecycle
  due_by DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  fulfilled_at TIMESTAMPTZ,
  fulfilled_by UUID,
  rejection_reason TEXT,

  description TEXT,
  export_url TEXT,                    -- signed URL to portable data pkg (access/portability)
  redacted_record_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dsar_org    ON public.suite_dsar_requests(organisation_id);
CREATE INDEX idx_dsar_status ON public.suite_dsar_requests(status);
CREATE INDEX idx_dsar_due    ON public.suite_dsar_requests(due_by) WHERE status NOT IN ('fulfilled','rejected','withdrawn');

GRANT SELECT, INSERT, UPDATE ON public.suite_dsar_requests TO authenticated;
GRANT ALL ON public.suite_dsar_requests TO service_role;
ALTER TABLE public.suite_dsar_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dsar_org_read" ON public.suite_dsar_requests FOR SELECT TO authenticated
  USING (organisation_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "dsar_org_insert" ON public.suite_dsar_requests FOR INSERT TO authenticated
  WITH CHECK (organisation_id IN (SELECT public.get_user_org_ids(auth.uid())) AND user_id = auth.uid());

CREATE POLICY "dsar_org_update" ON public.suite_dsar_requests FOR UPDATE TO authenticated
  USING (organisation_id IN (SELECT public.get_user_org_ids(auth.uid())))
  WITH CHECK (organisation_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE TRIGGER trg_dsar_updated_at BEFORE UPDATE ON public.suite_dsar_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Retention policies ----------
CREATE TABLE public.suite_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.suite_organizations(id) ON DELETE CASCADE,  -- null = global default
  record_type TEXT NOT NULL,             -- 'customer'|'customer_document'|'transaction'|'screening'|'case'|'alert'|'sof_declaration'|'edd_case'|'ubo'|'audit_log'|'notification_log'
  retention_days INTEGER NOT NULL,
  disposition TEXT NOT NULL DEFAULT 'redact', -- 'redact'|'delete'|'archive'
  legal_basis TEXT,                      -- 'AMLD5 Art.40'|'GDPR Art.5(1)(e)'|...
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, record_type)
);

CREATE INDEX idx_retention_org ON public.suite_retention_policies(organisation_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.suite_retention_policies TO authenticated;
GRANT ALL ON public.suite_retention_policies TO service_role;
ALTER TABLE public.suite_retention_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "retention_read" ON public.suite_retention_policies FOR SELECT TO authenticated
  USING (organisation_id IS NULL OR organisation_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "retention_write" ON public.suite_retention_policies FOR ALL TO authenticated
  USING (
    organisation_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND EXISTS (SELECT 1 FROM public.suite_org_members m
                WHERE m.organization_id = organisation_id AND m.user_id = auth.uid()
                  AND m.role IN ('admin','mlro','compliance_officer'))
  )
  WITH CHECK (
    organisation_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND EXISTS (SELECT 1 FROM public.suite_org_members m
                WHERE m.organization_id = organisation_id AND m.user_id = auth.uid()
                  AND m.role IN ('admin','mlro','compliance_officer'))
  );

CREATE TRIGGER trg_retention_updated_at BEFORE UPDATE ON public.suite_retention_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed global defaults aligned to AMLD 5 Art. 40 (5-year AML) & GDPR Art. 5(1)(e)
INSERT INTO public.suite_retention_policies (organisation_id, record_type, retention_days, disposition, legal_basis, description) VALUES
  (NULL, 'customer',            1825, 'redact', 'AMLD5 Art.40', '5 years after end of business relationship'),
  (NULL, 'customer_document',   1825, 'redact', 'AMLD5 Art.40', '5 years — KYC identification evidence'),
  (NULL, 'transaction',         1825, 'redact', 'AMLD5 Art.40', '5 years — transaction records'),
  (NULL, 'screening',           1825, 'redact', 'AMLD5 Art.40', '5 years — sanctions/PEP screening results'),
  (NULL, 'sof_declaration',     1825, 'redact', 'AMLD5 Art.40', '5 years — source of funds declarations'),
  (NULL, 'edd_case',            1825, 'redact', 'AMLD5 Art.40', '5 years — enhanced due diligence dossiers'),
  (NULL, 'case',                1825, 'redact', 'AMLD5 Art.40', '5 years — case files'),
  (NULL, 'ubo',                 1825, 'redact', 'AMLD5 Art.40', '5 years — beneficial ownership records'),
  (NULL, 'alert',                730, 'redact', 'GDPR Art.5(1)(e)', '2 years — monitoring alerts'),
  (NULL, 'notification_log',     365, 'delete', 'GDPR Art.5(1)(e)', '1 year — operational notification log'),
  (NULL, 'audit_log',           2555, 'archive','AMLD5 Art.40 + local', '7 years — audit trail (archive, do not delete)')
ON CONFLICT DO NOTHING;

-- ---------- Erasure log ----------
CREATE TABLE public.suite_erasure_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  dsar_request_id UUID REFERENCES public.suite_dsar_requests(id) ON DELETE SET NULL,
  actor_id UUID,
  record_type TEXT NOT NULL,
  record_id UUID NOT NULL,
  disposition TEXT NOT NULL,             -- 'redact'|'delete'|'archive'
  reason TEXT,
  fields_redacted TEXT[] NOT NULL DEFAULT '{}',
  triggered_by TEXT NOT NULL,            -- 'dsar'|'retention_sweep'|'manual'
  policy_id UUID REFERENCES public.suite_retention_policies(id) ON DELETE SET NULL,
  legal_basis TEXT,
  content_hash TEXT,                     -- optional hash of removed content for proof-of-erasure
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_erasure_org       ON public.suite_erasure_log(organisation_id);
CREATE INDEX idx_erasure_record    ON public.suite_erasure_log(record_type, record_id);
CREATE INDEX idx_erasure_dsar      ON public.suite_erasure_log(dsar_request_id);
CREATE INDEX idx_erasure_created   ON public.suite_erasure_log(created_at DESC);

GRANT SELECT, INSERT ON public.suite_erasure_log TO authenticated;
GRANT ALL ON public.suite_erasure_log TO service_role;
ALTER TABLE public.suite_erasure_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "erasure_read" ON public.suite_erasure_log FOR SELECT TO authenticated
  USING (organisation_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "erasure_insert" ON public.suite_erasure_log FOR INSERT TO authenticated
  WITH CHECK (organisation_id IN (SELECT public.get_user_org_ids(auth.uid())));

-- ---------- Erasure RPC ----------
CREATE OR REPLACE FUNCTION public.dsar_execute_erasure(
  _customer_id UUID,
  _reason TEXT DEFAULT NULL,
  _dsar_id UUID DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org UUID;
  _redacted INT := 0;
  _cust RECORD;
  r RECORD;
BEGIN
  SELECT organisation_id INTO _org FROM public.suite_customers WHERE id = _customer_id;
  IF _org IS NULL THEN RAISE EXCEPTION 'Customer not found: %', _customer_id; END IF;

  -- Authorisation: admin / mlro / compliance_officer of the org
  IF NOT (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.suite_org_members m
               WHERE m.organization_id = _org AND m.user_id = auth.uid()
                 AND m.role IN ('admin','mlro','compliance_officer'))
  ) THEN
    RAISE EXCEPTION 'Not authorised to execute erasure';
  END IF;

  -- Snapshot customer for hash
  SELECT * INTO _cust FROM public.suite_customers WHERE id = _customer_id;

  -- 1) Customer PII
  UPDATE public.suite_customers SET
    name = '[REDACTED]',
    email = NULL, phone = NULL, address = NULL,
    company_name = CASE WHEN type = 'business' THEN '[REDACTED]' ELSE company_name END,
    onboarding_data = '{}'::jsonb
  WHERE id = _customer_id;
  INSERT INTO public.suite_erasure_log(organisation_id, dsar_request_id, actor_id, record_type, record_id, disposition, reason, fields_redacted, triggered_by, legal_basis, content_hash)
  VALUES (_org, _dsar_id, auth.uid(), 'customer', _customer_id, 'redact', _reason,
          ARRAY['name','email','phone','address','company_name','onboarding_data'],
          COALESCE(CASE WHEN _dsar_id IS NULL THEN 'manual' ELSE 'dsar' END,'dsar'),
          'GDPR Art.17',
          encode(digest(_cust::text, 'sha256'), 'hex'));
  _redacted := _redacted + 1;

  -- 2) Notes
  FOR r IN SELECT id FROM public.suite_customer_notes WHERE customer_id = _customer_id LOOP
    UPDATE public.suite_customer_notes SET body = '[REDACTED]', mentions = '{}' WHERE id = r.id;
    INSERT INTO public.suite_erasure_log(organisation_id, dsar_request_id, actor_id, record_type, record_id, disposition, reason, fields_redacted, triggered_by, legal_basis)
    VALUES (_org, _dsar_id, auth.uid(), 'customer_note', r.id, 'redact', _reason, ARRAY['body','mentions'],
            COALESCE(CASE WHEN _dsar_id IS NULL THEN 'manual' ELSE 'dsar' END,'dsar'), 'GDPR Art.17');
    _redacted := _redacted + 1;
  END LOOP;

  -- 3) Documents (metadata + file pointer)
  FOR r IN SELECT id FROM public.suite_customer_documents WHERE customer_id = _customer_id LOOP
    UPDATE public.suite_customer_documents SET
      document_label = '[REDACTED]',
      storage_path = NULL,
      status = 'archived',
      metadata = '{}'::jsonb
    WHERE id = r.id;
    INSERT INTO public.suite_erasure_log(organisation_id, dsar_request_id, actor_id, record_type, record_id, disposition, reason, fields_redacted, triggered_by, legal_basis)
    VALUES (_org, _dsar_id, auth.uid(), 'customer_document', r.id, 'redact', _reason,
            ARRAY['document_label','storage_path','metadata'],
            COALESCE(CASE WHEN _dsar_id IS NULL THEN 'manual' ELSE 'dsar' END,'dsar'), 'GDPR Art.17');
    _redacted := _redacted + 1;
  END LOOP;

  -- 4) Screenings
  FOR r IN SELECT id FROM public.suite_screenings WHERE customer_id = _customer_id LOOP
    UPDATE public.suite_screenings SET raw_response = '{}'::jsonb WHERE id = r.id;
    INSERT INTO public.suite_erasure_log(organisation_id, dsar_request_id, actor_id, record_type, record_id, disposition, reason, fields_redacted, triggered_by, legal_basis)
    VALUES (_org, _dsar_id, auth.uid(), 'screening', r.id, 'redact', _reason, ARRAY['raw_response'],
            COALESCE(CASE WHEN _dsar_id IS NULL THEN 'manual' ELSE 'dsar' END,'dsar'), 'GDPR Art.17');
    _redacted := _redacted + 1;
  END LOOP;

  -- 5) Source of Funds
  FOR r IN SELECT id FROM public.suite_sof_declarations WHERE customer_id = _customer_id LOOP
    UPDATE public.suite_sof_declarations SET
      declaration_text = '[REDACTED]',
      supporting_details = '{}'::jsonb
    WHERE id = r.id;
    INSERT INTO public.suite_erasure_log(organisation_id, dsar_request_id, actor_id, record_type, record_id, disposition, reason, fields_redacted, triggered_by, legal_basis)
    VALUES (_org, _dsar_id, auth.uid(), 'sof_declaration', r.id, 'redact', _reason,
            ARRAY['declaration_text','supporting_details'],
            COALESCE(CASE WHEN _dsar_id IS NULL THEN 'manual' ELSE 'dsar' END,'dsar'), 'GDPR Art.17');
    _redacted := _redacted + 1;
  END LOOP;

  -- 6) UBOs
  FOR r IN SELECT id FROM public.suite_ubo WHERE customer_id = _customer_id LOOP
    UPDATE public.suite_ubo SET
      full_name = '[REDACTED]', identifiers = '{}'::jsonb, address = NULL, notes = NULL
    WHERE id = r.id;
    INSERT INTO public.suite_erasure_log(organisation_id, dsar_request_id, actor_id, record_type, record_id, disposition, reason, fields_redacted, triggered_by, legal_basis)
    VALUES (_org, _dsar_id, auth.uid(), 'ubo', r.id, 'redact', _reason,
            ARRAY['full_name','identifiers','address','notes'],
            COALESCE(CASE WHEN _dsar_id IS NULL THEN 'manual' ELSE 'dsar' END,'dsar'), 'GDPR Art.17');
    _redacted := _redacted + 1;
  END LOOP;

  -- Update DSAR request record
  IF _dsar_id IS NOT NULL THEN
    UPDATE public.suite_dsar_requests SET
      status = 'fulfilled',
      fulfilled_at = now(),
      fulfilled_by = auth.uid(),
      redacted_record_count = _redacted
    WHERE id = _dsar_id;
  END IF;

  RETURN jsonb_build_object(
    'customer_id', _customer_id,
    'organisation_id', _org,
    'redacted_records', _redacted,
    'executed_at', now()
  );
END; $$;

-- ---------- Retention sweep RPC ----------
CREATE OR REPLACE FUNCTION public.sweep_retention()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  policy RECORD;
  r RECORD;
  _total INT := 0;
  _by_type jsonb := '{}'::jsonb;
  _count INT;
  _cutoff TIMESTAMPTZ;
BEGIN
  FOR policy IN
    SELECT DISTINCT ON (COALESCE(organisation_id, '00000000-0000-0000-0000-000000000000'::uuid), record_type)
           id, organisation_id, record_type, retention_days, disposition, legal_basis
    FROM public.suite_retention_policies
    WHERE is_active = true
    ORDER BY COALESCE(organisation_id, '00000000-0000-0000-0000-000000000000'::uuid), record_type,
             (organisation_id IS NOT NULL) DESC
  LOOP
    _cutoff := now() - make_interval(days => policy.retention_days);
    _count := 0;

    IF policy.record_type = 'alert' THEN
      FOR r IN
        SELECT id, organisation_id FROM public.suite_alerts
        WHERE created_at < _cutoff
          AND (policy.organisation_id IS NULL OR organisation_id = policy.organisation_id)
          AND NOT EXISTS (SELECT 1 FROM public.suite_erasure_log e
                          WHERE e.record_type='alert' AND e.record_id = suite_alerts.id)
        LIMIT 5000
      LOOP
        IF policy.disposition = 'delete' THEN
          DELETE FROM public.suite_alerts WHERE id = r.id;
        ELSE
          UPDATE public.suite_alerts SET description = '[RETAINED-EXPIRED]', metadata = '{}'::jsonb WHERE id = r.id;
        END IF;
        INSERT INTO public.suite_erasure_log(organisation_id, record_type, record_id, disposition, triggered_by, policy_id, legal_basis, fields_redacted)
        VALUES (r.organisation_id, 'alert', r.id, policy.disposition, 'retention_sweep', policy.id, policy.legal_basis, ARRAY['description','metadata']);
        _count := _count + 1;
      END LOOP;

    ELSIF policy.record_type = 'notification_log' THEN
      DELETE FROM public.suite_notification_log
      WHERE created_at < _cutoff;
      GET DIAGNOSTICS _count = ROW_COUNT;

    ELSIF policy.record_type = 'screening' THEN
      FOR r IN
        SELECT s.id, s.organisation_id FROM public.suite_screenings s
        WHERE s.screened_at < _cutoff
          AND (policy.organisation_id IS NULL OR s.organisation_id = policy.organisation_id)
          AND NOT EXISTS (SELECT 1 FROM public.suite_erasure_log e
                          WHERE e.record_type='screening' AND e.record_id = s.id)
        LIMIT 5000
      LOOP
        UPDATE public.suite_screenings SET raw_response = '{}'::jsonb WHERE id = r.id;
        INSERT INTO public.suite_erasure_log(organisation_id, record_type, record_id, disposition, triggered_by, policy_id, legal_basis, fields_redacted)
        VALUES (r.organisation_id, 'screening', r.id, 'redact', 'retention_sweep', policy.id, policy.legal_basis, ARRAY['raw_response']);
        _count := _count + 1;
      END LOOP;

    ELSIF policy.record_type = 'transaction' THEN
      FOR r IN
        SELECT t.id, t.organisation_id FROM public.suite_transactions t
        WHERE t.created_at < _cutoff
          AND (policy.organisation_id IS NULL OR t.organisation_id = policy.organisation_id)
          AND NOT EXISTS (SELECT 1 FROM public.suite_erasure_log e
                          WHERE e.record_type='transaction' AND e.record_id = t.id)
        LIMIT 5000
      LOOP
        UPDATE public.suite_transactions SET
          counterparty = '[REDACTED]', description = '[REDACTED]'
        WHERE id = r.id;
        INSERT INTO public.suite_erasure_log(organisation_id, record_type, record_id, disposition, triggered_by, policy_id, legal_basis, fields_redacted)
        VALUES (r.organisation_id, 'transaction', r.id, 'redact', 'retention_sweep', policy.id, policy.legal_basis, ARRAY['counterparty','description']);
        _count := _count + 1;
      END LOOP;
    END IF;

    _total := _total + _count;
    _by_type := _by_type || jsonb_build_object(policy.record_type, _count);
  END LOOP;

  RETURN jsonb_build_object('total', _total, 'by_type', _by_type, 'ran_at', now());
END; $$;

REVOKE EXECUTE ON FUNCTION public.sweep_retention() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sweep_retention() TO service_role;
GRANT EXECUTE ON FUNCTION public.dsar_execute_erasure(UUID, TEXT, UUID) TO authenticated;

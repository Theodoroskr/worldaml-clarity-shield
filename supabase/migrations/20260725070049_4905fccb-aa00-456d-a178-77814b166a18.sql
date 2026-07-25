
ALTER TABLE public.suite_alerts ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

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
  UPDATE public.suite_customer_documents
  SET status = 'expired'
  WHERE status IN ('valid','expiring_soon','rerequested')
    AND expires_on IS NOT NULL
    AND expires_on < CURRENT_DATE;
  GET DIAGNOSTICS _expired = ROW_COUNT;

  UPDATE public.suite_customer_documents
  SET status = 'expiring_soon'
  WHERE status = 'valid'
    AND expires_on IS NOT NULL
    AND expires_on >= CURRENT_DATE
    AND expires_on <= (CURRENT_DATE + INTERVAL '30 days');
  GET DIAGNOSTICS _expiring = ROW_COUNT;

  FOR d IN
    SELECT cd.*, c.name AS customer_name
    FROM public.suite_customer_documents cd
    JOIN public.suite_customers c ON c.id = cd.customer_id
    WHERE cd.status IN ('expired','expiring_soon','rerequested')
      AND NOT EXISTS (
        SELECT 1 FROM public.suite_alerts a
        WHERE a.customer_id = cd.customer_id
          AND a.alert_type = 'document'
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
      d.user_id, d.organisation_id, d.customer_id, 'document', _severity,
      _title, _desc, 'open',
      jsonb_build_object(
        'document_id', d.id,
        'document_type', d.document_type,
        'expires_on', d.expires_on,
        'rerequest_due', d.rerequest_due,
        'kind', 'document_expiry'
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

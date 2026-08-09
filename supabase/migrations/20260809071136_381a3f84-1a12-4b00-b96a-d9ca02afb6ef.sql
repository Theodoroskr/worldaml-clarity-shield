
-- =============== TABLES ===============
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  event_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  title text NOT NULL,
  message text,
  priority text NOT NULL DEFAULT 'action_required',
  status text NOT NULL DEFAULT 'open',
  nav_path text,
  action_url text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid,
  resolution_note text
);
CREATE UNIQUE INDEX IF NOT EXISTS admin_notifications_dedupe
  ON public.admin_notifications (event_type, entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS admin_notifications_status_idx ON public.admin_notifications (status, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_notifications_nav_idx ON public.admin_notifications (nav_path) WHERE status = 'open';

GRANT SELECT ON public.admin_notifications TO authenticated;
GRANT ALL ON public.admin_notifications TO service_role;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read notifications" ON public.admin_notifications
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.admin_notification_state (
  notification_id uuid NOT NULL REFERENCES public.admin_notifications(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL,
  read_at timestamptz,
  ignored_at timestamptz,
  snoozed_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (notification_id, admin_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_notification_state TO authenticated;
GRANT ALL ON public.admin_notification_state TO service_role;
ALTER TABLE public.admin_notification_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage own notification state" ON public.admin_notification_state
  FOR ALL TO authenticated
  USING (admin_id = auth.uid() AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (admin_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.admin_notification_prefs (
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  in_app boolean NOT NULL DEFAULT true,
  email boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, event_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_notification_prefs TO authenticated;
GRANT ALL ON public.admin_notification_prefs TO service_role;
ALTER TABLE public.admin_notification_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage own notification prefs" ON public.admin_notification_prefs
  FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.admin_notification_email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid REFERENCES public.admin_notifications(id) ON DELETE CASCADE,
  recipient text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_notification_email_log TO authenticated;
GRANT ALL ON public.admin_notification_email_log TO service_role;
ALTER TABLE public.admin_notification_email_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read notification email log" ON public.admin_notification_email_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =============== HELPERS ===============
CREATE OR REPLACE FUNCTION public.admin_notify_upsert(
  _category text, _event_type text, _entity_type text, _entity_id uuid,
  _title text, _message text, _priority text, _nav_path text, _action_url text,
  _metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid;
BEGIN
  INSERT INTO public.admin_notifications
    (category, event_type, entity_type, entity_id, title, message, priority, nav_path, action_url, metadata)
  VALUES (_category, _event_type, _entity_type, _entity_id, _title, _message, _priority, _nav_path, _action_url, COALESCE(_metadata,'{}'::jsonb))
  ON CONFLICT (event_type, entity_id) WHERE entity_id IS NOT NULL
  DO UPDATE SET title = EXCLUDED.title, message = EXCLUDED.message, metadata = EXCLUDED.metadata
  RETURNING id INTO _id;
  RETURN _id;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_notify_resolve(_event_type text, _entity_id uuid, _note text DEFAULT NULL)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.admin_notifications
     SET status = 'resolved', resolved_at = now(), resolution_note = COALESCE(_note, resolution_note)
   WHERE event_type = _event_type AND entity_id = _entity_id AND status = 'open';
$$;

-- Admin-facing actions (ignore / snooze / read)
CREATE OR REPLACE FUNCTION public.admin_notification_set_state(
  _notification_id uuid, _read boolean DEFAULT NULL, _ignore boolean DEFAULT NULL, _snooze_until timestamptz DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not authorised'; END IF;
  INSERT INTO public.admin_notification_state (notification_id, admin_id, read_at, ignored_at, snoozed_until)
  VALUES (
    _notification_id, auth.uid(),
    CASE WHEN _read THEN now() ELSE NULL END,
    CASE WHEN _ignore THEN now() ELSE NULL END,
    _snooze_until
  )
  ON CONFLICT (notification_id, admin_id) DO UPDATE SET
    read_at = CASE WHEN _read IS NULL THEN admin_notification_state.read_at
                   WHEN _read THEN COALESCE(admin_notification_state.read_at, now()) ELSE NULL END,
    ignored_at = CASE WHEN _ignore IS NULL THEN admin_notification_state.ignored_at
                      WHEN _ignore THEN now() ELSE NULL END,
    snoozed_until = COALESCE(_snooze_until, admin_notification_state.snoozed_until),
    updated_at = now();
END; $$;

CREATE OR REPLACE FUNCTION public.admin_notifications_mark_all_read()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not authorised'; END IF;
  INSERT INTO public.admin_notification_state (notification_id, admin_id, read_at)
  SELECT n.id, auth.uid(), now() FROM public.admin_notifications n
  ON CONFLICT (notification_id, admin_id) DO UPDATE SET read_at = COALESCE(admin_notification_state.read_at, now()), updated_at = now();
END; $$;

-- =============== TRIGGERS: PARTNER APPLICATIONS ===============
CREATE OR REPLACE FUNCTION public.trg_notify_partner_application()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'pending' THEN
      PERFORM public.admin_notify_upsert('partners','partner_application_pending','partner_application', NEW.id,
        'New partner application', COALESCE(NEW.company_name,'A company') || ' applied to the Partner Programme',
        'action_required','/admin/partners','/admin/partners',
        jsonb_build_object('company', NEW.company_name, 'contact_email', NEW.contact_email));
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'pending' THEN
      PERFORM public.admin_notify_upsert('partners','partner_application_pending','partner_application', NEW.id,
        'Partner application awaiting review', COALESCE(NEW.company_name,'A company') || ' is awaiting review',
        'action_required','/admin/partners','/admin/partners',
        jsonb_build_object('company', NEW.company_name, 'contact_email', NEW.contact_email));
    ELSE
      PERFORM public.admin_notify_resolve('partner_application_pending', NEW.id, 'Application ' || NEW.status::text);
    END IF;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS notify_partner_application ON public.partner_applications;
CREATE TRIGGER notify_partner_application AFTER INSERT OR UPDATE ON public.partner_applications
FOR EACH ROW EXECUTE FUNCTION public.trg_notify_partner_application();

-- =============== TRIGGERS: DEAL REGISTRATIONS ===============
CREATE OR REPLACE FUNCTION public.trg_notify_deal_registration()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    PERFORM public.admin_notify_upsert('partners','partner_deal_pending','deal_registration', NEW.id,
      'Deal registration awaiting approval', COALESCE(NEW.prospect_company,'A prospect') || ' registered by a partner',
      'action_required','/admin/partners','/admin/partners',
      jsonb_build_object('prospect', NEW.prospect_company));
  ELSE
    PERFORM public.admin_notify_resolve('partner_deal_pending', NEW.id, 'Deal ' || NEW.status::text);
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS notify_deal_registration ON public.deal_registrations;
CREATE TRIGGER notify_deal_registration AFTER INSERT OR UPDATE ON public.deal_registrations
FOR EACH ROW EXECUTE FUNCTION public.trg_notify_deal_registration();

-- =============== TRIGGERS: ACADEMY PURCHASES ===============
CREATE OR REPLACE FUNCTION public.trg_notify_academy_purchase()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IN ('failed','payment_failed') THEN
    PERFORM public.admin_notify_upsert('finance','purchase_failed','academy_purchase', NEW.id,
      'Academy payment failed',
      'Payment failed for ' || COALESCE(NEW.course_slug,'a course') || ' (' || COALESCE(NEW.currency,'EUR') || ' ' || (COALESCE(NEW.amount_cents,0)/100.0)::text || ')',
      'critical','/admin/purchase-status','/admin/purchase-status',
      jsonb_build_object('course', NEW.course_slug));
  ELSIF NEW.status = 'pending' THEN
    -- stale pending handled by sweep; nothing on insert
    NULL;
  ELSE
    PERFORM public.admin_notify_resolve('purchase_failed', NEW.id, 'Purchase ' || NEW.status);
    PERFORM public.admin_notify_resolve('purchase_stale_pending', NEW.id, 'Purchase ' || NEW.status);
    PERFORM public.admin_notify_resolve('purchase_reconciliation', NEW.id, 'Purchase ' || NEW.status);
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS notify_academy_purchase ON public.academy_course_purchases;
CREATE TRIGGER notify_academy_purchase AFTER INSERT OR UPDATE ON public.academy_course_purchases
FOR EACH ROW EXECUTE FUNCTION public.trg_notify_academy_purchase();

-- =============== TRIGGERS: REPORT RUNS ===============
CREATE OR REPLACE FUNCTION public.trg_notify_report_run()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IN ('failed','error') THEN
    PERFORM public.admin_notify_upsert('reports','report_failed','report_run', NEW.id,
      'Scheduled report failed', COALESCE(NEW.report_name,'A report') || ' failed to send' ||
      CASE WHEN NEW.error_message IS NOT NULL THEN ': ' || left(NEW.error_message, 160) ELSE '' END,
      'action_required','/admin/reports','/admin/reports',
      jsonb_build_object('report_id', NEW.report_id));
  ELSIF NEW.status IN ('sent','success','completed') AND NEW.report_id IS NOT NULL THEN
    UPDATE public.admin_notifications
       SET status='resolved', resolved_at=now(), resolution_note='Report re-sent successfully'
     WHERE event_type='report_failed' AND status='open'
       AND (metadata->>'report_id')::uuid = NEW.report_id;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS notify_report_run ON public.admin_report_runs;
CREATE TRIGGER notify_report_run AFTER INSERT OR UPDATE ON public.admin_report_runs
FOR EACH ROW EXECUTE FUNCTION public.trg_notify_report_run();

-- =============== TRIGGERS: FORM SUBMISSIONS (LEADS) ===============
CREATE OR REPLACE FUNCTION public.trg_notify_form_submission()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _evt text; _cat text;
BEGIN
  _evt := CASE WHEN NEW.form_type ILIKE '%demo%' THEN 'demo_request' ELSE 'new_lead' END;
  _cat := 'marketing';
  IF TG_OP = 'INSERT' THEN
    IF COALESCE(NEW.lead_status,'new') IN ('new','pending') THEN
      PERFORM public.admin_notify_upsert(_cat, _evt, 'form_submission', NEW.id,
        CASE WHEN _evt='demo_request' THEN 'New demo request' ELSE 'New enquiry awaiting review' END,
        COALESCE(NEW.first_name || ' ' || NEW.last_name, NEW.email) || COALESCE(' — ' || NEW.company, '') || ' (' || COALESCE(NEW.form_type,'form') || ')',
        'attention','/admin/forms','/admin/forms', jsonb_build_object('email', NEW.email));
    END IF;
  ELSIF TG_OP = 'UPDATE' AND COALESCE(NEW.lead_status,'new') NOT IN ('new','pending') THEN
    PERFORM public.admin_notify_resolve('new_lead', NEW.id, 'Lead ' || COALESCE(NEW.lead_status,''));
    PERFORM public.admin_notify_resolve('demo_request', NEW.id, 'Lead ' || COALESCE(NEW.lead_status,''));
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS notify_form_submission ON public.form_submissions;
CREATE TRIGGER notify_form_submission AFTER INSERT OR UPDATE ON public.form_submissions
FOR EACH ROW EXECUTE FUNCTION public.trg_notify_form_submission();

-- =============== SYNC / SWEEP (backfill + stale + reconciliation + auto-resolve) ===============
CREATE OR REPLACE FUNCTION public.admin_notifications_sync()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Partner applications pending
  PERFORM public.admin_notify_upsert('partners','partner_application_pending','partner_application', a.id,
    'Partner application awaiting review', COALESCE(a.company_name,'A company') || ' is awaiting review',
    'action_required','/admin/partners','/admin/partners', jsonb_build_object('company', a.company_name))
  FROM public.partner_applications a WHERE a.status = 'pending';

  UPDATE public.admin_notifications n SET status='resolved', resolved_at=now(), resolution_note='Application no longer pending'
   WHERE n.event_type='partner_application_pending' AND n.status='open'
     AND NOT EXISTS (SELECT 1 FROM public.partner_applications a WHERE a.id = n.entity_id AND a.status='pending');

  -- Deals pending
  PERFORM public.admin_notify_upsert('partners','partner_deal_pending','deal_registration', d.id,
    'Deal registration awaiting approval', COALESCE(d.prospect_company,'A prospect') || ' registered by a partner',
    'action_required','/admin/partners','/admin/partners', jsonb_build_object('prospect', d.prospect_company))
  FROM public.deal_registrations d WHERE d.status = 'pending';

  UPDATE public.admin_notifications n SET status='resolved', resolved_at=now(), resolution_note='Deal no longer pending'
   WHERE n.event_type='partner_deal_pending' AND n.status='open'
     AND NOT EXISTS (SELECT 1 FROM public.deal_registrations d WHERE d.id = n.entity_id AND d.status='pending');

  -- Failed academy payments
  PERFORM public.admin_notify_upsert('finance','purchase_failed','academy_purchase', p.id,
    'Academy payment failed',
    'Payment failed for ' || COALESCE(p.course_slug,'a course'),
    'critical','/admin/purchase-status','/admin/purchase-status', jsonb_build_object('course', p.course_slug))
  FROM public.academy_course_purchases p WHERE p.status IN ('failed','payment_failed');

  UPDATE public.admin_notifications n SET status='resolved', resolved_at=now(), resolution_note='Payment no longer failed'
   WHERE n.event_type='purchase_failed' AND n.status='open'
     AND NOT EXISTS (SELECT 1 FROM public.academy_course_purchases p WHERE p.id = n.entity_id AND p.status IN ('failed','payment_failed'));

  -- Stale pending payments (> 24h)
  PERFORM public.admin_notify_upsert('finance','purchase_stale_pending','academy_purchase', p.id,
    'Stale pending payment',
    'Payment for ' || COALESCE(p.course_slug,'a course') || ' has been pending since ' || to_char(p.created_at,'DD Mon YYYY'),
    'attention','/admin/purchase-status','/admin/purchase-status', jsonb_build_object('course', p.course_slug))
  FROM public.academy_course_purchases p
  WHERE p.status = 'pending' AND p.created_at < now() - interval '24 hours';

  UPDATE public.admin_notifications n SET status='resolved', resolved_at=now(), resolution_note='Pending payment cleared'
   WHERE n.event_type='purchase_stale_pending' AND n.status='open'
     AND NOT EXISTS (SELECT 1 FROM public.academy_course_purchases p WHERE p.id = n.entity_id AND p.status='pending');

  -- Reconciliation candidates: paid-looking records missing a Stripe reference, or paid without paid_at
  PERFORM public.admin_notify_upsert('finance','purchase_reconciliation','academy_purchase', p.id,
    'Purchase requires reconciliation',
    'Purchase for ' || COALESCE(p.course_slug,'a course') || ' may not match the payment provider record',
    'attention','/admin/reconcile-purchases','/admin/reconcile-purchases', jsonb_build_object('course', p.course_slug))
  FROM public.academy_course_purchases p
  WHERE p.status IN ('paid','completed') AND (p.stripe_session_id IS NULL AND p.stripe_payment_intent_id IS NULL OR p.paid_at IS NULL);

  UPDATE public.admin_notifications n SET status='resolved', resolved_at=now(), resolution_note='Reconciled'
   WHERE n.event_type='purchase_reconciliation' AND n.status='open'
     AND NOT EXISTS (
       SELECT 1 FROM public.academy_course_purchases p WHERE p.id = n.entity_id
        AND p.status IN ('paid','completed')
        AND (p.stripe_session_id IS NULL AND p.stripe_payment_intent_id IS NULL OR p.paid_at IS NULL));

  -- Failed report runs (last 30 days)
  PERFORM public.admin_notify_upsert('reports','report_failed','report_run', r.id,
    'Scheduled report failed', COALESCE(r.report_name,'A report') || ' failed to send',
    'action_required','/admin/reports','/admin/reports', jsonb_build_object('report_id', r.report_id))
  FROM public.admin_report_runs r
  WHERE r.status IN ('failed','error') AND r.created_at > now() - interval '30 days';

  -- New leads awaiting review (last 60 days)
  PERFORM public.admin_notify_upsert('marketing',
    CASE WHEN f.form_type ILIKE '%demo%' THEN 'demo_request' ELSE 'new_lead' END,
    'form_submission', f.id,
    CASE WHEN f.form_type ILIKE '%demo%' THEN 'New demo request' ELSE 'New enquiry awaiting review' END,
    COALESCE(f.first_name || ' ' || f.last_name, f.email) || COALESCE(' — ' || f.company,''),
    'attention','/admin/forms','/admin/forms', jsonb_build_object('email', f.email))
  FROM public.form_submissions f
  WHERE COALESCE(f.lead_status,'new') IN ('new','pending') AND f.created_at > now() - interval '60 days';

  UPDATE public.admin_notifications n SET status='resolved', resolved_at=now(), resolution_note='Lead processed'
   WHERE n.event_type IN ('new_lead','demo_request') AND n.status='open'
     AND NOT EXISTS (SELECT 1 FROM public.form_submissions f WHERE f.id = n.entity_id AND COALESCE(f.lead_status,'new') IN ('new','pending'));

  -- Partner portal access issues: approved partner without portal access
  PERFORM public.admin_notify_upsert('partners','partner_access_issue','partner', pt.id,
    'Partner portal access issue',
    COALESCE(pt.display_name,'A partner') || ' is active but has no portal access',
    'attention','/admin/partners','/admin/partners', jsonb_build_object('partner', pt.display_name))
  FROM public.partners pt
  WHERE pt.is_active = true AND COALESCE(pt.portal_access,'none') NOT IN ('enabled','active','granted');

  UPDATE public.admin_notifications n SET status='resolved', resolved_at=now(), resolution_note='Portal access granted'
   WHERE n.event_type='partner_access_issue' AND n.status='open'
     AND NOT EXISTS (SELECT 1 FROM public.partners pt WHERE pt.id = n.entity_id
        AND pt.is_active = true AND COALESCE(pt.portal_access,'none') NOT IN ('enabled','active','granted'));
END; $$;

GRANT EXECUTE ON FUNCTION public.admin_notifications_sync() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_notification_set_state(uuid, boolean, boolean, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_notifications_mark_all_read() TO authenticated;

SELECT public.admin_notifications_sync();

ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;

-- 1. Central activity stream ------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ecosystem_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  user_id UUID,
  organisation_id UUID,
  portal TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ecosystem_events TO authenticated;
GRANT ALL ON public.ecosystem_events TO service_role;

ALTER TABLE public.ecosystem_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read ecosystem events" ON public.ecosystem_events;
CREATE POLICY "Admins read ecosystem events"
  ON public.ecosystem_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_ecosystem_events_occurred ON public.ecosystem_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_ecosystem_events_user ON public.ecosystem_events (user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_ecosystem_events_type ON public.ecosystem_events (event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_ecosystem_events_entity ON public.ecosystem_events (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ecosystem_events_org ON public.ecosystem_events (organisation_id, occurred_at DESC);

-- 2. Additive timestamps / revenue fields ------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;
ALTER TABLE public.academy_course_purchases ADD COLUMN IF NOT EXISTS refund_amount_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.academy_course_purchases ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_last_activity ON public.profiles (last_activity_at DESC);

-- 3. Shared emitter -----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_ecosystem_event(
  _event_type TEXT,
  _entity_type TEXT,
  _entity_id UUID,
  _user_id UUID,
  _organisation_id UUID,
  _portal TEXT,
  _metadata JSONB DEFAULT '{}'::jsonb
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ecosystem_events
    (event_type, entity_type, entity_id, user_id, organisation_id, portal, metadata)
  VALUES
    (_event_type, _entity_type, _entity_id, _user_id, _organisation_id, _portal, COALESCE(_metadata, '{}'::jsonb));

  IF _user_id IS NOT NULL THEN
    UPDATE public.profiles
       SET last_activity_at = now()
     WHERE id = _user_id
       AND (last_activity_at IS NULL OR last_activity_at < now() - interval '1 minute');
  END IF;
END;
$$;

-- 4. Academy ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_event_academy_purchase()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'paid' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'paid') THEN
    PERFORM public.record_ecosystem_event(
      'academy.purchase_completed', 'academy_course_purchase', NEW.id, NEW.user_id, NULL, 'academy',
      jsonb_build_object('course_slug', NEW.course_slug, 'amount_cents', NEW.amount_cents, 'currency', NEW.currency)
    );
  ELSIF NEW.status = 'failed' AND (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM 'failed') THEN
    PERFORM public.record_ecosystem_event(
      'academy.purchase_failed', 'academy_course_purchase', NEW.id, NEW.user_id, NULL, 'academy',
      jsonb_build_object('course_slug', NEW.course_slug, 'amount_cents', NEW.amount_cents)
    );
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS ev_academy_purchase ON public.academy_course_purchases;
CREATE TRIGGER ev_academy_purchase AFTER INSERT OR UPDATE ON public.academy_course_purchases
FOR EACH ROW EXECUTE FUNCTION public.trg_event_academy_purchase();

CREATE OR REPLACE FUNCTION public.trg_event_academy_progress()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.completed_at IS NULL) THEN
    PERFORM public.record_ecosystem_event(
      'academy.course_completed', 'academy_progress', NEW.id, NEW.user_id, NULL, 'academy',
      jsonb_build_object('course_id', NEW.course_id, 'quiz_score', NEW.quiz_score)
    );
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS ev_academy_progress ON public.academy_progress;
CREATE TRIGGER ev_academy_progress AFTER INSERT OR UPDATE ON public.academy_progress
FOR EACH ROW EXECUTE FUNCTION public.trg_event_academy_progress();

CREATE OR REPLACE FUNCTION public.trg_event_academy_certificate()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.record_ecosystem_event(
    'academy.certificate_issued', 'academy_certificate', NEW.id, NEW.user_id, NULL, 'academy',
    jsonb_build_object('course_id', NEW.course_id, 'score', NEW.score)
  );
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS ev_academy_certificate ON public.academy_certificates;
CREATE TRIGGER ev_academy_certificate AFTER INSERT ON public.academy_certificates
FOR EACH ROW EXECUTE FUNCTION public.trg_event_academy_certificate();

-- 5. Business -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_event_business_account()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.record_ecosystem_event(
    'business.account_created', 'business_account', NEW.id, NEW.user_id, NEW.id, 'business',
    jsonb_build_object('company_name', NEW.company_name, 'country', NEW.country, 'status', NEW.status)
  );
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS ev_business_account ON public.business_accounts;
CREATE TRIGGER ev_business_account AFTER INSERT ON public.business_accounts
FOR EACH ROW EXECUTE FUNCTION public.trg_event_business_account();

CREATE OR REPLACE FUNCTION public.trg_event_business_entitlement()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owner_id UUID;
BEGIN
  IF NEW.status = 'active' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'active') THEN
    SELECT user_id INTO owner_id FROM public.business_accounts WHERE id = NEW.business_account_id;
    PERFORM public.record_ecosystem_event(
      'business.product_activated', 'business_entitlement', NEW.id, owner_id, NEW.business_account_id, 'business',
      jsonb_build_object('product_key', NEW.product_key, 'plan', NEW.plan, 'seats', NEW.seats)
    );
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS ev_business_entitlement ON public.business_entitlements;
CREATE TRIGGER ev_business_entitlement AFTER INSERT OR UPDATE ON public.business_entitlements
FOR EACH ROW EXECUTE FUNCTION public.trg_event_business_entitlement();

-- 6. Partners -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_event_partner_application()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.record_ecosystem_event(
      'partner.application_submitted', 'partner_application', NEW.id, NEW.user_id, NULL, 'partner',
      jsonb_build_object('company_name', NEW.company_name, 'partner_type', NEW.partner_type)
    );
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.record_ecosystem_event(
      'partner.application_' || NEW.status::text, 'partner_application', NEW.id, NEW.user_id, NULL, 'partner',
      jsonb_build_object('company_name', NEW.company_name, 'status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS ev_partner_application ON public.partner_applications;
CREATE TRIGGER ev_partner_application AFTER INSERT OR UPDATE ON public.partner_applications
FOR EACH ROW EXECUTE FUNCTION public.trg_event_partner_application();

CREATE OR REPLACE FUNCTION public.trg_event_partner_deal()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.record_ecosystem_event(
      'partner.deal_registered', 'deal_registration', NEW.id, NEW.submitted_by, NULL, 'partner',
      jsonb_build_object('partner_id', NEW.partner_id, 'prospect_company', NEW.prospect_company, 'estimated_arr_eur', NEW.estimated_arr_eur)
    );
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.record_ecosystem_event(
      'partner.deal_' || NEW.status::text, 'deal_registration', NEW.id, NEW.submitted_by, NULL, 'partner',
      jsonb_build_object('partner_id', NEW.partner_id, 'prospect_company', NEW.prospect_company,
                         'status', NEW.status, 'actual_arr_eur', NEW.actual_arr_eur)
    );
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS ev_partner_deal ON public.deal_registrations;
CREATE TRIGGER ev_partner_deal AFTER INSERT OR UPDATE ON public.deal_registrations
FOR EACH ROW EXECUTE FUNCTION public.trg_event_partner_deal();

CREATE OR REPLACE FUNCTION public.trg_event_partner_commission()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owner_id UUID;
BEGIN
  SELECT user_id INTO owner_id FROM public.partners WHERE id = NEW.partner_id;
  IF TG_OP = 'INSERT' THEN
    PERFORM public.record_ecosystem_event(
      'partner.commission_earned', 'partner_commission', NEW.id, owner_id, NULL, 'partner',
      jsonb_build_object('partner_id', NEW.partner_id, 'amount_cents', NEW.amount_cents, 'currency', NEW.currency)
    );
  ELSIF NEW.status = 'paid' AND OLD.status IS DISTINCT FROM 'paid' THEN
    PERFORM public.record_ecosystem_event(
      'partner.commission_paid', 'partner_commission', NEW.id, owner_id, NULL, 'partner',
      jsonb_build_object('partner_id', NEW.partner_id, 'amount_cents', NEW.amount_cents, 'currency', NEW.currency)
    );
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS ev_partner_commission ON public.partner_commissions;
CREATE TRIGGER ev_partner_commission AFTER INSERT OR UPDATE ON public.partner_commissions
FOR EACH ROW EXECUTE FUNCTION public.trg_event_partner_commission();

-- 7. Suite --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_event_suite_screening()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.record_ecosystem_event(
    'suite.screening_completed', 'suite_screening', NEW.id, NEW.user_id, NEW.organisation_id, 'suite',
    jsonb_build_object('screening_type', NEW.screening_type, 'result', NEW.result, 'match_count', NEW.match_count)
  );
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS ev_suite_screening ON public.suite_screenings;
CREATE TRIGGER ev_suite_screening AFTER INSERT ON public.suite_screenings
FOR EACH ROW EXECUTE FUNCTION public.trg_event_suite_screening();

-- 8. Website ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_event_form_submission()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE matched_user UUID;
BEGIN
  SELECT id INTO matched_user FROM public.profiles WHERE lower(email) = lower(NEW.email) LIMIT 1;
  PERFORM public.record_ecosystem_event(
    'website.form_submitted', 'form_submission', NEW.id, matched_user, NULL, 'website',
    jsonb_build_object('form_type', NEW.form_type, 'company', NEW.company, 'country', NEW.country,
                       'products', NEW.products, 'region', NEW.region)
  );
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS ev_form_submission ON public.form_submissions;
CREATE TRIGGER ev_form_submission AFTER INSERT ON public.form_submissions
FOR EACH ROW EXECUTE FUNCTION public.trg_event_form_submission();
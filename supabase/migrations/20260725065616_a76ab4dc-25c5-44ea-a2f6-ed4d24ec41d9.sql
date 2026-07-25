
-- 1. Table
CREATE TABLE public.suite_periodic_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.suite_customers(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  risk_level_at_scheduling TEXT NOT NULL,
  cadence_months INTEGER NOT NULL,
  scheduled_for DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  completed_at TIMESTAMPTZ,
  completed_by UUID,
  assigned_to UUID,
  outcome TEXT,
  notes TEXT,
  auto_generated BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_spr_customer ON public.suite_periodic_reviews(customer_id);
CREATE INDEX idx_spr_org_status_due ON public.suite_periodic_reviews(organisation_id, status, scheduled_for);

-- 2. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suite_periodic_reviews TO authenticated;
GRANT ALL ON public.suite_periodic_reviews TO service_role;

-- 3. RLS
ALTER TABLE public.suite_periodic_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read reviews"
ON public.suite_periodic_reviews FOR SELECT TO authenticated
USING (organisation_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "org editors insert reviews"
ON public.suite_periodic_reviews FOR INSERT TO authenticated
WITH CHECK (
  organisation_id IN (SELECT public.get_user_org_ids(auth.uid()))
);

CREATE POLICY "org editors update reviews"
ON public.suite_periodic_reviews FOR UPDATE TO authenticated
USING (
  organisation_id IN (SELECT public.get_user_org_ids(auth.uid()))
  AND EXISTS (
    SELECT 1 FROM public.suite_org_members m
    WHERE m.organization_id = organisation_id AND m.user_id = auth.uid()
      AND m.role IN ('admin','mlro','compliance_officer','analyst')
  )
);

CREATE POLICY "org managers delete reviews"
ON public.suite_periodic_reviews FOR DELETE TO authenticated
USING (
  organisation_id IN (SELECT public.get_user_org_ids(auth.uid()))
  AND EXISTS (
    SELECT 1 FROM public.suite_org_members m
    WHERE m.organization_id = organisation_id AND m.user_id = auth.uid()
      AND m.role IN ('admin','mlro','compliance_officer')
  )
);

-- 4. updated_at trigger
CREATE TRIGGER trg_spr_touch
BEFORE UPDATE ON public.suite_periodic_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Validation trigger
CREATE OR REPLACE FUNCTION public.validate_periodic_review()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('scheduled','in_progress','completed','overdue','cancelled') THEN
    RAISE EXCEPTION 'Invalid review status: %', NEW.status;
  END IF;
  IF NEW.outcome IS NOT NULL AND NEW.outcome NOT IN ('unchanged','risk_increased','risk_decreased','offboarded','edd_triggered') THEN
    RAISE EXCEPTION 'Invalid review outcome: %', NEW.outcome;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_validate_periodic_review
BEFORE INSERT OR UPDATE ON public.suite_periodic_reviews
FOR EACH ROW EXECUTE FUNCTION public.validate_periodic_review();

-- 6. Cadence helper
CREATE OR REPLACE FUNCTION public.review_cadence_months(_risk_level TEXT)
RETURNS INTEGER LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE lower(coalesce(_risk_level,'low'))
    WHEN 'critical' THEN 6
    WHEN 'high'     THEN 12
    WHEN 'medium'   THEN 24
    ELSE                 36
  END;
$$;

-- 7. Auto-schedule on customer insert / risk change
CREATE OR REPLACE FUNCTION public.schedule_periodic_review()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _cadence INTEGER;
  _risk TEXT := COALESCE(NEW.risk_level, 'low');
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.risk_level IS NOT DISTINCT FROM NEW.risk_level THEN
    RETURN NEW;
  END IF;

  _cadence := public.review_cadence_months(_risk);

  -- Cancel any open auto-generated review for this customer (superseded by new risk tier)
  UPDATE public.suite_periodic_reviews
  SET status = 'cancelled',
      notes = COALESCE(notes,'') || E'\nSuperseded by risk change to ' || _risk
  WHERE customer_id = NEW.id
    AND status IN ('scheduled','overdue')
    AND auto_generated = true;

  INSERT INTO public.suite_periodic_reviews (
    customer_id, organisation_id, user_id,
    risk_level_at_scheduling, cadence_months, scheduled_for, auto_generated
  ) VALUES (
    NEW.id, NEW.organisation_id, NEW.user_id,
    _risk, _cadence, (CURRENT_DATE + (_cadence || ' months')::interval)::date, true
  );

  RETURN NEW;
END; $$;

CREATE TRIGGER trg_schedule_periodic_review
AFTER INSERT OR UPDATE OF risk_level ON public.suite_customers
FOR EACH ROW EXECUTE FUNCTION public.schedule_periodic_review();

-- 8. Auto-schedule the *next* review when one is completed
CREATE OR REPLACE FUNCTION public.chain_next_periodic_review()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _cust RECORD;
  _cadence INTEGER;
  _risk TEXT;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    IF NEW.completed_at IS NULL THEN NEW.completed_at := now(); END IF;
    IF NEW.completed_by IS NULL THEN NEW.completed_by := auth.uid(); END IF;

    SELECT risk_level, organisation_id, user_id INTO _cust
    FROM public.suite_customers WHERE id = NEW.customer_id;

    _risk := COALESCE(_cust.risk_level,'low');
    _cadence := public.review_cadence_months(_risk);

    INSERT INTO public.suite_periodic_reviews (
      customer_id, organisation_id, user_id,
      risk_level_at_scheduling, cadence_months, scheduled_for, auto_generated
    ) VALUES (
      NEW.customer_id, _cust.organisation_id, _cust.user_id,
      _risk, _cadence, (CURRENT_DATE + (_cadence || ' months')::interval)::date, true
    );
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_chain_next_review
BEFORE UPDATE ON public.suite_periodic_reviews
FOR EACH ROW EXECUTE FUNCTION public.chain_next_periodic_review();

-- 9. Backfill: schedule an initial review for every existing customer without one
INSERT INTO public.suite_periodic_reviews (
  customer_id, organisation_id, user_id,
  risk_level_at_scheduling, cadence_months, scheduled_for, auto_generated
)
SELECT
  c.id, c.organisation_id, c.user_id,
  COALESCE(c.risk_level,'low'),
  public.review_cadence_months(c.risk_level),
  (CURRENT_DATE + (public.review_cadence_months(c.risk_level) || ' months')::interval)::date,
  true
FROM public.suite_customers c
WHERE c.organisation_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.suite_periodic_reviews r
    WHERE r.customer_id = c.id AND r.status IN ('scheduled','overdue','in_progress')
  );

-- 10. Overdue flip helper (call from a cron if desired)
CREATE OR REPLACE FUNCTION public.mark_overdue_periodic_reviews()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _count INTEGER;
BEGIN
  UPDATE public.suite_periodic_reviews
  SET status = 'overdue'
  WHERE status = 'scheduled' AND scheduled_for < CURRENT_DATE;
  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END; $$;

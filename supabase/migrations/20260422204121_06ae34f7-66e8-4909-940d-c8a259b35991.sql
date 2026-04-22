-- Table for one-off Academy course purchases
CREATE TABLE public.academy_course_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_slug TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lookups
CREATE INDEX idx_acp_user_slug ON public.academy_course_purchases (user_id, course_slug);
CREATE INDEX idx_acp_session ON public.academy_course_purchases (stripe_session_id);
CREATE UNIQUE INDEX idx_acp_user_slug_paid ON public.academy_course_purchases (user_id, course_slug)
  WHERE status = 'paid';

-- Status validation
CREATE OR REPLACE FUNCTION public.validate_academy_purchase_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'paid', 'failed', 'refunded') THEN
    RAISE EXCEPTION 'Invalid academy purchase status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_academy_purchase_status_trg
BEFORE INSERT OR UPDATE ON public.academy_course_purchases
FOR EACH ROW EXECUTE FUNCTION public.validate_academy_purchase_status();

CREATE TRIGGER update_academy_course_purchases_updated_at
BEFORE UPDATE ON public.academy_course_purchases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.academy_course_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own
CREATE POLICY "Users view own academy purchases"
ON public.academy_course_purchases
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins view all
CREATE POLICY "Admins view all academy purchases"
ON public.academy_course_purchases
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Block direct writes — only service role (webhook) may insert/update
CREATE POLICY "Deny direct inserts on academy purchases"
ON public.academy_course_purchases
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Deny direct updates on academy purchases"
ON public.academy_course_purchases
FOR UPDATE
TO authenticated
USING (false);
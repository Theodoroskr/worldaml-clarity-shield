ALTER TABLE public.business_quote_requests
  ADD COLUMN IF NOT EXISTS quoted_product_key text,
  ADD COLUMN IF NOT EXISTS quoted_amount_cents integer,
  ADD COLUMN IF NOT EXISTS quoted_currency text NOT NULL DEFAULT 'eur',
  ADD COLUMN IF NOT EXISTS quoted_interval text NOT NULL DEFAULT 'year',
  ADD COLUMN IF NOT EXISTS quoted_price_id text,
  ADD COLUMN IF NOT EXISTS quote_notes text,
  ADD COLUMN IF NOT EXISTS quote_valid_until timestamptz,
  ADD COLUMN IF NOT EXISTS quoted_at timestamptz,
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

DO $$ BEGIN
  ALTER TABLE public.business_quote_requests
    ADD CONSTRAINT business_quote_requests_interval_chk
    CHECK (quoted_interval IN ('month', 'year', 'one_time'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Record when an offer was published, so the buyer sees a dated quote.
CREATE OR REPLACE FUNCTION public.stamp_quote_offer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.quoted_amount_cents IS NOT NULL
     AND (OLD.quoted_amount_cents IS DISTINCT FROM NEW.quoted_amount_cents
          OR OLD.status IS DISTINCT FROM NEW.status)
     AND NEW.quoted_at IS NULL THEN
    NEW.quoted_at := now();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS stamp_quote_offer_trg ON public.business_quote_requests;
CREATE TRIGGER stamp_quote_offer_trg
BEFORE UPDATE ON public.business_quote_requests
FOR EACH ROW EXECUTE FUNCTION public.stamp_quote_offer();
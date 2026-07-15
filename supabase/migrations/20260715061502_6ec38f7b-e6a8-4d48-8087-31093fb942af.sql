
-- Extend partners with payout + notification prefs
ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS payout_method text,
  ADD COLUMN IF NOT EXISTS payout_details_encrypted text,
  ADD COLUMN IF NOT EXISTS notification_prefs jsonb NOT NULL DEFAULT '{"deal_updates":true,"new_asset":true,"payouts":true,"monthly_summary":true}'::jsonb;

-- ============ partner_payouts ============
CREATE TABLE IF NOT EXISTS public.partner_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  amount_eur numeric(12,2) NOT NULL CHECK (amount_eur >= 0),
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL DEFAULT 'pending',
  method text,
  reference text,
  notes text,
  period_start date,
  period_end date,
  paid_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_payouts TO authenticated;
GRANT ALL ON public.partner_payouts TO service_role;

ALTER TABLE public.partner_payouts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.validate_partner_payout_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status NOT IN ('pending','processing','paid','failed','cancelled') THEN
    RAISE EXCEPTION 'Invalid partner_payout status: %', NEW.status;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS validate_partner_payout_status_trg ON public.partner_payouts;
CREATE TRIGGER validate_partner_payout_status_trg
BEFORE INSERT OR UPDATE ON public.partner_payouts
FOR EACH ROW EXECUTE FUNCTION public.validate_partner_payout_status();

DROP TRIGGER IF EXISTS update_partner_payouts_updated_at ON public.partner_payouts;
CREATE TRIGGER update_partner_payouts_updated_at
BEFORE UPDATE ON public.partner_payouts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Partner sees own payouts"
  ON public.partner_payouts FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.partners p WHERE p.id = partner_id AND p.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admin manages payouts"
  ON public.partner_payouts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ partner_assets ============
CREATE TABLE IF NOT EXISTS public.partner_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'one_pager',
  file_path text,
  file_url text,
  thumbnail_url text,
  file_size_bytes bigint,
  content_type text,
  certification_min text NOT NULL DEFAULT 'bronze',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_assets TO authenticated;
GRANT ALL ON public.partner_assets TO service_role;

ALTER TABLE public.partner_assets ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.validate_partner_asset_category()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.category NOT IN ('logo','one_pager','deck','email_template','banner','case_study','contract','brand_guide','video') THEN
    RAISE EXCEPTION 'Invalid partner_asset category: %', NEW.category;
  END IF;
  IF NEW.certification_min NOT IN ('bronze','silver','gold') THEN
    RAISE EXCEPTION 'Invalid certification_min: %', NEW.certification_min;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS validate_partner_asset_category_trg ON public.partner_assets;
CREATE TRIGGER validate_partner_asset_category_trg
BEFORE INSERT OR UPDATE ON public.partner_assets
FOR EACH ROW EXECUTE FUNCTION public.validate_partner_asset_category();

DROP TRIGGER IF EXISTS update_partner_assets_updated_at ON public.partner_assets;
CREATE TRIGGER update_partner_assets_updated_at
BEFORE UPDATE ON public.partner_assets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper: current user's partner certification level (or null)
CREATE OR REPLACE FUNCTION public.current_partner_cert_level()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT certification_level::text FROM public.partners
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1;
$$;

-- Rank helper for certification tiers
CREATE OR REPLACE FUNCTION public.cert_rank(_level text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE lower(_level)
    WHEN 'bronze' THEN 1
    WHEN 'silver' THEN 2
    WHEN 'gold' THEN 3
    ELSE 0 END;
$$;

CREATE POLICY "Active partners view eligible assets"
  ON public.partner_assets FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR (
      is_active = true
      AND public.current_partner_cert_level() IS NOT NULL
      AND public.cert_rank(public.current_partner_cert_level()) >= public.cert_rank(certification_min)
    )
  );

CREATE POLICY "Admin manages assets"
  ON public.partner_assets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

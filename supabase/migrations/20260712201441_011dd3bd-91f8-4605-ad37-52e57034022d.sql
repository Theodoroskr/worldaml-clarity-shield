
-- 1. Extend partner_type enum
ALTER TYPE partner_type ADD VALUE IF NOT EXISTS 'technology';

-- 2. Certification enum
DO $$ BEGIN
  CREATE TYPE partner_certification AS ENUM ('none','bronze','silver','gold');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Deal-reg enum
DO $$ BEGIN
  CREATE TYPE deal_registration_status AS ENUM ('pending','approved','rejected','won','lost','expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. Extend partners table
ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS verticals TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS certification_level partner_certification NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS sandbox_key TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS sandbox_key_issued_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS academy_seats_granted INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission_lifetime_months INT NOT NULL DEFAULT 24;

-- 5. Auto-issue sandbox key on partner creation
CREATE OR REPLACE FUNCTION public.partner_issue_sandbox_key()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.sandbox_key IS NULL THEN
    NEW.sandbox_key := 'sk_test_' || encode(gen_random_bytes(24), 'hex');
    NEW.sandbox_key_issued_at := now();
  END IF;
  -- Grant default free Academy seats by tier
  IF NEW.academy_seats_granted = 0 THEN
    NEW.academy_seats_granted := CASE NEW.partner_type
      WHEN 'referral' THEN 2
      WHEN 'affiliate' THEN 5
      WHEN 'reseller' THEN 10
      WHEN 'technology' THEN 5
      ELSE 2 END;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_partner_issue_sandbox_key ON public.partners;
CREATE TRIGGER trg_partner_issue_sandbox_key
BEFORE INSERT ON public.partners
FOR EACH ROW EXECUTE FUNCTION public.partner_issue_sandbox_key();

-- 6. Public directory: allow anon/auth SELECT of featured partners only
DROP POLICY IF EXISTS "Public can view featured partners" ON public.partners;
CREATE POLICY "Public can view featured partners"
ON public.partners
FOR SELECT
TO anon, authenticated
USING (is_featured = true AND is_active = true);

GRANT SELECT ON public.partners TO anon;

-- 7. Deal registrations table
CREATE TABLE IF NOT EXISTS public.deal_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prospect_company TEXT NOT NULL,
  prospect_contact_name TEXT,
  prospect_email TEXT,
  prospect_country TEXT,
  estimated_arr_eur INT,
  product_interest TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  status deal_registration_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  protection_expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '90 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.deal_registrations TO authenticated;
GRANT ALL ON public.deal_registrations TO service_role;

ALTER TABLE public.deal_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own deal registrations"
ON public.deal_registrations FOR SELECT TO authenticated
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

CREATE POLICY "Partners can insert own deal registrations"
ON public.deal_registrations FOR INSERT TO authenticated
WITH CHECK (
  submitted_by = auth.uid()
  AND partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid() AND is_active = true)
);

CREATE POLICY "Admins can view all deal registrations"
ON public.deal_registrations FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update deal registrations"
ON public.deal_registrations FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_deal_registrations_updated_at
BEFORE UPDATE ON public.deal_registrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

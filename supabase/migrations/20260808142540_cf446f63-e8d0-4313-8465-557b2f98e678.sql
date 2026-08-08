-- Marketing hub metadata on partner assets
ALTER TABLE public.partner_assets
  ADD COLUMN IF NOT EXISTS asset_type text NOT NULL DEFAULT 'brochure',
  ADD COLUMN IF NOT EXISTS product text,
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'English',
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS is_cobrandable boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS version_label text,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS content jsonb,
  ADD COLUMN IF NOT EXISTS cta_url text;

CREATE OR REPLACE FUNCTION public.validate_partner_asset_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('draft','approved','archived') THEN
    RAISE EXCEPTION 'Invalid asset status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_partner_asset_status ON public.partner_assets;
CREATE TRIGGER trg_validate_partner_asset_status
BEFORE INSERT OR UPDATE ON public.partner_assets
FOR EACH ROW EXECUTE FUNCTION public.validate_partner_asset_status();

-- Partners see approved + draft-content items, never archived
DROP POLICY IF EXISTS "Active partners view eligible assets" ON public.partner_assets;
CREATE POLICY "Active partners view eligible assets"
ON public.partner_assets FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    is_active = true
    AND status IN ('approved','draft')
    AND current_partner_cert_level() IS NOT NULL
    AND cert_rank(current_partner_cert_level()) >= cert_rank(certification_min)
  )
);

-- Co-brand request detail fields
ALTER TABLE public.partner_cobrand_requests
  ADD COLUMN IF NOT EXISTS market text,
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS logo_path text;

-- Download / view tracking
CREATE TABLE IF NOT EXISTS public.partner_asset_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  asset_id uuid REFERENCES public.partner_assets(id) ON DELETE SET NULL,
  user_id uuid,
  event_type text NOT NULL DEFAULT 'view',
  asset_title text,
  product text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.partner_asset_events TO authenticated;
GRANT ALL ON public.partner_asset_events TO service_role;
ALTER TABLE public.partner_asset_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners log own asset events" ON public.partner_asset_events;
CREATE POLICY "Partners log own asset events"
ON public.partner_asset_events FOR INSERT TO authenticated
WITH CHECK (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Partners view own asset events" ON public.partner_asset_events;
CREATE POLICY "Partners view own asset events"
ON public.partner_asset_events FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
);

CREATE INDEX IF NOT EXISTS idx_partner_asset_events_partner ON public.partner_asset_events(partner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partner_assets_status ON public.partner_assets(status, asset_type);
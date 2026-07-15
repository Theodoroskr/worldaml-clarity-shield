
CREATE TABLE public.partner_asset_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES public.partner_assets(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_path TEXT,
  file_url TEXT,
  content_type TEXT,
  file_size_bytes BIGINT,
  changelog TEXT,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(asset_id, version_number)
);

CREATE INDEX idx_partner_asset_versions_asset ON public.partner_asset_versions(asset_id, version_number DESC);

GRANT SELECT ON public.partner_asset_versions TO authenticated;
GRANT ALL ON public.partner_asset_versions TO service_role;

ALTER TABLE public.partner_asset_versions ENABLE ROW LEVEL SECURITY;

-- Admins full manage
CREATE POLICY "Admins manage asset versions"
  ON public.partner_asset_versions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Active partners can read versions of assets they can access
CREATE POLICY "Partners read eligible asset versions"
  ON public.partner_asset_versions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.partner_assets a
      JOIN public.partners p ON p.user_id = auth.uid() AND p.is_active = true
      WHERE a.id = partner_asset_versions.asset_id
        AND a.is_active = true
        AND public.cert_rank(COALESCE(p.certification_level::text,'bronze')) >= public.cert_rank(a.certification_min)
    )
  );

-- Add preview + version tracking columns on partner_assets
ALTER TABLE public.partner_assets
  ADD COLUMN IF NOT EXISTS preview_url TEXT,
  ADD COLUMN IF NOT EXISTS current_version INTEGER NOT NULL DEFAULT 1;

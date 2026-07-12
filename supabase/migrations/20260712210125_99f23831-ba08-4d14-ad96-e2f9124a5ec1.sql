
-- Remove public row-level access to partners table so sensitive columns
-- (sandbox_key, commission_rate, referral_code) can never leak through the same row.
DROP POLICY IF EXISTS "Public can view featured partners" ON public.partners;

-- Expose only safe marketing columns via a security_invoker view.
CREATE OR REPLACE VIEW public.featured_partners
WITH (security_invoker = true) AS
SELECT
  id,
  display_name,
  logo_url,
  tagline,
  bio,
  verticals,
  website_url,
  partner_type,
  certification_level,
  is_featured,
  is_active
FROM public.partners
WHERE is_featured = true AND is_active = true;

-- Allow admins to still see all featured rows through the view via existing partners policies.
-- Grant read on the view to anon/authenticated.
REVOKE ALL ON public.featured_partners FROM PUBLIC;
GRANT SELECT ON public.featured_partners TO anon, authenticated;

-- Re-add a narrow public RLS policy on the base table restricted to the safe
-- read path (needed because security_invoker view enforces caller's RLS).
CREATE POLICY "Public can view featured partner marketing fields"
ON public.partners
FOR SELECT
TO anon, authenticated
USING (is_featured = true AND is_active = true);

-- Column-level hardening: revoke access to sensitive columns from anon so even
-- a direct query to public.partners cannot return them.
REVOKE SELECT ON public.partners FROM anon;
GRANT SELECT (
  id, display_name, logo_url, tagline, bio, verticals, website_url,
  partner_type, certification_level, is_featured, is_active
) ON public.partners TO anon;

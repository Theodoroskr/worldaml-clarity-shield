
DROP POLICY IF EXISTS "Public can view featured partner marketing fields" ON public.partners;
REVOKE SELECT ON public.partners FROM anon;

DROP VIEW IF EXISTS public.featured_partners;
CREATE VIEW public.featured_partners
WITH (security_invoker = true) AS
SELECT id, display_name, logo_url, tagline, bio, verticals, website_url, partner_type, certification_level
FROM public.partners
WHERE is_featured = true AND is_active = true;

GRANT SELECT ON public.featured_partners TO anon, authenticated;

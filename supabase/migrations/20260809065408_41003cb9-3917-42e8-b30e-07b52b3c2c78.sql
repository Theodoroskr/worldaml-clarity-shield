-- 1. Additive enum values
ALTER TYPE public.partner_status ADD VALUE IF NOT EXISTS 'more_info';
ALTER TYPE public.partner_status ADD VALUE IF NOT EXISTS 'withdrawn';

-- 2. Additive columns
ALTER TABLE public.partner_applications
  ADD COLUMN IF NOT EXISTS review_message text,
  ADD COLUMN IF NOT EXISTS internal_notes text,
  ADD COLUMN IF NOT EXISTS approved_partner_type public.partner_type,
  ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES public.partners(id) ON DELETE SET NULL;

ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS portal_access text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS partner_since timestamptz,
  ADD COLUMN IF NOT EXISTS internal_notes text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'partners_portal_access_chk'
  ) THEN
    ALTER TABLE public.partners
      ADD CONSTRAINT partners_portal_access_chk
      CHECK (portal_access IN ('not_granted','invitation_pending','active','suspended','revoked'));
  END IF;
END $$;

-- 3. Backfill without changing anyone's effective access
UPDATE public.partners SET portal_access = CASE WHEN is_active THEN 'active' ELSE 'suspended' END
WHERE portal_access IS NULL OR portal_access = 'active';
UPDATE public.partners SET partner_since = created_at WHERE partner_since IS NULL;

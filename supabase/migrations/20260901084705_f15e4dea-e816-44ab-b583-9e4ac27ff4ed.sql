ALTER TABLE public.business_accounts
  ADD COLUMN IF NOT EXISTS organisation_id uuid,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

CREATE INDEX IF NOT EXISTS business_accounts_organisation_id_idx
  ON public.business_accounts (organisation_id);

UPDATE public.business_accounts ba
SET organisation_id = sub.organization_id
FROM (
  SELECT DISTINCT ON (user_id) user_id, organization_id
  FROM public.suite_org_members
  ORDER BY user_id, created_at ASC
) sub
WHERE ba.user_id = sub.user_id
  AND ba.organisation_id IS NULL;

UPDATE public.business_accounts ba
SET organisation_id = sub.organisation_id
FROM (
  SELECT DISTINCT ON (user_id) user_id, organisation_id
  FROM public.product_members
  WHERE user_id IS NOT NULL
  ORDER BY user_id, created_at ASC
) sub
WHERE ba.user_id = sub.user_id
  AND ba.organisation_id IS NULL;

UPDATE public.business_accounts ba
SET stripe_customer_id = s.stripe_customer_id
FROM public.screening_subscriptions s
WHERE s.organisation_id = ba.organisation_id
  AND s.stripe_customer_id IS NOT NULL
  AND ba.stripe_customer_id IS NULL;
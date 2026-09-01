UPDATE public.business_accounts ba
SET organisation_id = pm.organisation_id
FROM (
  SELECT DISTINCT ON (user_id) user_id, organisation_id
  FROM public.product_members
  ORDER BY user_id, created_at
) pm
WHERE ba.organisation_id IS NULL
  AND pm.user_id = ba.user_id;
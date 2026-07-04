
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS marketing_opt_out_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.is_eligible_for_sales_outreach(_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p RECORD;
BEGIN
  SELECT user_id, status, subscription_tier, marketing_consent, marketing_opt_out_at, created_at, email
  INTO p
  FROM public.profiles
  WHERE user_id = _user_id;

  IF p IS NULL THEN
    RETURN jsonb_build_object('eligible', false, 'reason', 'user_not_found');
  END IF;

  IF p.marketing_opt_out_at IS NOT NULL THEN
    RETURN jsonb_build_object('eligible', false, 'reason', 'opted_out',
      'opted_out_at', p.marketing_opt_out_at);
  END IF;

  IF p.marketing_consent = true THEN
    RETURN jsonb_build_object('eligible', true, 'basis', 'explicit_consent');
  END IF;

  -- Legitimate interest fallback:
  -- approved account older than 30 days, not already a paying Suite/Enterprise user
  IF p.status = 'approved'
     AND p.created_at <= now() - INTERVAL '30 days'
     AND COALESCE(p.subscription_tier, 'free') NOT IN ('suite', 'enterprise') THEN
    RETURN jsonb_build_object('eligible', true, 'basis', 'legitimate_interest');
  END IF;

  RETURN jsonb_build_object('eligible', false, 'reason',
    CASE
      WHEN p.status <> 'approved' THEN 'account_not_approved'
      WHEN p.created_at > now() - INTERVAL '30 days' THEN 'account_too_new'
      WHEN p.subscription_tier IN ('suite', 'enterprise') THEN 'already_customer'
      ELSE 'not_eligible'
    END);
END;
$$;

REVOKE ALL ON FUNCTION public.is_eligible_for_sales_outreach(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_eligible_for_sales_outreach(UUID) TO authenticated, service_role;

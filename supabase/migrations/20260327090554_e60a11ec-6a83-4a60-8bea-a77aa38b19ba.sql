
-- Fix overly permissive INSERT on referrals - restrict to authenticated or require a valid referral code
DROP POLICY "Anyone can insert referrals" ON public.referrals;

CREATE POLICY "Authenticated users can insert referrals" ON public.referrals
  FOR INSERT TO authenticated
  WITH CHECK (
    referral_code_used IS NOT NULL AND length(trim(referral_code_used)) > 0
    AND partner_id IN (SELECT id FROM public.partners WHERE referral_code = referral_code_used AND is_active = true)
  );

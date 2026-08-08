ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS source text;
CREATE INDEX IF NOT EXISTS referrals_code_email_idx ON public.referrals (referral_code_used, referred_email);
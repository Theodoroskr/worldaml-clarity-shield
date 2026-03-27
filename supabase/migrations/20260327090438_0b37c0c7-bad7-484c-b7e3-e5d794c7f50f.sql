
-- Partner type enum
CREATE TYPE public.partner_type AS ENUM ('referral', 'affiliate', 'reseller');

-- Partner application status enum
CREATE TYPE public.partner_status AS ENUM ('pending', 'approved', 'rejected');

-- Referral status enum
CREATE TYPE public.referral_status AS ENUM ('clicked', 'signed_up', 'converted');

-- Partner applications table
CREATE TABLE public.partner_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name text NOT NULL,
  website text,
  partner_type partner_type NOT NULL DEFAULT 'referral',
  description text,
  status partner_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own applications" ON public.partner_applications
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own applications" ON public.partner_applications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can view all applications" ON public.partner_applications
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update applications" ON public.partner_applications
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Partners table
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  referral_code text UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  partner_type partner_type NOT NULL DEFAULT 'referral',
  commission_rate numeric(5,4) NOT NULL DEFAULT 0.1000,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own record" ON public.partners
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can view all partners" ON public.partners
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert partners" ON public.partners
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update partners" ON public.partners
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
  referred_email text,
  referral_code_used text NOT NULL,
  status referral_status NOT NULL DEFAULT 'clicked',
  conversion_value numeric(12,2),
  commission_earned numeric(12,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  converted_at timestamptz
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all referrals" ON public.referrals
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert referrals" ON public.referrals
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins can update referrals" ON public.referrals
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

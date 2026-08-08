-- 1. Company profile fields
ALTER TABLE public.business_accounts
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS registration_number TEXT,
  ADD COLUMN IF NOT EXISTS vat_number TEXT,
  ADD COLUMN IF NOT EXISTS address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- 2. Team members
CREATE TABLE IF NOT EXISTS public.business_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_account_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  user_id UUID,
  email TEXT NOT NULL,
  full_name TEXT,
  job_title TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'invited',
  products TEXT[] NOT NULL DEFAULT '{}',
  academy_seat BOOLEAN NOT NULL DEFAULT false,
  invited_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_account_id, email)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_members TO authenticated;
GRANT ALL ON public.business_members TO service_role;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;

-- 3. Helper functions (security definer, avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.business_account_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id FROM public.business_accounts WHERE user_id = _user_id
  UNION
  SELECT business_account_id FROM public.business_members
   WHERE user_id = _user_id AND status = 'active'
$$;

CREATE OR REPLACE FUNCTION public.is_business_member(_account UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT _account IN (SELECT public.business_account_ids(auth.uid()))
$$;

CREATE OR REPLACE FUNCTION public.is_business_admin(_account UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_accounts b
     WHERE b.id = _account AND b.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.business_members m
     WHERE m.business_account_id = _account
       AND m.user_id = auth.uid()
       AND m.status = 'active'
       AND m.role IN ('business_admin','billing_admin')
  )
$$;

CREATE POLICY "Members view their company team"
ON public.business_members FOR SELECT TO authenticated
USING (public.is_business_member(business_account_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Business admins add team members"
ON public.business_members FOR INSERT TO authenticated
WITH CHECK (public.is_business_admin(business_account_id));

CREATE POLICY "Business admins update team members"
ON public.business_members FOR UPDATE TO authenticated
USING (public.is_business_admin(business_account_id))
WITH CHECK (public.is_business_admin(business_account_id));

CREATE POLICY "Business admins remove team members"
ON public.business_members FOR DELETE TO authenticated
USING (public.is_business_admin(business_account_id));

CREATE TRIGGER update_business_members_updated_at
BEFORE UPDATE ON public.business_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Product entitlements
CREATE TABLE IF NOT EXISTS public.business_entitlements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_account_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  product_key TEXT NOT NULL,
  plan TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  activated_at TIMESTAMPTZ,
  renews_at TIMESTAMPTZ,
  usage_used INTEGER,
  usage_limit INTEGER,
  usage_unit TEXT,
  seats INTEGER,
  stripe_subscription_id TEXT,
  setup_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_account_id, product_key)
);

GRANT SELECT ON public.business_entitlements TO authenticated;
GRANT ALL ON public.business_entitlements TO service_role;
ALTER TABLE public.business_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view their company entitlements"
ON public.business_entitlements FOR SELECT TO authenticated
USING (public.is_business_member(business_account_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage entitlements"
ON public.business_entitlements FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_business_entitlements_updated_at
BEFORE UPDATE ON public.business_entitlements
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Commercial tracking (internal only)
CREATE TABLE IF NOT EXISTS public.business_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_account_id UUID REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  user_id UUID,
  event_type TEXT NOT NULL,
  product_key TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.business_events TO authenticated;
GRANT ALL ON public.business_events TO service_role;
ALTER TABLE public.business_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members log their own business events"
ON public.business_events FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND (business_account_id IS NULL OR public.is_business_member(business_account_id)));

CREATE POLICY "Only internal admins read business events"
ON public.business_events FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_business_events_account ON public.business_events(business_account_id);
CREATE INDEX IF NOT EXISTS idx_business_events_type ON public.business_events(event_type);
CREATE INDEX IF NOT EXISTS idx_business_members_account ON public.business_members(business_account_id);
CREATE INDEX IF NOT EXISTS idx_business_members_user ON public.business_members(user_id);
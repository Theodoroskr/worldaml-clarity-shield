-- 1. DEAL EVENTS
CREATE TABLE public.partner_deal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.deal_registrations(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.partner_deal_events TO authenticated;
GRANT ALL ON public.partner_deal_events TO service_role;
ALTER TABLE public.partner_deal_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners view own deal events" ON public.partner_deal_events FOR SELECT TO authenticated
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Partners insert own deal events" ON public.partner_deal_events FOR INSERT TO authenticated
WITH CHECK (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage deal events" ON public.partner_deal_events FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_partner_deal_events_deal ON public.partner_deal_events(deal_id, created_at DESC);

-- 2. COMMISSION LEDGER
CREATE TABLE public.partner_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  deal_id uuid REFERENCES public.deal_registrations(id) ON DELETE SET NULL,
  referral_id uuid REFERENCES public.referrals(id) ON DELETE SET NULL,
  payout_id uuid REFERENCES public.partner_payouts(id) ON DELETE SET NULL,
  description text,
  currency text NOT NULL DEFAULT 'EUR',
  deal_value_cents bigint NOT NULL DEFAULT 0,
  commission_rate numeric(5,2) NOT NULL DEFAULT 0,
  amount_cents bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  earned_on date NOT NULL DEFAULT current_date,
  approved_at timestamptz,
  paid_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partner_commissions TO authenticated;
GRANT ALL ON public.partner_commissions TO service_role;
ALTER TABLE public.partner_commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners view own commissions" ON public.partner_commissions FOR SELECT TO authenticated
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage commissions" ON public.partner_commissions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_partner_commissions_updated BEFORE UPDATE ON public.partner_commissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.validate_partner_commission_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('pending','approved','paid','rejected','clawback') THEN
    RAISE EXCEPTION 'Invalid commission status: %', NEW.status;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_partner_commissions_status BEFORE INSERT OR UPDATE ON public.partner_commissions
FOR EACH ROW EXECUTE FUNCTION public.validate_partner_commission_status();
CREATE INDEX idx_partner_commissions_partner ON public.partner_commissions(partner_id, status);

-- 3. CERTIFICATION REQUIREMENTS
CREATE TABLE public.partner_certification_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL,
  label text NOT NULL,
  description text,
  required_courses integer NOT NULL DEFAULT 0,
  required_closed_deals integer NOT NULL DEFAULT 0,
  required_revenue_cents bigint NOT NULL DEFAULT 0,
  commission_rate numeric(5,2) NOT NULL DEFAULT 0,
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (level)
);
GRANT SELECT ON public.partner_certification_requirements TO authenticated;
GRANT ALL ON public.partner_certification_requirements TO service_role;
ALTER TABLE public.partner_certification_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read certification requirements" ON public.partner_certification_requirements
FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage certification requirements" ON public.partner_certification_requirements
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_partner_cert_req_updated BEFORE UPDATE ON public.partner_certification_requirements
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. SPECIALISATIONS
CREATE TABLE public.partner_specialisations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  slug text NOT NULL,
  label text NOT NULL,
  status text NOT NULL DEFAULT 'in_progress',
  progress_percent integer NOT NULL DEFAULT 0,
  awarded_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (partner_id, slug)
);
GRANT SELECT ON public.partner_specialisations TO authenticated;
GRANT ALL ON public.partner_specialisations TO service_role;
ALTER TABLE public.partner_specialisations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners view own specialisations" ON public.partner_specialisations FOR SELECT TO authenticated
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage specialisations" ON public.partner_specialisations FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_partner_specialisations_updated BEFORE UPDATE ON public.partner_specialisations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. ACADEMY SEATS
CREATE TABLE public.partner_academy_seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  assigned_email text,
  assigned_name text,
  assigned_user_id uuid,
  status text NOT NULL DEFAULT 'available',
  assigned_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.partner_academy_seats TO authenticated;
GRANT ALL ON public.partner_academy_seats TO service_role;
ALTER TABLE public.partner_academy_seats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners view own seats" ON public.partner_academy_seats FOR SELECT TO authenticated
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Partners assign own seats" ON public.partner_academy_seats FOR UPDATE TO authenticated
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()))
WITH CHECK (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage seats" ON public.partner_academy_seats FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_partner_seats_updated BEFORE UPDATE ON public.partner_academy_seats
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. PARTNER MANAGERS
CREATE TABLE public.partner_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  title text,
  calendar_url text,
  avatar_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partner_managers TO authenticated;
GRANT ALL ON public.partner_managers TO service_role;
ALTER TABLE public.partner_managers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read active managers" ON public.partner_managers FOR SELECT TO authenticated
USING (is_active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage managers" ON public.partner_managers FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_partner_managers_updated BEFORE UPDATE ON public.partner_managers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS partner_manager_id uuid REFERENCES public.partner_managers(id) ON DELETE SET NULL;

-- 7. CO-BRANDING REQUESTS
CREATE TABLE public.partner_cobrand_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  asset_id uuid REFERENCES public.partner_assets(id) ON DELETE SET NULL,
  title text NOT NULL,
  request_type text NOT NULL DEFAULT 'cobrand',
  details text,
  file_path text,
  status text NOT NULL DEFAULT 'pending',
  reviewer_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.partner_cobrand_requests TO authenticated;
GRANT ALL ON public.partner_cobrand_requests TO service_role;
ALTER TABLE public.partner_cobrand_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners view own cobrand requests" ON public.partner_cobrand_requests FOR SELECT TO authenticated
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Partners create own cobrand requests" ON public.partner_cobrand_requests FOR INSERT TO authenticated
WITH CHECK (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage cobrand requests" ON public.partner_cobrand_requests FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_partner_cobrand_updated BEFORE UPDATE ON public.partner_cobrand_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
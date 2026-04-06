
-- suite_customers
CREATE TABLE public.suite_customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'individual' CHECK (type IN ('individual', 'business')),
  name TEXT NOT NULL,
  email TEXT,
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'in_review', 'verified', 'rejected')),
  country TEXT,
  date_of_birth DATE,
  company_name TEXT,
  registration_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.suite_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customers" ON public.suite_customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own customers" ON public.suite_customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own customers" ON public.suite_customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own customers" ON public.suite_customers FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_suite_customers_updated_at BEFORE UPDATE ON public.suite_customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- suite_screenings
CREATE TABLE public.suite_screenings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.suite_customers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  screening_type TEXT NOT NULL DEFAULT 'sanctions' CHECK (screening_type IN ('sanctions', 'pep', 'adverse_media')),
  result TEXT NOT NULL DEFAULT 'clear' CHECK (result IN ('clear', 'potential_match', 'confirmed_match')),
  match_count INT NOT NULL DEFAULT 0,
  screened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.suite_screenings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own screenings" ON public.suite_screenings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own screenings" ON public.suite_screenings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- suite_alerts
CREATE TABLE public.suite_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.suite_customers(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL DEFAULT 'screening' CHECK (alert_type IN ('screening', 'transaction', 'risk', 'document', 'system')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'escalated', 'closed')),
  assigned_to UUID,
  title TEXT NOT NULL,
  description TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.suite_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts" ON public.suite_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alerts" ON public.suite_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON public.suite_alerts FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_suite_alerts_updated_at BEFORE UPDATE ON public.suite_alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- suite_audit_log (immutable)
CREATE TABLE public.suite_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.suite_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs" ON public.suite_audit_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own audit logs" ON public.suite_audit_log FOR INSERT WITH CHECK (auth.uid() = user_id);

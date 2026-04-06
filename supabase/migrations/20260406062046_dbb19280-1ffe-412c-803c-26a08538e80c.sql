
-- suite_transactions
CREATE TABLE public.suite_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.suite_customers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  direction TEXT NOT NULL DEFAULT 'inbound' CHECK (direction IN ('inbound', 'outbound')),
  counterparty TEXT,
  counterparty_country TEXT,
  risk_flag BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.suite_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.suite_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.suite_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- suite_cases
CREATE TABLE public.suite_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID REFERENCES public.suite_alerts(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.suite_customers(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'sar_filed', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to TEXT,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.suite_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own cases" ON public.suite_cases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cases" ON public.suite_cases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cases" ON public.suite_cases FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_suite_cases_updated_at BEFORE UPDATE ON public.suite_cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- suite_case_notes
CREATE TABLE public.suite_case_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.suite_cases(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.suite_case_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own case notes" ON public.suite_case_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own case notes" ON public.suite_case_notes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- suite_alert_rules
CREATE TABLE public.suite_alert_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.suite_alert_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own alert rules" ON public.suite_alert_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alert rules" ON public.suite_alert_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alert rules" ON public.suite_alert_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own alert rules" ON public.suite_alert_rules FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_suite_alert_rules_updated_at BEFORE UPDATE ON public.suite_alert_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- suite_ubo
CREATE TABLE public.suite_ubo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.suite_customers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  ownership_pct NUMERIC NOT NULL DEFAULT 0,
  nationality TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.suite_ubo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ubos" ON public.suite_ubo FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ubos" ON public.suite_ubo FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ubos" ON public.suite_ubo FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ubos" ON public.suite_ubo FOR DELETE USING (auth.uid() = user_id);

-- suite_idv_sessions
CREATE TABLE public.suite_idv_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.suite_customers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed', 'manual_check')),
  document_type TEXT,
  liveness_result TEXT,
  reviewed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.suite_idv_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own idv sessions" ON public.suite_idv_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own idv sessions" ON public.suite_idv_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own idv sessions" ON public.suite_idv_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_suite_idv_sessions_updated_at BEFORE UPDATE ON public.suite_idv_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- Admin Form Templates
CREATE TABLE public.admin_form_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  form_type TEXT NOT NULL DEFAULT 'kyc',
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_form_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage form templates" ON public.admin_form_templates FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can view active templates" ON public.admin_form_templates FOR SELECT TO authenticated USING (is_active = true);

-- Admin Form Submissions
CREATE TABLE public.admin_form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.admin_form_templates(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.suite_customers(id) ON DELETE SET NULL,
  submitted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_form_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage form submissions" ON public.admin_form_submissions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own submissions" ON public.admin_form_submissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submissions" ON public.admin_form_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Admin Workflows
CREATE TABLE public.admin_workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  trigger_type TEXT NOT NULL DEFAULT 'manual',
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage workflows" ON public.admin_workflows FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admin Workflow Executions
CREATE TABLE public.admin_workflow_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.admin_workflows(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  status TEXT NOT NULL DEFAULT 'running',
  execution_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  user_id UUID NOT NULL
);
ALTER TABLE public.admin_workflow_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage workflow executions" ON public.admin_workflow_executions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admin Subscription Tiers
CREATE TABLE public.admin_subscription_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  monthly_price_cents INTEGER NOT NULL DEFAULT 0,
  stripe_price_id TEXT,
  max_customers INTEGER NOT NULL DEFAULT 100,
  max_screenings_per_month INTEGER NOT NULL DEFAULT 500,
  max_api_requests_per_day INTEGER NOT NULL DEFAULT 1000,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_subscription_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage subscription tiers" ON public.admin_subscription_tiers FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can view active tiers" ON public.admin_subscription_tiers FOR SELECT TO authenticated USING (is_active = true);

-- Admin User Subscriptions
CREATE TABLE public.admin_user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tier_id UUID NOT NULL REFERENCES public.admin_subscription_tiers(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage user subscriptions" ON public.admin_user_subscriptions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own subscription" ON public.admin_user_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_admin_form_templates_updated_at BEFORE UPDATE ON public.admin_form_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_workflows_updated_at BEFORE UPDATE ON public.admin_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

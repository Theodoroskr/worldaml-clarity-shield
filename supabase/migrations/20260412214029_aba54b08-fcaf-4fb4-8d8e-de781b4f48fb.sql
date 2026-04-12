
-- Create enum
CREATE TYPE public.org_member_role AS ENUM ('admin', 'mlro', 'compliance_officer', 'analyst', 'viewer');

-- Organizations table
CREATE TABLE public.suite_organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  registration_number TEXT,
  country TEXT,
  industry TEXT,
  website TEXT,
  address TEXT,
  regulator TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'suite',
  max_users INTEGER NOT NULL DEFAULT 5,
  max_screenings_per_month INTEGER NOT NULL DEFAULT 500,
  max_api_requests_per_day INTEGER NOT NULL DEFAULT 1000,
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.suite_organizations ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_suite_organizations_updated_at
  BEFORE UPDATE ON public.suite_organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Members table
CREATE TABLE public.suite_org_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.suite_organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role org_member_role NOT NULL DEFAULT 'analyst',
  invited_email TEXT,
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE public.suite_org_members ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage organizations"
  ON public.suite_organizations FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Members can view own organization"
  ON public.suite_organizations FOR SELECT TO authenticated
  USING (id IN (SELECT organization_id FROM public.suite_org_members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage org members"
  ON public.suite_org_members FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Members can view org members"
  ON public.suite_org_members FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.suite_org_members som WHERE som.user_id = auth.uid()));

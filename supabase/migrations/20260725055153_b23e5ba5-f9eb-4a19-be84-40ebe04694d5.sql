-- 1. Table
CREATE TABLE public.suite_onboarding_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.suite_organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  branding JSONB NOT NULL DEFAULT jsonb_build_object(
    'logo_url', NULL,
    'primary_color', '#0f766e',
    'company_name', NULL,
    'support_email', NULL,
    'show_powered_by', true
  ),
  schema JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_checks JSONB NOT NULL DEFAULT jsonb_build_object(
    'kyc', false,
    'kyb', false,
    'sof', false,
    'documents', '[]'::jsonb
  ),
  redirect_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, slug)
);

-- 2. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suite_onboarding_forms TO authenticated;
GRANT ALL ON public.suite_onboarding_forms TO service_role;

-- 3. RLS
ALTER TABLE public.suite_onboarding_forms ENABLE ROW LEVEL SECURITY;

-- 4. Policies
CREATE POLICY "org members can view their onboarding forms"
  ON public.suite_onboarding_forms
  FOR SELECT
  TO authenticated
  USING (
    organisation_id IN (SELECT public.get_user_org_ids(auth.uid()))
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "compliance staff can create onboarding forms"
  ON public.suite_onboarding_forms
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (
        SELECT 1 FROM public.suite_org_members m
        WHERE m.organization_id = organisation_id
          AND m.user_id = auth.uid()
          AND m.role IN ('admin','mlro','compliance_officer')
      )
    )
  );

CREATE POLICY "compliance staff can update onboarding forms"
  ON public.suite_onboarding_forms
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.suite_org_members m
      WHERE m.organization_id = organisation_id
        AND m.user_id = auth.uid()
        AND m.role IN ('admin','mlro','compliance_officer')
    )
  );

CREATE POLICY "compliance staff can delete onboarding forms"
  ON public.suite_onboarding_forms
  FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.suite_org_members m
      WHERE m.organization_id = organisation_id
        AND m.user_id = auth.uid()
        AND m.role IN ('admin','mlro','compliance_officer')
    )
  );

-- 5. updated_at trigger
CREATE TRIGGER trg_suite_onboarding_forms_updated_at
  BEFORE UPDATE ON public.suite_onboarding_forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Index for tenant listing
CREATE INDEX idx_suite_onboarding_forms_org ON public.suite_onboarding_forms(organisation_id, created_at DESC);
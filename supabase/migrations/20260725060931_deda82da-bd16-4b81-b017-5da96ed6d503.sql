
CREATE TABLE public.suite_onboarding_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.suite_onboarding_forms(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL REFERENCES public.suite_organizations(id) ON DELETE CASCADE,
  applicant_name TEXT,
  applicant_email TEXT,
  applicant_type TEXT NOT NULL DEFAULT 'individual',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewer_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  linked_customer_id UUID REFERENCES public.suite_customers(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_onboarding_submissions_org ON public.suite_onboarding_submissions(organisation_id, submitted_at DESC);
CREATE INDEX idx_onboarding_submissions_form ON public.suite_onboarding_submissions(form_id, submitted_at DESC);
CREATE INDEX idx_onboarding_submissions_status ON public.suite_onboarding_submissions(organisation_id, status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.suite_onboarding_submissions TO authenticated;
GRANT INSERT ON public.suite_onboarding_submissions TO anon;
GRANT ALL ON public.suite_onboarding_submissions TO service_role;

ALTER TABLE public.suite_onboarding_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit against an active form (organisation_id must match the form)
CREATE POLICY "anyone can submit to active onboarding forms"
ON public.suite_onboarding_submissions FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.suite_onboarding_forms f
    WHERE f.id = form_id
      AND f.organisation_id = suite_onboarding_submissions.organisation_id
      AND f.is_active = true
  )
);

-- Org members and admins can view submissions
CREATE POLICY "org members can view submissions"
ON public.suite_onboarding_submissions FOR SELECT
TO authenticated
USING (
  organisation_id IN (SELECT public.get_user_org_ids(auth.uid()))
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- Compliance staff can review (update) submissions
CREATE POLICY "compliance staff can review submissions"
ON public.suite_onboarding_submissions FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
    SELECT 1 FROM public.suite_org_members m
    WHERE m.organization_id = suite_onboarding_submissions.organisation_id
      AND m.user_id = auth.uid()
      AND m.role IN ('admin'::org_member_role, 'mlro'::org_member_role, 'compliance_officer'::org_member_role, 'analyst'::org_member_role)
  )
);

-- Compliance managers can delete
CREATE POLICY "compliance managers can delete submissions"
ON public.suite_onboarding_submissions FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
    SELECT 1 FROM public.suite_org_members m
    WHERE m.organization_id = suite_onboarding_submissions.organisation_id
      AND m.user_id = auth.uid()
      AND m.role IN ('admin'::org_member_role, 'mlro'::org_member_role, 'compliance_officer'::org_member_role)
  )
);

CREATE TRIGGER trg_suite_onboarding_submissions_updated_at
BEFORE UPDATE ON public.suite_onboarding_submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

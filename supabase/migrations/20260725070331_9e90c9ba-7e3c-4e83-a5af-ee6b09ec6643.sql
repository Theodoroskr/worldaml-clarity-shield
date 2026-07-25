
CREATE TABLE public.suite_edd_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.suite_organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.suite_customers(id) ON DELETE SET NULL,
  case_reference TEXT NOT NULL,
  trigger_reason TEXT NOT NULL,
  risk_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  questionnaire JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','evidence_pending','mlro_review','approved','rejected','escalated')),
  requested_by UUID NOT NULL,
  assigned_analyst UUID,
  mlro_id UUID,
  mlro_decision TEXT CHECK (mlro_decision IN ('approved','rejected','escalated')),
  mlro_reason TEXT,
  mlro_signed_at TIMESTAMPTZ,
  submitted_for_review_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.suite_edd_cases TO authenticated;
GRANT ALL ON public.suite_edd_cases TO service_role;
ALTER TABLE public.suite_edd_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read edd cases" ON public.suite_edd_cases
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_edd_cases.organisation_id AND m.user_id = auth.uid()));
CREATE POLICY "org members insert edd cases" ON public.suite_edd_cases
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_edd_cases.organisation_id AND m.user_id = auth.uid()));
CREATE POLICY "org members update edd cases" ON public.suite_edd_cases
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_edd_cases.organisation_id AND m.user_id = auth.uid()));
CREATE POLICY "org admins delete edd cases" ON public.suite_edd_cases
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_edd_cases.organisation_id AND m.user_id = auth.uid() AND m.role = 'admin'));

CREATE TABLE public.suite_edd_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.suite_edd_cases(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL REFERENCES public.suite_organizations(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  evidence_type TEXT NOT NULL,
  description TEXT,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.suite_edd_evidence TO authenticated;
GRANT ALL ON public.suite_edd_evidence TO service_role;
ALTER TABLE public.suite_edd_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read edd evidence" ON public.suite_edd_evidence
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_edd_evidence.organisation_id AND m.user_id = auth.uid()));
CREATE POLICY "org members insert edd evidence" ON public.suite_edd_evidence
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_edd_evidence.organisation_id AND m.user_id = auth.uid()));
CREATE POLICY "uploader deletes edd evidence" ON public.suite_edd_evidence
  FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid() OR EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_edd_evidence.organisation_id AND m.user_id = auth.uid() AND m.role = 'admin'));

CREATE TABLE public.suite_edd_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.suite_edd_cases(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL REFERENCES public.suite_organizations(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.suite_edd_audit TO authenticated;
GRANT ALL ON public.suite_edd_audit TO service_role;
ALTER TABLE public.suite_edd_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members read edd audit" ON public.suite_edd_audit
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_edd_audit.organisation_id AND m.user_id = auth.uid()));
CREATE POLICY "org members insert edd audit" ON public.suite_edd_audit
  FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() AND EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_edd_audit.organisation_id AND m.user_id = auth.uid()));

CREATE TRIGGER suite_edd_cases_updated_at
  BEFORE UPDATE ON public.suite_edd_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.log_edd_case_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.suite_edd_audit (case_id, organisation_id, actor_id, action, details)
    VALUES (NEW.id, NEW.organisation_id, COALESCE(auth.uid(), NEW.requested_by), 'case_created',
      jsonb_build_object('reference', NEW.case_reference, 'trigger', NEW.trigger_reason));
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.suite_edd_audit (case_id, organisation_id, actor_id, action, details)
    VALUES (NEW.id, NEW.organisation_id, COALESCE(auth.uid(), NEW.requested_by), 'status_changed',
      jsonb_build_object('from', OLD.status, 'to', NEW.status, 'mlro_decision', NEW.mlro_decision, 'mlro_reason', NEW.mlro_reason));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER suite_edd_cases_audit
  AFTER INSERT OR UPDATE ON public.suite_edd_cases
  FOR EACH ROW EXECUTE FUNCTION public.log_edd_case_change();

CREATE INDEX idx_suite_edd_cases_org ON public.suite_edd_cases(organisation_id, status);
CREATE INDEX idx_suite_edd_cases_customer ON public.suite_edd_cases(customer_id);
CREATE INDEX idx_suite_edd_evidence_case ON public.suite_edd_evidence(case_id);
CREATE INDEX idx_suite_edd_audit_case ON public.suite_edd_audit(case_id, created_at DESC);

CREATE POLICY "org members read edd evidence files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'edd-evidence' AND EXISTS (
    SELECT 1 FROM public.suite_org_members m
    WHERE m.user_id = auth.uid() AND (storage.foldername(name))[1] = m.organization_id::text
  ));
CREATE POLICY "org members upload edd evidence files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'edd-evidence' AND EXISTS (
    SELECT 1 FROM public.suite_org_members m
    WHERE m.user_id = auth.uid() AND (storage.foldername(name))[1] = m.organization_id::text
  ));
CREATE POLICY "uploader deletes edd evidence files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'edd-evidence' AND owner = auth.uid());

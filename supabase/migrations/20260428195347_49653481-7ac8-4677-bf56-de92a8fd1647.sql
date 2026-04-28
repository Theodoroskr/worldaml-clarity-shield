
-- =====================================================
-- WorldAMLSuite RCM module — schema, RLS, demo seed
-- =====================================================

-- Reuse existing org_member_role enum (admin, mlro, compliance_officer, analyst, viewer)

-- ---------- 1. ORGS & MEMBERS ----------
CREATE TABLE public.rcm_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  jurisdiction TEXT,
  regulator TEXT,
  primary_language TEXT NOT NULL DEFAULT 'en',
  supported_languages TEXT[] NOT NULL DEFAULT ARRAY['en'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.rcm_org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.rcm_organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.org_member_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);
CREATE INDEX idx_rcm_org_members_user ON public.rcm_org_members(user_id);

-- Helper: is the caller a member of this RCM org?
CREATE OR REPLACE FUNCTION public.rcm_is_org_member(_org UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.rcm_org_members
    WHERE organization_id = _org AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.rcm_member_role(_org UUID)
RETURNS public.org_member_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.rcm_org_members
  WHERE organization_id = _org AND user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.rcm_can_edit(_org UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.rcm_org_members
    WHERE organization_id = _org AND user_id = auth.uid()
      AND role IN ('admin','mlro','compliance_officer','analyst')
  );
$$;

CREATE OR REPLACE FUNCTION public.rcm_can_manage(_org UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.rcm_org_members
    WHERE organization_id = _org AND user_id = auth.uid()
      AND role IN ('admin','mlro','compliance_officer')
  );
$$;

-- ---------- 2. LOOKUPS ----------
CREATE TABLE public.rcm_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.rcm_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.rcm_jurisdictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.rcm_organizations(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  regulator TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- 3. REGULATORY LIBRARY ----------
CREATE TABLE public.rcm_regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.rcm_organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuing_authority TEXT,
  jurisdiction TEXT,
  sector TEXT,
  regulation_type TEXT,
  effective_date DATE,
  version TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- draft, active, superseded, archived
  original_language TEXT NOT NULL DEFAULT 'en',
  available_languages TEXT[] NOT NULL DEFAULT ARRAY['en'],
  summary TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  document_url TEXT,
  document_name TEXT,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rcm_regulations_org ON public.rcm_regulations(organization_id);

CREATE TABLE public.rcm_regulation_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regulation_id UUID NOT NULL REFERENCES public.rcm_regulations(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.rcm_organizations(id) ON DELETE CASCADE,
  parent_section_id UUID REFERENCES public.rcm_regulation_sections(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL DEFAULT 'article', -- chapter, section, article, clause
  reference TEXT, -- e.g. "Art. 18a"
  title TEXT,
  original_text TEXT,
  ai_summary TEXT,
  human_summary TEXT,
  risk_category TEXT, -- low, medium, high, critical
  obligation_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rcm_sections_reg ON public.rcm_regulation_sections(regulation_id);

CREATE TABLE public.rcm_regulation_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.rcm_regulation_sections(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.rcm_organizations(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  translated_title TEXT,
  translated_text TEXT,
  translated_summary TEXT,
  review_status TEXT NOT NULL DEFAULT 'machine_translated', -- machine_translated, under_review, approved, rejected
  reviewer_id UUID,
  reviewed_at TIMESTAMPTZ,
  reviewer_comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (section_id, language)
);
CREATE INDEX idx_rcm_reg_trans_section ON public.rcm_regulation_translations(section_id);

-- ---------- 4. OBLIGATIONS ----------
CREATE TABLE public.rcm_obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.rcm_organizations(id) ON DELETE CASCADE,
  regulation_id UUID REFERENCES public.rcm_regulations(id) ON DELETE SET NULL,
  section_id UUID REFERENCES public.rcm_regulation_sections(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  jurisdiction TEXT,
  department_id UUID REFERENCES public.rcm_departments(id) ON DELETE SET NULL,
  risk_level TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  obligation_type TEXT NOT NULL DEFAULT 'monitoring',
  frequency TEXT NOT NULL DEFAULT 'one_off',
  compliance_status TEXT NOT NULL DEFAULT 'not_assessed', -- not_assessed, compliant, partial, non_compliant, not_applicable
  deadline DATE,
  comments TEXT,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rcm_obligations_org ON public.rcm_obligations(organization_id);
CREATE INDEX idx_rcm_obligations_reg ON public.rcm_obligations(regulation_id);

CREATE TABLE public.rcm_obligation_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obligation_id UUID NOT NULL REFERENCES public.rcm_obligations(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.rcm_organizations(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  translated_title TEXT,
  translated_description TEXT,
  review_status TEXT NOT NULL DEFAULT 'machine_translated',
  reviewer_id UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (obligation_id, language)
);

-- ---------- 5. CONTROLS ----------
CREATE TABLE public.rcm_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.rcm_organizations(id) ON DELETE CASCADE,
  obligation_id UUID REFERENCES public.rcm_obligations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID,
  department_id UUID REFERENCES public.rcm_departments(id) ON DELETE SET NULL,
  control_type TEXT NOT NULL DEFAULT 'preventive', -- preventive, detective, corrective
  frequency TEXT NOT NULL DEFAULT 'monthly',
  status TEXT NOT NULL DEFAULT 'active',
  testing_result TEXT,
  last_tested_at DATE,
  next_review_at DATE,
  evidence_required TEXT,
  effectiveness TEXT NOT NULL DEFAULT 'not_tested', -- effective, partial, ineffective, not_tested
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rcm_controls_org ON public.rcm_controls(organization_id);

-- ---------- 6. ASSESSMENTS ----------
CREATE TABLE public.rcm_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.rcm_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  regulation_id UUID REFERENCES public.rcm_regulations(id) ON DELETE SET NULL,
  framework TEXT,
  department_id UUID REFERENCES public.rcm_departments(id) ON DELETE SET NULL,
  owner_id UUID,
  reviewer_id UUID,
  due_date DATE,
  period_start DATE,
  period_end DATE,
  status TEXT NOT NULL DEFAULT 'not_started', -- not_started, in_progress, submitted, under_review, approved, rejected
  overall_score INTEGER, -- 0-100
  findings TEXT,
  gaps TEXT,
  required_actions TEXT,
  reviewer_comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rcm_assess_org ON public.rcm_assessments(organization_id);

CREATE TABLE public.rcm_assessment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.rcm_assessments(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.rcm_organizations(id) ON DELETE CASCADE,
  obligation_id UUID REFERENCES public.rcm_obligations(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  answer_type TEXT NOT NULL DEFAULT 'compliance', -- yes_no, compliance, free_text, file_upload, risk_rating
  response TEXT,
  risk_rating TEXT,
  evidence_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- 7. TASKS ----------
CREATE TABLE public.rcm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.rcm_organizations(id) ON DELETE CASCADE,
  obligation_id UUID REFERENCES public.rcm_obligations(id) ON DELETE SET NULL,
  control_id UUID REFERENCES public.rcm_controls(id) ON DELETE SET NULL,
  assessment_id UUID REFERENCES public.rcm_assessments(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.rcm_departments(id) ON DELETE SET NULL,
  assigned_to UUID,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'open', -- open, in_progress, pending_review, completed, overdue, escalated
  escalation_level INTEGER NOT NULL DEFAULT 0,
  comments TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rcm_tasks_org ON public.rcm_tasks(organization_id);

-- ---------- 8. EVIDENCE ----------
CREATE TABLE public.rcm_evidence_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.rcm_organizations(id) ON DELETE CASCADE,
  obligation_id UUID REFERENCES public.rcm_obligations(id) ON DELETE SET NULL,
  control_id UUID REFERENCES public.rcm_controls(id) ON DELETE SET NULL,
  assessment_id UUID REFERENCES public.rcm_assessments(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.rcm_tasks(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size_bytes BIGINT,
  file_path TEXT,
  uploaded_by UUID,
  version INTEGER NOT NULL DEFAULT 1,
  approval_status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- 9. AUDIT, COMMENTS, NOTIFICATIONS ----------
CREATE TABLE public.rcm_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.rcm_organizations(id) ON DELETE CASCADE,
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rcm_audit_org ON public.rcm_audit_logs(organization_id, created_at DESC);

CREATE TABLE public.rcm_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.rcm_organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.rcm_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.rcm_organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- updated_at triggers ----------
CREATE TRIGGER trg_rcm_orgs_updated BEFORE UPDATE ON public.rcm_organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_rcm_regs_updated BEFORE UPDATE ON public.rcm_regulations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_rcm_secs_updated BEFORE UPDATE ON public.rcm_regulation_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_rcm_reg_tr_updated BEFORE UPDATE ON public.rcm_regulation_translations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_rcm_obl_updated BEFORE UPDATE ON public.rcm_obligations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_rcm_ctrl_updated BEFORE UPDATE ON public.rcm_controls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_rcm_assess_updated BEFORE UPDATE ON public.rcm_assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_rcm_tasks_updated BEFORE UPDATE ON public.rcm_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- ENABLE RLS ----------
ALTER TABLE public.rcm_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rcm_org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rcm_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rcm_jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rcm_regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rcm_regulation_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rcm_regulation_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rcm_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rcm_obligation_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rcm_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rcm_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rcm_assessment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rcm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rcm_evidence_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rcm_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rcm_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rcm_notifications ENABLE ROW LEVEL SECURITY;

-- ---------- POLICIES ----------
-- rcm_organizations: members can view; only their members can update; admins of an org can delete; anyone authenticated can create (becomes admin).
CREATE POLICY "members_view_org" ON public.rcm_organizations FOR SELECT TO authenticated
  USING (public.rcm_is_org_member(id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "auth_create_org" ON public.rcm_organizations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "managers_update_org" ON public.rcm_organizations FOR UPDATE TO authenticated
  USING (public.rcm_can_manage(id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "managers_delete_org" ON public.rcm_organizations FOR DELETE TO authenticated
  USING (public.rcm_can_manage(id) OR public.has_role(auth.uid(),'admin'));

-- rcm_org_members: members can view; admins manage members; users can self-insert as viewer for the demo org (handled by app code via service role normally — keep INSERT to admins).
CREATE POLICY "members_view_members" ON public.rcm_org_members FOR SELECT TO authenticated
  USING (public.rcm_is_org_member(organization_id) OR user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin_insert_members" ON public.rcm_org_members FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(),'admin')
    OR public.rcm_can_manage(organization_id)
    OR (user_id = auth.uid() AND NOT EXISTS (SELECT 1 FROM public.rcm_org_members WHERE organization_id = rcm_org_members.organization_id))
  );
CREATE POLICY "admin_update_members" ON public.rcm_org_members FOR UPDATE TO authenticated
  USING (public.rcm_can_manage(organization_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin_delete_members" ON public.rcm_org_members FOR DELETE TO authenticated
  USING (public.rcm_can_manage(organization_id) OR public.has_role(auth.uid(),'admin'));

-- Generic helper: org-scoped read for members, write for editors, manage for managers
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'rcm_departments','rcm_jurisdictions',
    'rcm_regulations','rcm_regulation_sections','rcm_regulation_translations',
    'rcm_obligations','rcm_obligation_translations',
    'rcm_controls','rcm_assessments','rcm_assessment_items',
    'rcm_tasks','rcm_evidence_files','rcm_comments','rcm_notifications'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format($f$
      CREATE POLICY "members_select_%1$s" ON public.%1$I FOR SELECT TO authenticated
        USING (public.rcm_is_org_member(organization_id) OR public.has_role(auth.uid(),'admin'));
      CREATE POLICY "editors_insert_%1$s" ON public.%1$I FOR INSERT TO authenticated
        WITH CHECK (public.rcm_can_edit(organization_id) OR public.has_role(auth.uid(),'admin'));
      CREATE POLICY "editors_update_%1$s" ON public.%1$I FOR UPDATE TO authenticated
        USING (public.rcm_can_edit(organization_id) OR public.has_role(auth.uid(),'admin'));
      CREATE POLICY "managers_delete_%1$s" ON public.%1$I FOR DELETE TO authenticated
        USING (public.rcm_can_manage(organization_id) OR public.has_role(auth.uid(),'admin'));
    $f$, t);
  END LOOP;
END $$;

-- Audit logs: members read; insert by any member; no update/delete
CREATE POLICY "members_select_audit" ON public.rcm_audit_logs FOR SELECT TO authenticated
  USING (public.rcm_is_org_member(organization_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "members_insert_audit" ON public.rcm_audit_logs FOR INSERT TO authenticated
  WITH CHECK (public.rcm_is_org_member(organization_id));

-- ---------- DEMO SEED: Region Trade Bank ----------
DO $$
DECLARE
  v_org UUID;
  v_dept_compliance UUID;
  v_dept_aml UUID;
  v_dept_risk UUID;
  v_reg UUID;
  v_sec1 UUID; v_sec2 UUID; v_sec3 UUID;
  v_obl_cdd UUID; v_obl_edd UUID; v_obl_mon UUID; v_obl_str UUID; v_obl_evi UUID; v_obl_esc UUID;
  v_ctrl_cdd UUID; v_ctrl_sanc UUID; v_ctrl_tm UUID; v_ctrl_amlrev UUID; v_ctrl_str UUID;
  v_assess UUID;
BEGIN
  INSERT INTO public.rcm_organizations (name, slug, jurisdiction, regulator, primary_language, supported_languages)
  VALUES ('Region Trade Bank', 'region-trade-bank', 'Iraq', 'Central Bank of Iraq', 'en', ARRAY['en','ar'])
  RETURNING id INTO v_org;

  INSERT INTO public.rcm_departments (organization_id, name) VALUES
    (v_org,'Compliance') RETURNING id INTO v_dept_compliance;
  INSERT INTO public.rcm_departments (organization_id, name) VALUES
    (v_org,'AML') RETURNING id INTO v_dept_aml;
  INSERT INTO public.rcm_departments (organization_id, name) VALUES
    (v_org,'Risk') RETURNING id INTO v_dept_risk;
  INSERT INTO public.rcm_departments (organization_id, name) VALUES
    (v_org,'IT'),
    (v_org,'Operations'),
    (v_org,'Internal Audit');

  INSERT INTO public.rcm_jurisdictions (organization_id, country_code, country_name, regulator)
  VALUES (v_org,'IQ','Iraq','Central Bank of Iraq');

  INSERT INTO public.rcm_regulations (organization_id, title, issuing_authority, jurisdiction, sector, regulation_type, effective_date, version, status, original_language, available_languages, summary, tags)
  VALUES (v_org,
    'Central Bank of Iraq AML/CFT Compliance Requirements',
    'Central Bank of Iraq',
    'Iraq',
    'Banking',
    'AML/CFT',
    '2023-01-01',
    '1.0',
    'active',
    'en',
    ARRAY['en','ar'],
    'AML/CFT compliance requirements for licensed banks and financial institutions operating in Iraq. Covers CDD, EDD, transaction monitoring, STR filing and recordkeeping.',
    ARRAY['aml','cft','cdd','edd']
  ) RETURNING id INTO v_reg;

  INSERT INTO public.rcm_regulation_sections (regulation_id, organization_id, section_type, reference, title, original_text, ai_summary, risk_category, sort_order)
  VALUES
    (v_reg, v_org, 'article', 'Art. 5', 'Customer Due Diligence',
      'Licensed institutions shall conduct customer due diligence procedures including identification, verification and beneficial ownership establishment for all new customer relationships and one-off transactions above the threshold.',
      'CDD required for all new customers and threshold transactions; covers ID, verification and UBO.',
      'high', 1)
    RETURNING id INTO v_sec1;
  INSERT INTO public.rcm_regulation_sections (regulation_id, organization_id, section_type, reference, title, original_text, ai_summary, risk_category, sort_order)
  VALUES
    (v_reg, v_org, 'article', 'Art. 7', 'Enhanced Due Diligence',
      'Enhanced due diligence shall be applied to politically exposed persons, customers from high-risk jurisdictions and customers presenting an elevated AML/CFT risk.',
      'EDD mandatory for PEPs, high-risk geographies, elevated-risk customers.',
      'critical', 2)
    RETURNING id INTO v_sec2;
  INSERT INTO public.rcm_regulation_sections (regulation_id, organization_id, section_type, reference, title, original_text, ai_summary, risk_category, sort_order)
  VALUES
    (v_reg, v_org, 'article', 'Art. 12', 'Suspicious Transaction Reporting',
      'Institutions must report suspicious transactions to the Money Laundering Reporting Office without delay, and in any event within the regulatory deadline.',
      'STR filing obligation to MLRO within deadline.',
      'high', 3)
    RETURNING id INTO v_sec3;

  -- Arabic translations (machine_translated, awaiting review)
  INSERT INTO public.rcm_regulation_translations (section_id, organization_id, language, translated_title, translated_text, translated_summary, review_status)
  VALUES
    (v_sec1, v_org, 'ar', 'العناية الواجبة تجاه العملاء',
     'يجب على المؤسسات المرخصة تنفيذ إجراءات العناية الواجبة تجاه العملاء بما في ذلك التحديد والتحقق وإثبات المستفيد الحقيقي لجميع علاقات العملاء الجديدة والمعاملات لمرة واحدة التي تتجاوز الحد المقرر.',
     'يلزم تطبيق العناية الواجبة لجميع العملاء الجدد والمعاملات التي تتجاوز الحد، ويشمل ذلك الهوية والتحقق والمستفيد الحقيقي.',
     'machine_translated'),
    (v_sec2, v_org, 'ar', 'العناية الواجبة المعززة',
     'يجب تطبيق العناية الواجبة المعززة على الأشخاص المعرضين سياسياً والعملاء من الولايات القضائية عالية المخاطر والعملاء الذين يمثلون مخاطر مرتفعة لمكافحة غسل الأموال وتمويل الإرهاب.',
     'العناية الواجبة المعززة إلزامية للأشخاص المعرضين سياسياً والمناطق عالية المخاطر.',
     'machine_translated'),
    (v_sec3, v_org, 'ar', 'الإبلاغ عن المعاملات المشبوهة',
     'يجب على المؤسسات الإبلاغ عن المعاملات المشبوهة إلى مكتب الإبلاغ عن غسل الأموال دون تأخير، وبأي حال من الأحوال خلال الموعد النهائي التنظيمي.',
     'الإبلاغ عن المعاملات المشبوهة إلى مكتب الإبلاغ خلال المهلة المحددة.',
     'machine_translated');

  -- Obligations
  INSERT INTO public.rcm_obligations (organization_id, regulation_id, section_id, title, description, jurisdiction, department_id, risk_level, obligation_type, frequency, compliance_status, deadline)
  VALUES
    (v_org, v_reg, v_sec1, 'Maintain customer due diligence procedures',
     'Implement and maintain documented CDD procedures for all new and existing customer relationships.',
     'Iraq', v_dept_aml, 'high', 'customer_due_diligence', 'continuous', 'compliant', NULL)
  RETURNING id INTO v_obl_cdd;
  INSERT INTO public.rcm_obligations (organization_id, regulation_id, section_id, title, description, jurisdiction, department_id, risk_level, obligation_type, frequency, compliance_status, deadline)
  VALUES
    (v_org, v_reg, v_sec2, 'Conduct enhanced due diligence for high-risk customers',
     'Apply EDD measures to PEPs, customers from high-risk jurisdictions and elevated-risk relationships.',
     'Iraq', v_dept_aml, 'critical', 'enhanced_due_diligence', 'continuous', 'partial', NULL)
  RETURNING id INTO v_obl_edd;
  INSERT INTO public.rcm_obligations (organization_id, regulation_id, section_id, title, description, jurisdiction, department_id, risk_level, obligation_type, frequency, compliance_status, deadline)
  VALUES
    (v_org, v_reg, v_sec3, 'Monitor suspicious transactions',
     'Operate a transaction monitoring system to identify potentially suspicious activity.',
     'Iraq', v_dept_aml, 'high', 'monitoring', 'daily', 'compliant', NULL)
  RETURNING id INTO v_obl_mon;
  INSERT INTO public.rcm_obligations (organization_id, regulation_id, section_id, title, description, jurisdiction, department_id, risk_level, obligation_type, frequency, compliance_status, deadline)
  VALUES
    (v_org, v_reg, v_sec3, 'Report suspicious activity to the relevant authority',
     'File STRs to the Money Laundering Reporting Office without delay.',
     'Iraq', v_dept_aml, 'critical', 'reporting', 'event_driven', 'non_compliant', (CURRENT_DATE - INTERVAL '5 days')::DATE)
  RETURNING id INTO v_obl_str;
  INSERT INTO public.rcm_obligations (organization_id, regulation_id, title, description, jurisdiction, department_id, risk_level, obligation_type, frequency, compliance_status)
  VALUES
    (v_org, v_reg, 'Maintain compliance evidence and audit records',
     'Retain compliance evidence and audit records for the regulatory minimum period.',
     'Iraq', v_dept_compliance, 'medium', 'governance', 'continuous', 'compliant')
  RETURNING id INTO v_obl_evi;
  INSERT INTO public.rcm_obligations (organization_id, regulation_id, title, description, jurisdiction, department_id, risk_level, obligation_type, frequency, compliance_status)
  VALUES
    (v_org, v_reg, 'Escalate high-risk findings to Compliance Department',
     'Establish escalation paths for high-risk findings identified by business units.',
     'Iraq', v_dept_compliance, 'high', 'governance', 'event_driven', 'partial')
  RETURNING id INTO v_obl_esc;

  -- Controls
  INSERT INTO public.rcm_controls (organization_id, obligation_id, name, description, department_id, control_type, frequency, status, effectiveness, last_tested_at, next_review_at)
  VALUES
    (v_org, v_obl_cdd, 'CDD checklist review', 'Quarterly review of CDD checklist completion and quality sampling.', v_dept_aml, 'detective', 'quarterly', 'active', 'effective', CURRENT_DATE - 30, CURRENT_DATE + 60)
  RETURNING id INTO v_ctrl_cdd;
  INSERT INTO public.rcm_controls (organization_id, obligation_id, name, description, department_id, control_type, frequency, status, effectiveness, last_tested_at, next_review_at)
  VALUES
    (v_org, v_obl_edd, 'Sanctions screening check', 'Screen all new customers and ongoing relationships against sanctions and PEP lists.', v_dept_aml, 'preventive', 'daily', 'active', 'effective', CURRENT_DATE - 1, CURRENT_DATE + 1)
  RETURNING id INTO v_ctrl_sanc;
  INSERT INTO public.rcm_controls (organization_id, obligation_id, name, description, department_id, control_type, frequency, status, effectiveness, last_tested_at, next_review_at)
  VALUES
    (v_org, v_obl_mon, 'Transaction monitoring alert review', 'Daily disposition of TM alerts within SLA.', v_dept_aml, 'detective', 'daily', 'active', 'partial', CURRENT_DATE - 2, CURRENT_DATE + 1)
  RETURNING id INTO v_ctrl_tm;
  INSERT INTO public.rcm_controls (organization_id, obligation_id, name, description, department_id, control_type, frequency, status, effectiveness, last_tested_at, next_review_at)
  VALUES
    (v_org, v_obl_evi, 'Monthly AML compliance review', 'Monthly compliance committee review of AML KPIs.', v_dept_compliance, 'detective', 'monthly', 'active', 'effective', CURRENT_DATE - 10, CURRENT_DATE + 20)
  RETURNING id INTO v_ctrl_amlrev;
  INSERT INTO public.rcm_controls (organization_id, obligation_id, name, description, department_id, control_type, frequency, status, effectiveness, last_tested_at, next_review_at)
  VALUES
    (v_org, v_obl_str, 'STR escalation procedure', 'Documented escalation procedure for STR filing within deadline.', v_dept_compliance, 'corrective', 'event_driven', 'active', 'not_tested', NULL, CURRENT_DATE + 14)
  RETURNING id INTO v_ctrl_str;

  -- Sample assessment
  INSERT INTO public.rcm_assessments (organization_id, name, regulation_id, framework, department_id, due_date, period_start, period_end, status, overall_score, findings, gaps)
  VALUES (v_org, 'Q1 2026 AML/CFT Compliance Assessment', v_reg, 'CBI AML/CFT', v_dept_compliance,
    CURRENT_DATE + 30, CURRENT_DATE - 90, CURRENT_DATE, 'in_progress', 72,
    'Most CDD obligations met. Two STRs filed late.',
    'STR escalation SLA breached twice in period. EDD documentation gaps for 3 PEP customers.')
  RETURNING id INTO v_assess;

  INSERT INTO public.rcm_assessment_items (assessment_id, organization_id, obligation_id, question, answer_type, response, sort_order)
  VALUES
    (v_assess, v_org, v_obl_cdd, 'Are documented CDD procedures in place and reviewed annually?', 'compliance', 'compliant', 1),
    (v_assess, v_org, v_obl_edd, 'Is EDD applied consistently to all PEP customers?', 'compliance', 'partial', 2),
    (v_assess, v_org, v_obl_str, 'Are STRs filed within the regulatory deadline?', 'yes_no', 'no', 3),
    (v_assess, v_org, v_obl_mon, 'Is the transaction monitoring system covering all in-scope products?', 'compliance', 'compliant', 4);

  -- Tasks
  INSERT INTO public.rcm_tasks (organization_id, obligation_id, control_id, department_id, title, description, priority, due_date, status, escalation_level)
  VALUES
    (v_org, v_obl_str, v_ctrl_str, v_dept_compliance, 'Investigate late STR filings', 'Two STRs filed late in Q1. Root-cause and remediation plan required.', 'critical', CURRENT_DATE - 2, 'escalated', 1),
    (v_org, v_obl_edd, v_ctrl_sanc, v_dept_aml, 'Refresh PEP EDD documentation for 3 customers', 'EDD packs incomplete for 3 PEP customers identified in Q1 assessment.', 'high', CURRENT_DATE + 7, 'in_progress', 0),
    (v_org, v_obl_mon, v_ctrl_tm, v_dept_aml, 'Tune transaction monitoring scenarios', 'Reduce false positives on cross-border wire scenario.', 'medium', CURRENT_DATE + 30, 'open', 0),
    (v_org, v_obl_evi, v_ctrl_amlrev, v_dept_compliance, 'Prepare board AML compliance pack for next meeting', 'Board pack with KPIs and outstanding gaps.', 'medium', CURRENT_DATE + 14, 'open', 0);

  -- Evidence placeholders
  INSERT INTO public.rcm_evidence_files (organization_id, obligation_id, control_id, file_name, file_type, file_size_bytes, version, approval_status, notes)
  VALUES
    (v_org, v_obl_cdd, v_ctrl_cdd, 'CDD-Procedures-v3.pdf', 'application/pdf', 245000, 3, 'approved', 'Approved by Head of Compliance, Jan 2026.'),
    (v_org, v_obl_evi, v_ctrl_amlrev, 'Q1-2026-AML-KPIs.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 98000, 1, 'pending', 'Awaiting MLRO review.');
END $$;

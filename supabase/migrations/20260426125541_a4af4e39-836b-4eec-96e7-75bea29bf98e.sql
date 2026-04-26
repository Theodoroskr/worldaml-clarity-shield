-- ============================================
-- Source of Funds / Source of Wealth Module
-- ============================================

-- Main declaration table
CREATE TABLE public.suite_sof_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.suite_customers(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES public.suite_organizations(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,

  -- Declared income & wealth
  declared_annual_income NUMERIC(18,2),
  declared_total_wealth NUMERIC(18,2),
  currency TEXT NOT NULL DEFAULT 'EUR',
  source_country TEXT,

  -- Structured source breakdown: [{type, description, amount, percentage}]
  -- types: salary | business | investments | inheritance | sale_of_asset | gift | savings | pension | other
  income_sources JSONB NOT NULL DEFAULT '[]',
  wealth_sources JSONB NOT NULL DEFAULT '[]',

  -- Reviewer workflow
  status TEXT NOT NULL DEFAULT 'draft', -- draft | submitted | under_review | verified | partial | rejected | expired
  reviewer_id UUID,
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,

  -- AI reconciliation
  ai_reconciliation JSONB DEFAULT '{}', -- {declared_inflow, actual_inflow, variance_pct, flags, analysed_at}
  ai_risk_flag BOOLEAN NOT NULL DEFAULT false,

  -- Lifecycle
  submitted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documents linked to a declaration
CREATE TABLE public.suite_sof_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  declaration_id UUID NOT NULL REFERENCES public.suite_sof_declarations(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES public.suite_organizations(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,

  document_type TEXT NOT NULL, -- payslip | tax_return | bank_statement | sale_deed | inheritance_cert | dividend_statement | business_financials | other
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- storage path in customer-documents bucket
  file_size_bytes INTEGER,
  mime_type TEXT,

  verification_status TEXT NOT NULL DEFAULT 'pending', -- pending | verified | rejected | needs_clarification
  verifier_id UUID,
  verifier_notes TEXT,
  verified_at TIMESTAMPTZ,

  -- Optional document metadata: period covered, amount declared in doc, etc.
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_sof_decl_customer ON public.suite_sof_declarations(customer_id);
CREATE INDEX idx_sof_decl_org ON public.suite_sof_declarations(organisation_id);
CREATE INDEX idx_sof_decl_status ON public.suite_sof_declarations(status);
CREATE INDEX idx_sof_decl_expires ON public.suite_sof_declarations(expires_at) WHERE status = 'verified';
CREATE INDEX idx_sof_docs_declaration ON public.suite_sof_documents(declaration_id);

-- Status validators
CREATE OR REPLACE FUNCTION public.validate_sof_declaration_status()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('draft','submitted','under_review','verified','partial','rejected','expired') THEN
    RAISE EXCEPTION 'Invalid SoF declaration status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_sof_document_status()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.verification_status NOT IN ('pending','verified','rejected','needs_clarification') THEN
    RAISE EXCEPTION 'Invalid SoF document status: %', NEW.verification_status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_sof_decl_status
BEFORE INSERT OR UPDATE OF status ON public.suite_sof_declarations
FOR EACH ROW EXECUTE FUNCTION public.validate_sof_declaration_status();

CREATE TRIGGER trg_validate_sof_doc_status
BEFORE INSERT OR UPDATE OF verification_status ON public.suite_sof_documents
FOR EACH ROW EXECUTE FUNCTION public.validate_sof_document_status();

-- Updated_at triggers
CREATE TRIGGER trg_sof_decl_updated_at
BEFORE UPDATE ON public.suite_sof_declarations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_sof_doc_updated_at
BEFORE UPDATE ON public.suite_sof_documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-set submitted_at, reviewed_at, expires_at
CREATE OR REPLACE FUNCTION public.handle_sof_declaration_lifecycle()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status = 'submitted' AND OLD.status = 'draft' THEN
    NEW.submitted_at := now();
  END IF;
  IF NEW.status IN ('verified','partial','rejected') AND OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.reviewed_at := now();
    IF NEW.status = 'verified' AND NEW.expires_at IS NULL THEN
      NEW.expires_at := now() + INTERVAL '12 months';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sof_decl_lifecycle
BEFORE UPDATE ON public.suite_sof_declarations
FOR EACH ROW EXECUTE FUNCTION public.handle_sof_declaration_lifecycle();

-- ============================================
-- RLS
-- ============================================
ALTER TABLE public.suite_sof_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suite_sof_documents ENABLE ROW LEVEL SECURITY;

-- Declarations: org members can view; analyst+ can insert; compliance_officer+ can verify/update
CREATE POLICY "org_members_select_sof_decl"
ON public.suite_sof_declarations FOR SELECT
USING (
  EXISTS (SELECT 1 FROM suite_org_members m
          WHERE m.organization_id = suite_sof_declarations.organisation_id
            AND m.user_id = auth.uid())
  OR user_id = auth.uid()
);

CREATE POLICY "org_members_insert_sof_decl"
ON public.suite_sof_declarations FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND (
    organisation_id IS NULL OR EXISTS (
      SELECT 1 FROM suite_org_members m
      WHERE m.organization_id = suite_sof_declarations.organisation_id
        AND m.user_id = auth.uid()
        AND m.role IN ('admin','mlro','compliance_officer','analyst')
    )
  )
);

CREATE POLICY "org_members_update_sof_decl"
ON public.suite_sof_declarations FOR UPDATE
USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM suite_org_members m
    WHERE m.organization_id = suite_sof_declarations.organisation_id
      AND m.user_id = auth.uid()
      AND m.role IN ('admin','mlro','compliance_officer','analyst')
  )
);

CREATE POLICY "admins_all_sof_decl"
ON public.suite_sof_declarations FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Documents: same pattern
CREATE POLICY "org_members_select_sof_docs"
ON public.suite_sof_documents FOR SELECT
USING (
  EXISTS (SELECT 1 FROM suite_org_members m
          WHERE m.organization_id = suite_sof_documents.organisation_id
            AND m.user_id = auth.uid())
  OR user_id = auth.uid()
);

CREATE POLICY "org_members_insert_sof_docs"
ON public.suite_sof_documents FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND (
    organisation_id IS NULL OR EXISTS (
      SELECT 1 FROM suite_org_members m
      WHERE m.organization_id = suite_sof_documents.organisation_id
        AND m.user_id = auth.uid()
        AND m.role IN ('admin','mlro','compliance_officer','analyst')
    )
  )
);

CREATE POLICY "org_members_update_sof_docs"
ON public.suite_sof_documents FOR UPDATE
USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM suite_org_members m
    WHERE m.organization_id = suite_sof_documents.organisation_id
      AND m.user_id = auth.uid()
      AND m.role IN ('admin','mlro','compliance_officer','analyst')
  )
);

CREATE POLICY "org_members_delete_sof_docs"
ON public.suite_sof_documents FOR DELETE
USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM suite_org_members m
    WHERE m.organization_id = suite_sof_documents.organisation_id
      AND m.user_id = auth.uid()
      AND m.role IN ('admin','mlro','compliance_officer')
  )
);

CREATE POLICY "admins_all_sof_docs"
ON public.suite_sof_documents FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- Storage policies for customer-documents bucket (SoF subfolder)
-- ============================================
CREATE POLICY "Authenticated can upload SoF docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'customer-documents' AND (storage.foldername(name))[1] = 'sof');

CREATE POLICY "Authenticated can read SoF docs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'customer-documents' AND (storage.foldername(name))[1] = 'sof');

CREATE POLICY "Authenticated can delete own SoF docs"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'customer-documents' AND (storage.foldername(name))[1] = 'sof' AND owner = auth.uid());

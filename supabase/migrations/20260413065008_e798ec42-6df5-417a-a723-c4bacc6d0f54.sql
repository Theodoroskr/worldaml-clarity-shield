-- Helper to get current user's primary org_id
CREATE OR REPLACE FUNCTION public.current_user_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT organization_id
  FROM public.suite_org_members
  WHERE user_id = auth.uid()
  ORDER BY created_at ASC
  LIMIT 1;
$$;

-- Add organisation_id column to every suite table

ALTER TABLE public.suite_customers
  ADD COLUMN IF NOT EXISTS organisation_id UUID
    REFERENCES public.suite_organizations(id) ON DELETE CASCADE;

ALTER TABLE public.suite_screenings
  ADD COLUMN IF NOT EXISTS organisation_id UUID
    REFERENCES public.suite_organizations(id) ON DELETE CASCADE;

ALTER TABLE public.suite_alerts
  ADD COLUMN IF NOT EXISTS organisation_id UUID
    REFERENCES public.suite_organizations(id) ON DELETE CASCADE;

ALTER TABLE public.suite_alert_rules
  ADD COLUMN IF NOT EXISTS organisation_id UUID
    REFERENCES public.suite_organizations(id) ON DELETE CASCADE;

ALTER TABLE public.suite_cases
  ADD COLUMN IF NOT EXISTS organisation_id UUID
    REFERENCES public.suite_organizations(id) ON DELETE CASCADE;

ALTER TABLE public.suite_case_notes
  ADD COLUMN IF NOT EXISTS organisation_id UUID
    REFERENCES public.suite_organizations(id) ON DELETE CASCADE;

ALTER TABLE public.suite_transactions
  ADD COLUMN IF NOT EXISTS organisation_id UUID
    REFERENCES public.suite_organizations(id) ON DELETE CASCADE;

ALTER TABLE public.suite_audit_log
  ADD COLUMN IF NOT EXISTS organisation_id UUID
    REFERENCES public.suite_organizations(id) ON DELETE CASCADE;

ALTER TABLE public.suite_idv_sessions
  ADD COLUMN IF NOT EXISTS organisation_id UUID
    REFERENCES public.suite_organizations(id) ON DELETE CASCADE;

ALTER TABLE public.suite_ubo
  ADD COLUMN IF NOT EXISTS organisation_id UUID
    REFERENCES public.suite_organizations(id) ON DELETE CASCADE;

ALTER TABLE public.periodic_reports
  ADD COLUMN IF NOT EXISTS organisation_id UUID
    REFERENCES public.suite_organizations(id) ON DELETE CASCADE;

ALTER TABLE public.str_reports
  ADD COLUMN IF NOT EXISTS organisation_id UUID
    REFERENCES public.suite_organizations(id) ON DELETE CASCADE;

-- Backfill: create one org per existing user and link their rows
DO $$
DECLARE
  rec RECORD;
  new_org_id UUID;
BEGIN
  FOR rec IN
    SELECT DISTINCT user_id FROM public.suite_customers
    WHERE organisation_id IS NULL
  LOOP
    SELECT organization_id INTO new_org_id
    FROM public.suite_org_members
    WHERE user_id = rec.user_id
    ORDER BY created_at ASC
    LIMIT 1;

    IF new_org_id IS NULL THEN
      INSERT INTO public.suite_organizations (
        name, status, subscription_tier,
        max_users, max_screenings_per_month, max_api_requests_per_day,
        created_by
      )
      VALUES (
        COALESCE(
          (SELECT company_name FROM public.profiles WHERE user_id = rec.user_id),
          'My Organisation'
        ),
        'active', 'suite', 10, 1000, 5000,
        rec.user_id
      )
      RETURNING id INTO new_org_id;

      INSERT INTO public.suite_org_members (organization_id, user_id, role)
      VALUES (new_org_id, rec.user_id, 'admin')
      ON CONFLICT DO NOTHING;
    END IF;

    UPDATE public.suite_customers    SET organisation_id = new_org_id WHERE user_id = rec.user_id AND organisation_id IS NULL;
    UPDATE public.suite_screenings   SET organisation_id = new_org_id WHERE user_id = rec.user_id AND organisation_id IS NULL;
    UPDATE public.suite_alerts       SET organisation_id = new_org_id WHERE user_id = rec.user_id AND organisation_id IS NULL;
    UPDATE public.suite_alert_rules  SET organisation_id = new_org_id WHERE user_id = rec.user_id AND organisation_id IS NULL;
    UPDATE public.suite_cases        SET organisation_id = new_org_id WHERE user_id = rec.user_id AND organisation_id IS NULL;
    UPDATE public.suite_case_notes   SET organisation_id = new_org_id WHERE user_id = rec.user_id AND organisation_id IS NULL;
    UPDATE public.suite_transactions SET organisation_id = new_org_id WHERE user_id = rec.user_id AND organisation_id IS NULL;
    UPDATE public.suite_audit_log    SET organisation_id = new_org_id WHERE user_id = rec.user_id AND organisation_id IS NULL;
    UPDATE public.suite_idv_sessions SET organisation_id = new_org_id WHERE user_id = rec.user_id AND organisation_id IS NULL;
    UPDATE public.suite_ubo          SET organisation_id = new_org_id WHERE user_id = rec.user_id AND organisation_id IS NULL;
    UPDATE public.periodic_reports   SET organisation_id = new_org_id WHERE user_id = rec.user_id AND organisation_id IS NULL;
    UPDATE public.str_reports        SET organisation_id = new_org_id WHERE user_id = rec.user_id AND organisation_id IS NULL;
  END LOOP;
END $$;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_suite_customers_org    ON public.suite_customers(organisation_id);
CREATE INDEX IF NOT EXISTS idx_suite_screenings_org   ON public.suite_screenings(organisation_id);
CREATE INDEX IF NOT EXISTS idx_suite_alerts_org       ON public.suite_alerts(organisation_id);
CREATE INDEX IF NOT EXISTS idx_suite_alert_rules_org  ON public.suite_alert_rules(organisation_id);
CREATE INDEX IF NOT EXISTS idx_suite_cases_org        ON public.suite_cases(organisation_id);
CREATE INDEX IF NOT EXISTS idx_suite_transactions_org ON public.suite_transactions(organisation_id);
CREATE INDEX IF NOT EXISTS idx_suite_audit_log_org    ON public.suite_audit_log(organisation_id);

-- Replace RLS policies with org-scoped versions

-- suite_customers
DROP POLICY IF EXISTS "Users can view own customers" ON public.suite_customers;
DROP POLICY IF EXISTS "Users can insert own customers" ON public.suite_customers;
DROP POLICY IF EXISTS "Users can update own customers" ON public.suite_customers;
DROP POLICY IF EXISTS "Users can delete own customers" ON public.suite_customers;

CREATE POLICY "org_members_select_customers" ON public.suite_customers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_customers.organisation_id AND m.user_id = auth.uid())
  );
CREATE POLICY "org_members_insert_customers" ON public.suite_customers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_customers.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro','compliance_officer','analyst'))
  );
CREATE POLICY "org_members_update_customers" ON public.suite_customers
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_customers.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro','compliance_officer','analyst'))
  );
CREATE POLICY "org_members_delete_customers" ON public.suite_customers
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_customers.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro'))
  );

-- suite_screenings
DROP POLICY IF EXISTS "Users can view own screenings" ON public.suite_screenings;
DROP POLICY IF EXISTS "Users can insert own screenings" ON public.suite_screenings;

CREATE POLICY "org_members_select_screenings" ON public.suite_screenings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_screenings.organisation_id AND m.user_id = auth.uid())
  );
CREATE POLICY "org_members_insert_screenings" ON public.suite_screenings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_screenings.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro','compliance_officer','analyst'))
  );

-- suite_alerts
DROP POLICY IF EXISTS "Users can view own alerts" ON public.suite_alerts;
DROP POLICY IF EXISTS "Users can insert own alerts" ON public.suite_alerts;
DROP POLICY IF EXISTS "Users can update own alerts" ON public.suite_alerts;

CREATE POLICY "org_members_select_alerts" ON public.suite_alerts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_alerts.organisation_id AND m.user_id = auth.uid())
  );
CREATE POLICY "org_members_insert_alerts" ON public.suite_alerts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_alerts.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro','compliance_officer','analyst'))
  );
CREATE POLICY "org_members_update_alerts" ON public.suite_alerts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_alerts.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro','compliance_officer','analyst'))
  );

-- suite_alert_rules
DROP POLICY IF EXISTS "Users can view own alert rules" ON public.suite_alert_rules;
DROP POLICY IF EXISTS "Users can insert own alert rules" ON public.suite_alert_rules;
DROP POLICY IF EXISTS "Users can update own alert rules" ON public.suite_alert_rules;
DROP POLICY IF EXISTS "Users can delete own alert rules" ON public.suite_alert_rules;

CREATE POLICY "org_members_select_alert_rules" ON public.suite_alert_rules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_alert_rules.organisation_id AND m.user_id = auth.uid())
  );
CREATE POLICY "org_members_insert_alert_rules" ON public.suite_alert_rules
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_alert_rules.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro','compliance_officer','analyst'))
  );
CREATE POLICY "org_members_update_alert_rules" ON public.suite_alert_rules
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_alert_rules.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro','compliance_officer','analyst'))
  );
CREATE POLICY "org_members_delete_alert_rules" ON public.suite_alert_rules
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_alert_rules.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro'))
  );

-- suite_cases
DROP POLICY IF EXISTS "Users can view own cases" ON public.suite_cases;
DROP POLICY IF EXISTS "Users can insert own cases" ON public.suite_cases;
DROP POLICY IF EXISTS "Users can update own cases" ON public.suite_cases;

CREATE POLICY "org_members_select_cases" ON public.suite_cases
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_cases.organisation_id AND m.user_id = auth.uid())
  );
CREATE POLICY "org_members_insert_cases" ON public.suite_cases
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_cases.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro','compliance_officer','analyst'))
  );
CREATE POLICY "org_members_update_cases" ON public.suite_cases
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_cases.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro','compliance_officer','analyst'))
  );

-- suite_case_notes
DROP POLICY IF EXISTS "Users can view own case notes" ON public.suite_case_notes;
DROP POLICY IF EXISTS "Users can insert own case notes" ON public.suite_case_notes;

CREATE POLICY "org_members_select_case_notes" ON public.suite_case_notes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_case_notes.organisation_id AND m.user_id = auth.uid())
  );
CREATE POLICY "org_members_insert_case_notes" ON public.suite_case_notes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_case_notes.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro','compliance_officer','analyst'))
  );

-- suite_transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.suite_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.suite_transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.suite_transactions;

CREATE POLICY "org_members_select_transactions" ON public.suite_transactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_transactions.organisation_id AND m.user_id = auth.uid())
  );
CREATE POLICY "org_members_insert_transactions" ON public.suite_transactions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_transactions.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro','compliance_officer','analyst'))
  );
CREATE POLICY "org_members_update_transactions" ON public.suite_transactions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_transactions.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro','compliance_officer','analyst'))
  );

-- suite_audit_log
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.suite_audit_log;
DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.suite_audit_log;

CREATE POLICY "org_members_select_audit_log" ON public.suite_audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_audit_log.organisation_id AND m.user_id = auth.uid())
  );
CREATE POLICY "org_members_insert_audit_log" ON public.suite_audit_log
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_audit_log.organisation_id AND m.user_id = auth.uid())
  );

-- suite_idv_sessions
DROP POLICY IF EXISTS "Users can view own idv sessions" ON public.suite_idv_sessions;
DROP POLICY IF EXISTS "Users can insert own idv sessions" ON public.suite_idv_sessions;
DROP POLICY IF EXISTS "Users can update own idv sessions" ON public.suite_idv_sessions;

CREATE POLICY "org_members_select_idv_sessions" ON public.suite_idv_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_idv_sessions.organisation_id AND m.user_id = auth.uid())
  );
CREATE POLICY "org_members_insert_idv_sessions" ON public.suite_idv_sessions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_idv_sessions.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro','compliance_officer','analyst'))
  );
CREATE POLICY "org_members_update_idv_sessions" ON public.suite_idv_sessions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_idv_sessions.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro','compliance_officer','analyst'))
  );

-- suite_ubo
DROP POLICY IF EXISTS "Users can view own ubos" ON public.suite_ubo;
DROP POLICY IF EXISTS "Users can insert own ubos" ON public.suite_ubo;
DROP POLICY IF EXISTS "Users can update own ubos" ON public.suite_ubo;
DROP POLICY IF EXISTS "Users can delete own ubos" ON public.suite_ubo;

CREATE POLICY "org_members_select_ubo" ON public.suite_ubo
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_ubo.organisation_id AND m.user_id = auth.uid())
  );
CREATE POLICY "org_members_insert_ubo" ON public.suite_ubo
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_ubo.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro','compliance_officer','analyst'))
  );
CREATE POLICY "org_members_update_ubo" ON public.suite_ubo
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_ubo.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro','compliance_officer','analyst'))
  );
CREATE POLICY "org_members_delete_ubo" ON public.suite_ubo
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = suite_ubo.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro'))
  );

-- periodic_reports (keep existing user-level policies, add org ones)
CREATE POLICY "org_members_select_periodic_reports" ON public.periodic_reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = periodic_reports.organisation_id AND m.user_id = auth.uid())
  );
CREATE POLICY "org_members_insert_periodic_reports" ON public.periodic_reports
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = periodic_reports.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro','compliance_officer','analyst'))
  );
CREATE POLICY "org_members_update_periodic_reports" ON public.periodic_reports
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = periodic_reports.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro','compliance_officer'))
  );

-- str_reports
CREATE POLICY "org_members_select_str_reports" ON public.str_reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = str_reports.organisation_id AND m.user_id = auth.uid())
  );
CREATE POLICY "org_members_insert_str_reports" ON public.str_reports
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = str_reports.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro','compliance_officer'))
  );
CREATE POLICY "org_members_update_str_reports" ON public.str_reports
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = str_reports.organisation_id AND m.user_id = auth.uid() AND m.role IN ('admin','mlro','compliance_officer'))
  );
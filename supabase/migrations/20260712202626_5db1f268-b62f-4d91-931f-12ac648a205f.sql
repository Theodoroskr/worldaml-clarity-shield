
DROP POLICY IF EXISTS members_insert_audit ON public.rcm_audit_logs;
CREATE POLICY members_insert_audit ON public.rcm_audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (rcm_is_org_member(organization_id) AND user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own searches" ON public.sanctions_searches;

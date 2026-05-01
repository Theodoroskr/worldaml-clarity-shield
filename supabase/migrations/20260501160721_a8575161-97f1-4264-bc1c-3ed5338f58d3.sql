-- Revoke anon EXECUTE from admin functions
REVOKE EXECUTE ON FUNCTION public.admin_grant_suite_access(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_grant_suite_access(text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_revoke_suite_access(text) FROM anon;

-- Revoke anon EXECUTE from internal/trigger functions
REVOKE EXECUTE ON FUNCTION public.auto_score_customer() FROM anon;
REVOKE EXECUTE ON FUNCTION public.auto_score_customer_ar() FROM anon;
REVOKE EXECUTE ON FUNCTION public.calculate_customer_risk_score(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.auto_approve_trusted_domain() FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_sof_declaration_changes() FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_sof_document_changes() FROM anon;
REVOKE EXECUTE ON FUNCTION public.trigger_workflow_new_customer() FROM anon;
REVOKE EXECUTE ON FUNCTION public.trigger_workflow_risk_change() FROM anon;
REVOKE EXECUTE ON FUNCTION public.trigger_workflow_screening_match() FROM anon;
REVOKE EXECUTE ON FUNCTION public.trigger_workflow_transaction_flagged() FROM anon;

-- Revoke anon from authenticated-only business functions
REVOKE EXECUTE ON FUNCTION public.current_user_has_suite_access() FROM anon;
REVOKE EXECUTE ON FUNCTION public.current_user_org_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_org_ids(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.submit_quiz_and_issue_certificate(uuid, jsonb, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.request_str_amendment(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.file_str_amendment(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.academy_question_bank_audit() FROM anon;

-- Also revoke admin functions from regular authenticated users where appropriate
REVOKE EXECUTE ON FUNCTION public.admin_grant_suite_access(text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_grant_suite_access(text, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_revoke_suite_access(text) FROM authenticated;

-- Restrict storage listing on academy-images bucket
DROP POLICY IF EXISTS "Public access to academy images" ON storage.objects;
CREATE POLICY "Public read academy images by path"
ON storage.objects FOR SELECT
USING (bucket_id = 'academy-images' AND (storage.filename(name)) IS NOT NULL);
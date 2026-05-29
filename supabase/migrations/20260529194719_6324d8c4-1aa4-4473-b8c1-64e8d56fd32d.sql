-- 1) academy_questions: stop exposing correct_index to clients.
REVOKE SELECT ON public.academy_questions FROM anon, authenticated;
GRANT SELECT (id, course_id, question, options, explanation, sort_order)
  ON public.academy_questions TO authenticated;

-- 2) auto_approve_domains: restrict SELECT to admins.
DROP POLICY IF EXISTS "Authenticated users can read auto_approve_domains"
  ON public.auto_approve_domains;
CREATE POLICY "Admins can read auto_approve_domains"
  ON public.auto_approve_domains
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3) customer-documents bucket: drop legacy UID-prefix policies.
DROP POLICY IF EXISTS "Users can view own customer documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own customer documents" ON storage.objects;
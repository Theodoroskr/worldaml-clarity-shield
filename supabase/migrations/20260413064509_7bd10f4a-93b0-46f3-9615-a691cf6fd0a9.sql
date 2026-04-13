CREATE POLICY "Admins can view all audit logs"
ON public.suite_audit_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
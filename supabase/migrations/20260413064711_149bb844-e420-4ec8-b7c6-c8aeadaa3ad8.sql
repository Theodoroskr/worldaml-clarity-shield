CREATE POLICY "Admins can view all periodic reports"
ON public.periodic_reports
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
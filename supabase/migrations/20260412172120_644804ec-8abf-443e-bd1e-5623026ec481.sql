
-- Admin can view all alert rules
CREATE POLICY "Admins can view all alert rules"
ON public.suite_alert_rules
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can update all alert rules
CREATE POLICY "Admins can update all alert rules"
ON public.suite_alert_rules
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can delete all alert rules
CREATE POLICY "Admins can delete all alert rules"
ON public.suite_alert_rules
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

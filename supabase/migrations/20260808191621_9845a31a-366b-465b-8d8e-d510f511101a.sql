CREATE POLICY "Admins can delete partners" ON public.partners FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
GRANT DELETE ON public.partners TO authenticated;
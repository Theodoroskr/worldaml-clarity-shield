CREATE POLICY "Business admins update their company account"
ON public.business_accounts
FOR UPDATE
TO authenticated
USING (public.is_business_admin(id))
WITH CHECK (public.is_business_admin(id));

CREATE POLICY "Business members view their company account"
ON public.business_accounts
FOR SELECT
TO authenticated
USING (public.is_business_member(id));
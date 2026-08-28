-- Allow product members (and admins) to read their organisation's product access
DROP POLICY IF EXISTS "Users can read their organisation product access" ON public.product_access;

CREATE POLICY "Users can read their organisation product access"
ON public.product_access
FOR SELECT
TO authenticated
USING (
  organisation_id IN (
    SELECT organization_id FROM public.suite_org_members WHERE user_id = auth.uid()
  )
  OR
  organisation_id IN (
    SELECT organisation_id FROM public.product_members WHERE user_id = auth.uid() AND product = product_access.product
  )
  OR
  public.has_role(auth.uid(), 'admin'::public.app_role)
);
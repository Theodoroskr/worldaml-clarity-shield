
CREATE OR REPLACE FUNCTION public.rcm_is_org_admin(_org uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.rcm_org_members
    WHERE organization_id = _org
      AND user_id = auth.uid()
      AND role = 'admin'::org_member_role
  );
$$;

DROP POLICY IF EXISTS admin_insert_members ON public.rcm_org_members;
DROP POLICY IF EXISTS admin_update_members ON public.rcm_org_members;
DROP POLICY IF EXISTS admin_delete_members ON public.rcm_org_members;

CREATE POLICY admin_insert_members ON public.rcm_org_members
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.rcm_is_org_admin(organization_id)
  );

CREATE POLICY admin_update_members ON public.rcm_org_members
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.rcm_is_org_admin(organization_id)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.rcm_is_org_admin(organization_id)
  );

CREATE POLICY admin_delete_members ON public.rcm_org_members
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.rcm_is_org_admin(organization_id)
  );

-- Fix 1: rcm_org_members tautological INSERT policy
DROP POLICY IF EXISTS "admin_insert_members" ON public.rcm_org_members;

CREATE POLICY "admin_insert_members"
ON public.rcm_org_members
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR rcm_can_manage(organization_id)
  OR (
    user_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.rcm_org_members existing
      WHERE existing.organization_id = rcm_org_members.organization_id
    )
  )
);

-- Fix 2: Remove anonymous read access to auto_approve_domains
DROP POLICY IF EXISTS "Anon can read auto_approve_domains" ON public.auto_approve_domains;
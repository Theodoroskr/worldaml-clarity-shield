-- Require organisation_id for all SoF declarations to remove the
-- "null organisation_id" bypass branch in the SELECT/INSERT policies.
ALTER TABLE public.suite_sof_declarations
  ALTER COLUMN organisation_id SET NOT NULL;

DROP POLICY IF EXISTS org_members_insert_sof_decl ON public.suite_sof_declarations;
CREATE POLICY org_members_insert_sof_decl
ON public.suite_sof_declarations
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.suite_org_members m
    WHERE m.organization_id = suite_sof_declarations.organisation_id
      AND m.user_id = auth.uid()
      AND m.role = ANY (ARRAY['admin'::org_member_role,'mlro'::org_member_role,'compliance_officer'::org_member_role,'analyst'::org_member_role])
  )
);

DROP POLICY IF EXISTS org_members_select_sof_decl ON public.suite_sof_declarations;
CREATE POLICY org_members_select_sof_decl
ON public.suite_sof_declarations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.suite_org_members m
    WHERE m.organization_id = suite_sof_declarations.organisation_id
      AND m.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS org_members_update_sof_decl ON public.suite_sof_declarations;
CREATE POLICY org_members_update_sof_decl
ON public.suite_sof_declarations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.suite_org_members m
    WHERE m.organization_id = suite_sof_declarations.organisation_id
      AND m.user_id = auth.uid()
      AND m.role = ANY (ARRAY['admin'::org_member_role,'mlro'::org_member_role,'compliance_officer'::org_member_role,'analyst'::org_member_role])
  )
);
-- Remove the self-insert escape hatch that let any authenticated user
-- claim admin membership of an orphan RCM organization.
DROP POLICY IF EXISTS "admin_insert_members" ON public.rcm_org_members;

CREATE POLICY "admin_insert_members"
ON public.rcm_org_members
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.rcm_can_manage(organization_id)
);

-- Auto-assign the creator of a new RCM organization as its first admin,
-- so org creation no longer depends on a client-side self-insert.
CREATE OR REPLACE FUNCTION public.rcm_assign_creator_as_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.rcm_org_members (organization_id, user_id, role)
  VALUES (NEW.id, auth.uid(), 'admin'::org_member_role)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_rcm_assign_creator_as_admin ON public.rcm_organizations;
CREATE TRIGGER trg_rcm_assign_creator_as_admin
AFTER INSERT ON public.rcm_organizations
FOR EACH ROW EXECUTE FUNCTION public.rcm_assign_creator_as_admin();
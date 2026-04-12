
-- Drop recursive policies
DROP POLICY IF EXISTS "Members can view org members" ON public.suite_org_members;
DROP POLICY IF EXISTS "Members can view own organization" ON public.suite_organizations;

-- Security definer function to get user's org IDs without triggering RLS
CREATE OR REPLACE FUNCTION public.get_user_org_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.suite_org_members WHERE user_id = _user_id;
$$;

REVOKE EXECUTE ON FUNCTION public.get_user_org_ids FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_org_ids TO authenticated;

-- Recreate policies using the function
CREATE POLICY "Members can view org members"
  ON public.suite_org_members FOR SELECT TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Members can view own organization"
  ON public.suite_organizations FOR SELECT TO authenticated
  USING (id IN (SELECT public.get_user_org_ids(auth.uid())));

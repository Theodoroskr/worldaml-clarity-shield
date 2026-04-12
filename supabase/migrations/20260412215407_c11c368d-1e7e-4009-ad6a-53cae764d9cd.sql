-- Drop the problematic ALL policy and replace with per-command policies
DROP POLICY IF EXISTS "Admins can manage org members" ON public.suite_org_members;

-- Admin INSERT: only checks admin role, no recursion possible
CREATE POLICY "Admins can insert org members"
  ON public.suite_org_members FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin UPDATE
CREATE POLICY "Admins can update org members"
  ON public.suite_org_members FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin DELETE
CREATE POLICY "Admins can delete org members"
  ON public.suite_org_members FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin SELECT: use has_role only, avoid get_user_org_ids for admins
CREATE POLICY "Admins can view all org members"
  ON public.suite_org_members FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
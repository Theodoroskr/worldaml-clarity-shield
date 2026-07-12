
-- 1) sanctions_searches: add a RESTRICTIVE policy so no SELECT path can ever
--    return rows whose user_id is null (anonymous/session-only rows), and so
--    authenticated users can only ever read their own rows. This layers on
--    top of the existing permissive policies (admin + owner) as a safety net,
--    removing any reliance on client-side session_id knowledge.
DROP POLICY IF EXISTS "Restrict sanctions_searches reads to owner or admin" ON public.sanctions_searches;
CREATE POLICY "Restrict sanctions_searches reads to owner or admin"
ON public.sanctions_searches
AS RESTRICTIVE
FOR SELECT
TO public
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- 2) rcm_organizations: guarantee the creator-as-admin trigger cannot be
--    silently bypassed (e.g. via session_replication_role = 'replica').
ALTER TABLE public.rcm_organizations
  ENABLE ALWAYS TRIGGER trg_rcm_assign_creator_as_admin;

COMMENT ON TRIGGER trg_rcm_assign_creator_as_admin ON public.rcm_organizations IS
  'Security-critical: assigns the creating user as admin on INSERT. Do not drop or disable — the rcm_organizations INSERT policy relies on this trigger to prevent orphaned/unowned organizations.';

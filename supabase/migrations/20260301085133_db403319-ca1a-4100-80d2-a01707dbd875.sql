-- Fix 1: Explicitly deny anonymous SELECT on sanctions_searches
-- Defense-in-depth: anon role gets a hard DENY before any permissive policies fire
CREATE POLICY "Deny anonymous access to sanctions searches"
  ON public.sanctions_searches
  FOR SELECT
  TO anon
  USING (false);

-- Fix 2: Explicitly deny anonymous SELECT on user_roles
-- Replaces the implicit "must be authenticated" check with an explicit DENY for anon
CREATE POLICY "Deny anonymous access to user roles"
  ON public.user_roles
  FOR SELECT
  TO anon
  USING (false);

-- Block unauthenticated (public/anon) users from reading user_roles
-- The existing RESTRICTIVE policies already scope authenticated users correctly,
-- but an explicit deny for unauthenticated callers ensures no leakage.
CREATE POLICY "Deny public access to user roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() IS NOT NULL);

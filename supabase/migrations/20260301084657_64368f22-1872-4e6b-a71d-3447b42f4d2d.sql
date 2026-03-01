-- Fix overly permissive INSERT policy on sanctions_searches
-- Previously: WITH CHECK (true) — allows any anonymous insert with no restriction
-- Replaced with: authenticated users may only insert rows where user_id = their own id,
-- AND anonymous sessions may insert rows where user_id IS NULL (session-only rows).

DROP POLICY IF EXISTS "Anyone can log a search" ON public.sanctions_searches;

-- Authenticated users: can only insert rows stamped with their own user_id
CREATE POLICY "Authenticated users can log own searches"
  ON public.sanctions_searches
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Anonymous users: can insert session-only rows where user_id is NULL
CREATE POLICY "Anonymous users can log session searches"
  ON public.sanctions_searches
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

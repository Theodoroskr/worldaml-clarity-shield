-- Function to get RLS audit data
CREATE OR REPLACE FUNCTION public.get_rls_audit()
RETURNS TABLE (
  "table" text,
  rls_enabled boolean,
  policy_name text,
  command text,
  permissive text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    c.relname::text AS "table",
    c.relrowsecurity AS rls_enabled,
    pol.polname::text AS policy_name,
    CASE pol.polcmd
      WHEN 'r' THEN 'SELECT'
      WHEN 'a' THEN 'INSERT'
      WHEN 'w' THEN 'UPDATE'
      WHEN 'd' THEN 'DELETE'
      WHEN '*' THEN 'ALL'
      ELSE pol.polcmd::text
    END AS command,
    CASE pol.polpermissive
      WHEN true THEN 'PERMISSIVE'
      ELSE 'RESTRICTIVE'
    END AS permissive
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  LEFT JOIN pg_policy pol ON pol.polrelid = c.oid
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
  ORDER BY c.relname, pol.polname;
$$;

-- Function to get storage buckets
CREATE OR REPLACE FUNCTION public.get_storage_buckets_audit()
RETURNS TABLE (
  name text,
  public boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'storage'
AS $$
  SELECT b.name::text, b.public
  FROM storage.buckets b
  ORDER BY b.name;
$$;

-- Restrict both to admin role only
REVOKE EXECUTE ON FUNCTION public.get_rls_audit() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_storage_buckets_audit() FROM anon;
CREATE OR REPLACE FUNCTION public.admin_user_activity()
RETURNS TABLE(user_id uuid, last_sign_in_at timestamptz, auth_created_at timestamptz, email_confirmed_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id, u.last_sign_in_at, u.created_at, u.email_confirmed_at
  FROM auth.users u
  WHERE public.has_role(auth.uid(), 'admin');
$$;

REVOKE ALL ON FUNCTION public.admin_user_activity() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_user_activity() TO authenticated;
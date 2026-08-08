DROP FUNCTION IF EXISTS public.admin_list_internal_access();

CREATE FUNCTION public.admin_list_internal_access()
RETURNS TABLE(
  email text,
  user_id uuid,
  full_name text,
  company_name text,
  phone text,
  is_admin boolean,
  access_role text,
  department text,
  status text,
  account_created_at timestamptz,
  admin_since timestamptz,
  invited_at timestamptz,
  accepted_at timestamptz,
  suspended_at timestamptz,
  last_sign_in_at timestamptz,
  granted_by_email text,
  note text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT COALESCE(lower(u.email), i.email) AS email,
           u.id AS user_id,
           (r.user_id IS NOT NULL) AS is_admin,
           i.access_role,
           i.department,
           u.created_at AS account_created_at,
           r.created_at AS admin_since,
           i.created_at AS invited_at,
           i.accepted_at,
           i.suspended_at,
           u.last_sign_in_at,
           i.invited_by,
           i.note
    FROM public.admin_invites i
    LEFT JOIN auth.users u ON lower(u.email) = i.email
    LEFT JOIN public.user_roles r ON r.user_id = u.id AND r.role = 'admin'
    WHERE i.revoked_at IS NULL
    UNION
    SELECT lower(u2.email), u2.id, true, 'full_admin', NULL::text,
           u2.created_at, r2.created_at,
           NULL::timestamptz, NULL::timestamptz, NULL::timestamptz,
           u2.last_sign_in_at, NULL::uuid, NULL::text
    FROM public.user_roles r2
    JOIN auth.users u2 ON u2.id = r2.user_id
    WHERE r2.role = 'admin'
      AND lower(u2.email) NOT IN (SELECT ai.email FROM public.admin_invites ai WHERE ai.revoked_at IS NULL)
  )
  SELECT b.email,
         b.user_id,
         p.full_name,
         p.company_name,
         p.phone,
         b.is_admin,
         COALESCE(b.access_role, 'full_admin'),
         b.department,
         CASE
           WHEN b.suspended_at IS NOT NULL THEN 'suspended'
           WHEN b.is_admin THEN 'active'
           ELSE 'pending'
         END AS status,
         b.account_created_at,
         b.admin_since,
         b.invited_at,
         b.accepted_at,
         b.suspended_at,
         b.last_sign_in_at,
         (SELECT lower(gu.email) FROM auth.users gu WHERE gu.id = b.invited_by) AS granted_by_email,
         b.note
  FROM base b
  LEFT JOIN public.profiles p ON p.user_id = b.user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_internal_access() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_internal_access() TO authenticated;
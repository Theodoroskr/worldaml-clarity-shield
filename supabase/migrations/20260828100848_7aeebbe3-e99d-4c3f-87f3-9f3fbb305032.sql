-- ============================================================
-- Screening Team Management RPCs
-- ============================================================

CREATE OR REPLACE FUNCTION public.screening_team_members()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_org uuid;
  result jsonb;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Find the organisation this user belongs to for screening
  SELECT pm.organisation_id INTO v_org
  FROM public.product_members pm
  WHERE pm.user_id = v_user AND pm.product = 'screening'::public.product_key
  LIMIT 1;

  IF v_org IS NULL THEN
    -- Fallback to suite_org_members for legacy access
  SELECT m.organization_id INTO v_org
    FROM public.suite_org_members m
    WHERE m.user_id = v_user
    LIMIT 1;
  END IF;

  IF v_org IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  SELECT COALESCE(jsonb_agg(x ORDER BY (x->>'created_at') DESC), '[]'::jsonb)
  INTO result
  FROM (
    SELECT jsonb_build_object(
      'user_id', pm.user_id,
      'email', COALESCE(p.email, pm.invited_email),
      'full_name', NULLIF(TRIM(CONCAT(p.first_name, ' ', p.last_name)), ''),
      'job_title', p.job_title,
      'role', pm.role,
      'is_invite', pm.is_invite,
      'created_at', pm.created_at,
      'created_by', pm.created_by
    ) AS x
    FROM public.product_members pm
    LEFT JOIN public.profiles p ON p.user_id = pm.user_id
    WHERE pm.organisation_id = v_org AND pm.product = 'screening'::public.product_key
  ) t;

  RETURN result;
END;
$function$;

REVOKE ALL ON FUNCTION public.screening_team_members() FROM public;
GRANT EXECUTE ON FUNCTION public.screening_team_members() TO authenticated;

-- Invite a member to the screening organisation
CREATE OR REPLACE FUNCTION public.invite_screening_member(
  _email text,
  _role public.product_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_org uuid;
  v_target uuid;
  v_is_admin boolean;
  v_seats integer;
  v_used integer;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Find caller's screening org
  SELECT pm.organisation_id INTO v_org
  FROM public.product_members pm
  WHERE pm.user_id = v_user AND pm.product = 'screening'::public.product_key
  LIMIT 1;

  IF v_org IS NULL THEN
    SELECT m.organization_id INTO v_org
    FROM public.suite_org_members m
    WHERE m.user_id = v_user
    LIMIT 1;
  END IF;

  IF v_org IS NULL THEN
    RAISE EXCEPTION 'No screening organisation found';
  END IF;

  -- Authorisation: caller must be screening admin or WorldAML admin
  v_is_admin := public.has_role(v_user, 'admin') OR EXISTS (
    SELECT 1 FROM public.product_members pm
    WHERE pm.organisation_id = v_org
      AND pm.product = 'screening'::public.product_key
      AND pm.user_id = v_user
      AND pm.role = 'admin'::public.product_role
  );

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Not authorised: only Screening admins can invite members';
  END IF;

  -- Seat check
  SELECT COALESCE(seats, 1), COALESCE(seats_used, 0)
  INTO v_seats, v_used
  FROM public.product_access
  WHERE organisation_id = v_org AND product = 'screening'::public.product_key;

  IF v_seats IS NOT NULL AND v_used >= v_seats THEN
    RAISE EXCEPTION 'Seat limit reached (% seats). Upgrade to add more members.', v_seats;
  END IF;

  -- Look up existing user
  SELECT id INTO v_target FROM auth.users WHERE lower(email) = lower(trim(_email)) LIMIT 1;

  IF v_target IS NOT NULL THEN
    INSERT INTO public.product_members (organisation_id, product, user_id, role, created_by)
    VALUES (v_org, 'screening'::public.product_key, v_target, _role, v_user)
    ON CONFLICT (organisation_id, product, user_id) DO UPDATE SET
      role = EXCLUDED.role,
      updated_at = now();
  ELSE
    INSERT INTO public.product_members (organisation_id, product, invited_email, role, is_invite, created_by)
    VALUES (v_org, 'screening'::public.product_key, lower(trim(_email)), _role, true, v_user)
    ON CONFLICT (organisation_id, product, user_id) DO NOTHING;
  END IF;

  -- Update seats_used
  UPDATE public.product_access pa
  SET seats_used = (
    SELECT count(*) FROM public.product_members pm
    WHERE pm.organisation_id = pa.organisation_id AND pm.product = pa.product AND pm.user_id IS NOT NULL
  )
  WHERE pa.organisation_id = v_org AND pa.product = 'screening'::public.product_key;
END;
$function$;

REVOKE ALL ON FUNCTION public.invite_screening_member(text, public.product_role) FROM public;
GRANT EXECUTE ON FUNCTION public.invite_screening_member(text, public.product_role) TO authenticated;

-- Remove a member from the screening organisation
CREATE OR REPLACE FUNCTION public.remove_screening_member(
  _user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_org uuid;
  v_is_admin boolean;
  v_admin_count integer;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT pm.organisation_id INTO v_org
  FROM public.product_members pm
  WHERE pm.user_id = v_user AND pm.product = 'screening'::public.product_key
  LIMIT 1;

  IF v_org IS NULL THEN
    SELECT m.organization_id INTO v_org
    FROM public.suite_org_members m
    WHERE m.user_id = v_user
    LIMIT 1;
  END IF;

  IF v_org IS NULL THEN
    RAISE EXCEPTION 'No screening organisation found';
  END IF;

  v_is_admin := public.has_role(v_user, 'admin') OR EXISTS (
    SELECT 1 FROM public.product_members pm
    WHERE pm.organisation_id = v_org
      AND pm.product = 'screening'::public.product_key
      AND pm.user_id = v_user
      AND pm.role = 'admin'::public.product_role
  );

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Not authorised: only Screening admins can remove members';
  END IF;

  -- Prevent removing the last admin
  IF _user_id IS NOT NULL THEN
    SELECT count(*) INTO v_admin_count
    FROM public.product_members
    WHERE organisation_id = v_org
      AND product = 'screening'::public.product_key
      AND role = 'admin'::public.product_role;

    IF EXISTS (
      SELECT 1 FROM public.product_members
      WHERE organisation_id = v_org
        AND product = 'screening'::public.product_key
        AND user_id = _user_id
        AND role = 'admin'::public.product_role
        AND v_admin_count <= 1
    ) THEN
      RAISE EXCEPTION 'Cannot remove the last Screening admin';
    END IF;
  END IF;

  DELETE FROM public.product_members
  WHERE organisation_id = v_org
    AND product = 'screening'::public.product_key
    AND user_id = _user_id;

  -- Update seats_used
  UPDATE public.product_access pa
  SET seats_used = (
    SELECT count(*) FROM public.product_members pm
    WHERE pm.organisation_id = pa.organisation_id AND pm.product = pa.product AND pm.user_id IS NOT NULL
  )
  WHERE pa.organisation_id = v_org AND pa.product = 'screening'::public.product_key;
END;
$function$;

REVOKE ALL ON FUNCTION public.remove_screening_member(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.remove_screening_member(uuid) TO authenticated;

-- Allow screening admins to change member roles
CREATE OR REPLACE FUNCTION public.set_screening_member_role(
  _user_id uuid,
  _role public.product_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_org uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT pm.organisation_id INTO v_org
  FROM public.product_members pm
  WHERE pm.user_id = v_user AND pm.product = 'screening'::public.product_key
  LIMIT 1;

  IF v_org IS NULL THEN
    SELECT m.organization_id INTO v_org
    FROM public.suite_org_members m
    WHERE m.user_id = v_user
    LIMIT 1;
  END IF;

  IF v_org IS NULL THEN
    RAISE EXCEPTION 'No screening organisation found';
  END IF;

  PERFORM public.set_product_member_role(v_org, 'screening'::public.product_key, _user_id, _role);
END;
$function$;

REVOKE ALL ON FUNCTION public.set_screening_member_role(uuid, public.product_role) FROM public;
GRANT EXECUTE ON FUNCTION public.set_screening_member_role(uuid, public.product_role) TO authenticated;

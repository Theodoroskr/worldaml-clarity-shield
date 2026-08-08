-- =========================================================
-- PART 1: INTERNAL ACCESS
-- =========================================================

ALTER TABLE public.admin_invites
  ADD COLUMN IF NOT EXISTS access_role text NOT NULL DEFAULT 'full_admin',
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_by uuid;

CREATE OR REPLACE FUNCTION public.validate_admin_access_role()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.access_role IS NULL OR NEW.access_role NOT IN (
    'super_admin','full_admin','management','marketing','sales','finance',
    'compliance_ops','academy','partner_management','read_only'
  ) THEN
    RAISE EXCEPTION 'Invalid access profile: %', NEW.access_role;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_admin_access_role_trg ON public.admin_invites;
CREATE TRIGGER validate_admin_access_role_trg
BEFORE INSERT OR UPDATE ON public.admin_invites
FOR EACH ROW EXECUTE FUNCTION public.validate_admin_access_role();

-- Audit trail for internal access changes
CREATE TABLE IF NOT EXISTS public.admin_access_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_email text NOT NULL,
  action text NOT NULL,
  detail text,
  previous_value text,
  new_value text,
  performed_by uuid,
  performed_by_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.admin_access_audit TO authenticated;
GRANT ALL ON public.admin_access_audit TO service_role;

ALTER TABLE public.admin_access_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read internal access audit"
ON public.admin_access_audit FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_admin_access_audit_created
  ON public.admin_access_audit (created_at DESC);

-- Internal helper: write an audit row (bypasses RLS, called only from definer fns)
CREATE OR REPLACE FUNCTION public.log_admin_access_event(
  _target_email text,
  _action text,
  _detail text DEFAULT NULL,
  _previous text DEFAULT NULL,
  _new text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _actor_email text;
BEGIN
  SELECT lower(email) INTO _actor_email FROM auth.users WHERE id = auth.uid();
  INSERT INTO public.admin_access_audit
    (target_email, action, detail, previous_value, new_value, performed_by, performed_by_email)
  VALUES (lower(_target_email), _action, _detail, _previous, _new, auth.uid(), _actor_email);
END;
$$;

-- Extended staff listing
DROP FUNCTION IF EXISTS public.admin_list_internal_access();

CREATE OR REPLACE FUNCTION public.admin_list_internal_access()
RETURNS TABLE(
  email text,
  user_id uuid,
  full_name text,
  is_admin boolean,
  access_role text,
  department text,
  status text,
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
           NULL::timestamptz, NULL::timestamptz, NULL::timestamptz,
           u2.last_sign_in_at, NULL::uuid, NULL::text
    FROM public.user_roles r2
    JOIN auth.users u2 ON u2.id = r2.user_id
    WHERE r2.role = 'admin'
      AND lower(u2.email) NOT IN (SELECT email FROM public.admin_invites WHERE revoked_at IS NULL)
  )
  SELECT b.email,
         b.user_id,
         p.full_name,
         b.is_admin,
         COALESCE(b.access_role, 'full_admin'),
         b.department,
         CASE
           WHEN b.suspended_at IS NOT NULL THEN 'suspended'
           WHEN b.is_admin THEN 'active'
           ELSE 'pending'
         END AS status,
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

-- Invitation with role/department + duplicate detection
CREATE OR REPLACE FUNCTION public.admin_invite_internal(
  _email text,
  _note text,
  _access_role text,
  _department text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _target uuid;
  _clean text := lower(trim(_email));
  _existing public.admin_invites%ROWTYPE;
  _already_admin boolean := false;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  IF _clean !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Enter a valid work email address';
  END IF;

  SELECT id INTO _target FROM auth.users WHERE lower(email) = _clean LIMIT 1;
  SELECT * INTO _existing FROM public.admin_invites WHERE lower(email) = _clean;

  IF _target IS NOT NULL THEN
    SELECT true INTO _already_admin FROM public.user_roles
    WHERE user_id = _target AND role = 'admin';
  END IF;

  IF COALESCE(_already_admin, false) AND _existing.revoked_at IS NULL THEN
    RETURN jsonb_build_object('status', 'already_active');
  END IF;

  IF _existing.id IS NOT NULL AND _existing.revoked_at IS NULL
     AND _existing.accepted_at IS NULL AND _target IS NULL THEN
    RETURN jsonb_build_object('status', 'already_pending');
  END IF;

  INSERT INTO public.admin_invites
    (email, invited_by, note, access_role, department, accepted_at, accepted_user_id, updated_by)
  VALUES (_clean, auth.uid(), _note, COALESCE(_access_role, 'full_admin'), _department,
          CASE WHEN _target IS NULL THEN NULL ELSE now() END, _target, auth.uid())
  ON CONFLICT (lower(email)) DO UPDATE
    SET invited_by = EXCLUDED.invited_by,
        note = EXCLUDED.note,
        access_role = EXCLUDED.access_role,
        department = EXCLUDED.department,
        revoked_at = NULL,
        suspended_at = NULL,
        updated_by = auth.uid(),
        accepted_at = COALESCE(EXCLUDED.accepted_at, public.admin_invites.accepted_at),
        accepted_user_id = COALESCE(EXCLUDED.accepted_user_id, public.admin_invites.accepted_user_id);

  IF _target IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_target, 'admin') ON CONFLICT (user_id, role) DO NOTHING;
    PERFORM public.log_admin_access_event(_clean, 'access_granted',
      COALESCE(_department, '') , NULL, COALESCE(_access_role, 'full_admin'));
    RETURN jsonb_build_object('status', 'granted', 'user_id', _target);
  END IF;

  PERFORM public.log_admin_access_event(_clean, 'invitation_sent',
    COALESCE(_department, ''), NULL, COALESCE(_access_role, 'full_admin'));
  RETURN jsonb_build_object('status', 'pending');
END;
$$;

-- Change access profile / department
CREATE OR REPLACE FUNCTION public.admin_set_internal_role(
  _email text,
  _access_role text,
  _department text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _clean text := lower(trim(_email));
  _prev text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  SELECT access_role INTO _prev FROM public.admin_invites WHERE lower(email) = _clean;

  IF _prev IS NULL THEN
    -- pre-existing admin without an invite row: create one so the label is stored
    INSERT INTO public.admin_invites (email, invited_by, access_role, department, accepted_at, accepted_user_id, updated_by)
    SELECT _clean, auth.uid(), COALESCE(_access_role, 'full_admin'), _department, now(), u.id, auth.uid()
    FROM auth.users u WHERE lower(u.email) = _clean;
  ELSE
    UPDATE public.admin_invites
    SET access_role = COALESCE(_access_role, access_role),
        department = _department,
        updated_by = auth.uid()
    WHERE lower(email) = _clean;
  END IF;

  PERFORM public.log_admin_access_event(_clean, 'role_changed', _department, _prev, _access_role);
END;
$$;

-- Suspend / restore
CREATE OR REPLACE FUNCTION public.admin_suspend_internal(
  _email text,
  _suspend boolean
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _clean text := lower(trim(_email));
  _target uuid;
  _admin_count int;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  SELECT id INTO _target FROM auth.users WHERE lower(email) = _clean LIMIT 1;

  IF _suspend THEN
    IF _target IS NOT NULL AND _target = auth.uid() THEN
      RAISE EXCEPTION 'You cannot suspend your own internal access';
    END IF;
    SELECT count(*) INTO _admin_count FROM public.user_roles WHERE role = 'admin';
    IF _admin_count <= 1 AND _target IS NOT NULL THEN
      RAISE EXCEPTION 'This is the last remaining admin — access cannot be suspended';
    END IF;

    UPDATE public.admin_invites SET suspended_at = now(), updated_by = auth.uid()
    WHERE lower(email) = _clean;
    IF _target IS NOT NULL THEN
      DELETE FROM public.user_roles WHERE user_id = _target AND role = 'admin';
    END IF;
    PERFORM public.log_admin_access_event(_clean, 'access_suspended', NULL, 'active', 'suspended');
  ELSE
    UPDATE public.admin_invites SET suspended_at = NULL, updated_by = auth.uid()
    WHERE lower(email) = _clean;
    IF _target IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role) VALUES (_target, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    PERFORM public.log_admin_access_event(_clean, 'access_restored', NULL, 'suspended', 'active');
  END IF;
END;
$$;

-- Revoke: keep behaviour, add lockout protection + audit
CREATE OR REPLACE FUNCTION public.admin_revoke_internal(_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _target uuid;
  _clean text := lower(trim(_email));
  _admin_count int;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  SELECT id INTO _target FROM auth.users WHERE lower(email) = _clean LIMIT 1;
  IF _target IS NOT NULL AND _target = auth.uid() THEN
    RAISE EXCEPTION 'You cannot revoke your own internal access';
  END IF;

  IF _target IS NOT NULL THEN
    SELECT count(*) INTO _admin_count FROM public.user_roles WHERE role = 'admin';
    IF _admin_count <= 1 THEN
      RAISE EXCEPTION 'This is the last remaining admin — access cannot be removed';
    END IF;
  END IF;

  UPDATE public.admin_invites SET revoked_at = now(), updated_by = auth.uid()
  WHERE lower(email) = _clean;
  IF _target IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = _target AND role = 'admin';
  END IF;

  PERFORM public.log_admin_access_event(_clean, 'access_removed', NULL, 'active', 'revoked');
END;
$$;

-- =========================================================
-- PART 2: REPORTS
-- =========================================================

ALTER TABLE public.admin_reports
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS day_of_week smallint,
  ADD COLUMN IF NOT EXISTS day_of_month smallint,
  ADD COLUMN IF NOT EXISTS send_hour_utc smallint NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS updated_by uuid,
  ADD COLUMN IF NOT EXISTS last_test_at timestamptz;

ALTER TABLE public.admin_report_runs
  ADD COLUMN IF NOT EXISTS trigger_type text NOT NULL DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS duration_ms integer;

CREATE OR REPLACE FUNCTION public.validate_admin_report_schedule()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.send_hour_utc IS NULL OR NEW.send_hour_utc < 0 OR NEW.send_hour_utc > 23 THEN
    RAISE EXCEPTION 'Send hour must be between 0 and 23 (UTC)';
  END IF;
  IF NEW.day_of_week IS NOT NULL AND (NEW.day_of_week < 0 OR NEW.day_of_week > 6) THEN
    RAISE EXCEPTION 'Day of week must be between 0 (Sunday) and 6 (Saturday)';
  END IF;
  IF NEW.day_of_month IS NOT NULL AND (NEW.day_of_month < 1 OR NEW.day_of_month > 28) THEN
    RAISE EXCEPTION 'Day of month must be between 1 and 28';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_admin_report_schedule_trg ON public.admin_reports;
CREATE TRIGGER validate_admin_report_schedule_trg
BEFORE INSERT OR UPDATE ON public.admin_reports
FOR EACH ROW EXECUTE FUNCTION public.validate_admin_report_schedule();
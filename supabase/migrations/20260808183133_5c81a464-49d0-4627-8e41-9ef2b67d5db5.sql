CREATE TABLE IF NOT EXISTS public.admin_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  note text,
  accepted_at timestamptz,
  accepted_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_invites_email_key ON public.admin_invites (lower(email));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_invites TO authenticated;
GRANT ALL ON public.admin_invites TO service_role;

ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage internal invites" ON public.admin_invites;
CREATE POLICY "Admins manage internal invites"
ON public.admin_invites FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Invite an internal user: grants admin immediately if the account already exists,
-- otherwise records the invite so the role is granted on first sign-up.
CREATE OR REPLACE FUNCTION public.admin_invite_internal(_email text, _note text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _target uuid;
  _clean text := lower(trim(_email));
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  SELECT id INTO _target FROM auth.users WHERE lower(email) = _clean LIMIT 1;

  INSERT INTO public.admin_invites (email, invited_by, note, accepted_at, accepted_user_id)
  VALUES (_clean, auth.uid(), _note, CASE WHEN _target IS NULL THEN NULL ELSE now() END, _target)
  ON CONFLICT (lower(email)) DO UPDATE
    SET invited_by = EXCLUDED.invited_by,
        note = EXCLUDED.note,
        revoked_at = NULL,
        accepted_at = COALESCE(EXCLUDED.accepted_at, public.admin_invites.accepted_at),
        accepted_user_id = COALESCE(EXCLUDED.accepted_user_id, public.admin_invites.accepted_user_id);

  IF _target IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_target, 'admin') ON CONFLICT (user_id, role) DO NOTHING;
    RETURN jsonb_build_object('status', 'granted', 'user_id', _target);
  END IF;

  RETURN jsonb_build_object('status', 'pending');
END;
$$;

-- Revoke internal access.
CREATE OR REPLACE FUNCTION public.admin_revoke_internal(_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _target uuid;
  _clean text := lower(trim(_email));
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  SELECT id INTO _target FROM auth.users WHERE lower(email) = _clean LIMIT 1;
  IF _target IS NOT NULL AND _target = auth.uid() THEN
    RAISE EXCEPTION 'You cannot revoke your own internal access';
  END IF;

  UPDATE public.admin_invites SET revoked_at = now() WHERE lower(email) = _clean;
  IF _target IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = _target AND role = 'admin';
  END IF;
END;
$$;

-- List internal staff (admins + pending invites) for the admin portal.
CREATE OR REPLACE FUNCTION public.admin_list_internal_access()
RETURNS TABLE(email text, user_id uuid, is_admin boolean, invited_at timestamptz, accepted_at timestamptz, note text)
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
  SELECT COALESCE(lower(u.email), i.email) AS email,
         u.id AS user_id,
         (r.user_id IS NOT NULL) AS is_admin,
         i.created_at AS invited_at,
         i.accepted_at,
         i.note
  FROM public.admin_invites i
  LEFT JOIN auth.users u ON lower(u.email) = i.email
  LEFT JOIN public.user_roles r ON r.user_id = u.id AND r.role = 'admin'
  WHERE i.revoked_at IS NULL
  UNION
  SELECT lower(u2.email), u2.id, true, NULL::timestamptz, NULL::timestamptz, NULL::text
  FROM public.user_roles r2
  JOIN auth.users u2 ON u2.id = r2.user_id
  WHERE r2.role = 'admin';
END;
$$;

-- Auto-grant admin on sign-up when an open invite exists for that email.
CREATE OR REPLACE FUNCTION public.apply_admin_invite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _inv public.admin_invites%ROWTYPE;
BEGIN
  IF NEW.email IS NULL THEN RETURN NEW; END IF;
  SELECT * INTO _inv FROM public.admin_invites
   WHERE lower(email) = lower(NEW.email) AND revoked_at IS NULL LIMIT 1;
  IF FOUND THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.user_id, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
    UPDATE public.admin_invites
       SET accepted_at = COALESCE(accepted_at, now()), accepted_user_id = NEW.user_id
     WHERE id = _inv.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_apply_admin_invite ON public.profiles;
CREATE TRIGGER profiles_apply_admin_invite
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.apply_admin_invite();

-- Prevent users from self-escalating privilege-bearing columns on profiles.
-- Only admins (via has_role) or the service_role/definer functions may change
-- subscription_tier, status, suite_access_granted_at, suite_access_granted_by,
-- regulator, or marketing_opt_out_at bypass. Regular authenticated users
-- editing their own row can still change name/preferences etc.

CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_admin boolean := false;
  _is_privileged_role boolean := false;
BEGIN
  -- Service role / postgres bypass (edge functions using service key,
  -- SECURITY DEFINER helpers like admin_grant_suite_access, triggers).
  _is_privileged_role := current_setting('role', true) IN ('service_role', 'postgres')
    OR session_user IN ('service_role', 'postgres', 'supabase_admin');

  IF _is_privileged_role THEN
    RETURN NEW;
  END IF;

  -- Admins may change privileged fields via the API.
  IF auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  -- Non-admin path: revert any attempted change to privileged columns.
  IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier THEN
    NEW.subscription_tier := OLD.subscription_tier;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status := OLD.status;
  END IF;

  IF NEW.suite_access_granted_at IS DISTINCT FROM OLD.suite_access_granted_at THEN
    NEW.suite_access_granted_at := OLD.suite_access_granted_at;
  END IF;

  IF NEW.suite_access_granted_by IS DISTINCT FROM OLD.suite_access_granted_by THEN
    NEW.suite_access_granted_by := OLD.suite_access_granted_by;
  END IF;

  IF NEW.regulator IS DISTINCT FROM OLD.regulator THEN
    NEW.regulator := OLD.regulator;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_privilege_escalation_trg ON public.profiles;
CREATE TRIGGER prevent_profile_privilege_escalation_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

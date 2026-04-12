
-- Add regulator column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS regulator text;

-- Update admin_grant_suite_access to accept regulator
CREATE OR REPLACE FUNCTION public.admin_grant_suite_access(target_email text, target_regulator text DEFAULT NULL)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  target_uid UUID;
BEGIN
  SELECT user_id INTO target_uid FROM public.profiles WHERE email = target_email;
  IF target_uid IS NULL THEN
    RAISE EXCEPTION 'User not found: %', target_email;
  END IF;
  UPDATE public.profiles
  SET
    subscription_tier = 'suite',
    suite_access_granted_at = NOW(),
    suite_access_granted_by = auth.uid(),
    regulator = COALESCE(target_regulator, regulator)
  WHERE user_id = target_uid;
END;
$$;

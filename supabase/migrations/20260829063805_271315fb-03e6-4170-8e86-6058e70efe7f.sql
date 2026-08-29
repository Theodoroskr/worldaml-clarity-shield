CREATE OR REPLACE FUNCTION public.current_user_screening_org()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_org uuid;
BEGIN
  IF v_user IS NULL THEN
    RETURN NULL;
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

  RETURN v_org;
END;
$function$;

REVOKE ALL ON FUNCTION public.current_user_screening_org() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.current_user_screening_org() TO authenticated;
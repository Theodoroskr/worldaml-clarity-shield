
CREATE OR REPLACE FUNCTION public.auto_approve_trusted_domain()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Auto-approve all new users
  NEW.status := 'approved';
  RETURN NEW;
END;
$function$;

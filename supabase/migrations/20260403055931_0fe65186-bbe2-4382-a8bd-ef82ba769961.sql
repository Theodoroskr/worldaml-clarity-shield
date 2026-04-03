
CREATE OR REPLACE FUNCTION public.auto_approve_trusted_domain()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _domain text;
BEGIN
  -- Extract domain from email
  _domain := lower(split_part(NEW.email, '@', 2));
  
  -- Check exact domain match first, then suffix match for TLDs like .edu, .ac.uk
  IF EXISTS (
    SELECT 1 FROM public.auto_approve_domains
    WHERE domain = _domain
       OR _domain LIKE '%.' || domain
  ) THEN
    NEW.status := 'approved';
  END IF;
  
  RETURN NEW;
END;
$function$;

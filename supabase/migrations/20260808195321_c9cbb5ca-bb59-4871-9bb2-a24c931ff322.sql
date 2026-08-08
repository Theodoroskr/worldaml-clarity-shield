ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS gdpr_consent_at timestamptz;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _md jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
BEGIN
  INSERT INTO public.profiles (
    user_id, email, full_name,
    signup_source, signup_landing_path, signup_referrer, signup_utm,
    marketing_consent, marketing_consent_at, terms_accepted_at, gdpr_consent_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(_md->>'full_name', ''),
    NULLIF(_md->>'signup_source', ''),
    NULLIF(_md->>'signup_landing_path', ''),
    NULLIF(_md->>'signup_referrer', ''),
    COALESCE(_md->'signup_utm', '{}'::jsonb),
    true, now(), now(), now()
  );
  RETURN NEW;
END;
$function$;
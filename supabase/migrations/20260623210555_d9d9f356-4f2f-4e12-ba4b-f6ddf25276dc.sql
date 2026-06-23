
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS signup_source text,
  ADD COLUMN IF NOT EXISTS signup_landing_path text,
  ADD COLUMN IF NOT EXISTS signup_referrer text,
  ADD COLUMN IF NOT EXISTS signup_utm jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_profiles_signup_source ON public.profiles(signup_source);

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
    signup_source, signup_landing_path, signup_referrer, signup_utm
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(_md->>'full_name', ''),
    NULLIF(_md->>'signup_source', ''),
    NULLIF(_md->>'signup_landing_path', ''),
    NULLIF(_md->>'signup_referrer', ''),
    COALESCE(_md->'signup_utm', '{}'::jsonb)
  );
  RETURN NEW;
END;
$function$;

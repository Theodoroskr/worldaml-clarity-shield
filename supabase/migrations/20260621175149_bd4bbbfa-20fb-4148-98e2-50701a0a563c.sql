
CREATE OR REPLACE FUNCTION public.same_domain_signup_count()
RETURNS TABLE(domain text, signup_count bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
  _domain text;
  _free_domains text[] := ARRAY[
    'gmail.com','googlemail.com','yahoo.com','yahoo.co.uk','yahoo.co.in',
    'outlook.com','hotmail.com','live.com','msn.com','icloud.com','me.com',
    'protonmail.com','proton.me','gmx.com','gmx.de','aol.com','mail.com',
    'yandex.com','yandex.ru','zoho.com','qq.com','163.com','126.com'
  ];
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  SELECT LOWER(p.email) INTO _email FROM public.profiles p WHERE p.user_id = auth.uid();
  IF _email IS NULL OR position('@' in _email) = 0 THEN
    RETURN;
  END IF;

  _domain := split_part(_email, '@', 2);
  IF _domain = ANY(_free_domains) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT _domain, COUNT(*)::bigint
  FROM public.profiles p
  WHERE LOWER(p.email) LIKE '%@' || _domain;
END;
$$;

REVOKE ALL ON FUNCTION public.same_domain_signup_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.same_domain_signup_count() TO authenticated;

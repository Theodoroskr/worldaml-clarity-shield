CREATE OR REPLACE FUNCTION public.partner_issue_sandbox_key()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF NEW.sandbox_key IS NULL THEN
    NEW.sandbox_key := 'sk_test_' || encode(extensions.gen_random_bytes(24), 'hex');
    NEW.sandbox_key_issued_at := now();
  END IF;
  RETURN NEW;
END;
$$;
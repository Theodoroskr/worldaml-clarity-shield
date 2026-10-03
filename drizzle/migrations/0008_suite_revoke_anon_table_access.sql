-- Signed-out visitors never touch Suite client tables directly, except submitting a public onboarding form.
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relkind='r'
      AND (c.relname LIKE 'suite\_%' OR c.relname LIKE 'screening\_%' OR c.relname LIKE 'monitoring\_%')
      AND c.relname NOT IN ('suite_regulator_adapters')
  LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
  END LOOP;
END $$;
GRANT INSERT ON public.suite_onboarding_submissions TO anon;
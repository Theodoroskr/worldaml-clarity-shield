REVOKE ALL ON public.suite_pii_access_log FROM anon;
REVOKE ALL ON public.suite_mrz_checks FROM anon;
GRANT SELECT ON public.suite_pii_access_log TO authenticated;
GRANT SELECT ON public.suite_mrz_checks TO authenticated;
GRANT ALL ON public.suite_pii_access_log TO service_role;
GRANT ALL ON public.suite_mrz_checks TO service_role;
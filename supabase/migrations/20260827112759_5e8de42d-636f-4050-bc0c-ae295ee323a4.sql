REVOKE ALL ON FUNCTION public.screening_lock_org() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.ensure_default_screening_policy(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.next_screening_reference(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.screening_is_org_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.screening_is_org_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.next_screening_reference(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.ensure_default_screening_policy(uuid) TO service_role;
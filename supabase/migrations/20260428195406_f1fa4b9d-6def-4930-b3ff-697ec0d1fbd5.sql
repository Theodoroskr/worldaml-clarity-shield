
REVOKE EXECUTE ON FUNCTION public.rcm_is_org_member(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rcm_member_role(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rcm_can_edit(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rcm_can_manage(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rcm_is_org_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rcm_member_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rcm_can_edit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rcm_can_manage(UUID) TO authenticated;

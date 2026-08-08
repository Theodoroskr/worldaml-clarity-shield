REVOKE EXECUTE ON FUNCTION public.admin_list_internal_access() FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_invite_internal(text, text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_internal_role(text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_suspend_internal(text, boolean) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_revoke_internal(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_admin_access_event(text, text, text, text, text) FROM anon, authenticated;
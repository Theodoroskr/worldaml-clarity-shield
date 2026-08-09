
DO $$
DECLARE src text;
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO src
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname='public' AND p.proname='admin_notifications_sync';
  EXECUTE replace(src, '''/admin/forms''', '''/admin/dashboard''');

  SELECT pg_get_functiondef(p.oid) INTO src
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname='public' AND p.proname='trg_notify_form_submission';
  EXECUTE replace(src, '''/admin/forms''', '''/admin/dashboard''');
END $$;

UPDATE public.admin_notifications
   SET nav_path = '/admin/dashboard', action_url = '/admin/dashboard'
 WHERE event_type IN ('new_lead','demo_request');

REVOKE EXECUTE ON FUNCTION public.admin_notifications_sync() FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_notification_set_state(uuid, boolean, boolean, timestamptz) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_notifications_mark_all_read() FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_notify_upsert(text,text,text,uuid,text,text,text,text,text,jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_notify_resolve(text,uuid,text) FROM anon, authenticated;

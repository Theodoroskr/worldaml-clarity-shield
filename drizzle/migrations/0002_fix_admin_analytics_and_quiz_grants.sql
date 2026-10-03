DO $$
DECLARE d text;
BEGIN
  SELECT pg_get_functiondef('public.admin_analytics(timestamptz,timestamptz)'::regprocedure) INTO d;
  d := replace(d, 'business_entitlements', 'business_subscriptions');
  EXECUTE d;
  SELECT pg_get_functiondef(p.oid) INTO d FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.proname='admin_company_360' LIMIT 1;
  d := replace(d, 'be.product_key', 'be.product');
  d := replace(d, '''plan'', be.plan,', '''plan'', be.plan_code,');
  d := replace(d, 'be.renews_at', 'be.current_period_end');
  d := replace(d, 'public.business_entitlements', 'public.business_subscriptions');
  EXECUTE d;
END $$;

GRANT SELECT (id, course_id, question, options, explanation, sort_order) ON public.academy_questions TO authenticated;
GRANT ALL ON public.academy_questions TO service_role;
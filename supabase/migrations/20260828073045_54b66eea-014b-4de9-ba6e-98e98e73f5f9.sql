CREATE OR REPLACE FUNCTION public.admin_screening_users()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  SELECT COALESCE(jsonb_agg(x ORDER BY (x->>'searches_total')::int DESC), '[]'::jsonb)
  INTO result
  FROM (
    SELECT jsonb_build_object(
      'user_id', mm.user_id,
      'organisation_id', o.id,
      'organisation_name', o.name,
      'role', mm.role,
      'email', COALESCE(p.email, mm.invited_email),
      'full_name', COALESCE(p.full_name, NULLIF(TRIM(CONCAT(p.first_name,' ',p.last_name)), '')),
      'company_name', p.company_name,
      'job_title', p.job_title,
      'country', p.country,
      'joined_at', mm.joined_at,
      'last_activity_at', p.last_activity_at,
      'searches_total', (SELECT count(*) FROM public.screening_searches ss WHERE ss.initiated_by = mm.user_id),
      'searches_30d', (SELECT count(*) FROM public.screening_searches ss WHERE ss.initiated_by = mm.user_id AND ss.created_at > now() - interval '30 days'),
      'decisions_total', (SELECT count(*) FROM public.analyst_decisions ad WHERE ad.decided_by = mm.user_id),
      'last_search_at', (SELECT max(ss.created_at) FROM public.screening_searches ss WHERE ss.initiated_by = mm.user_id),
      'subscription_status', (SELECT s.status FROM public.screening_subscriptions s WHERE s.organisation_id = o.id ORDER BY s.created_at DESC LIMIT 1),
      'plan', (SELECT s.plan FROM public.screening_subscriptions s WHERE s.organisation_id = o.id ORDER BY s.created_at DESC LIMIT 1)
    ) AS x
    FROM public.suite_org_members mm
    JOIN public.suite_organizations o ON o.id = mm.organization_id
    LEFT JOIN public.profiles p ON p.user_id = mm.user_id
  ) t;

  RETURN result;
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_screening_users() FROM public;
GRANT EXECUTE ON FUNCTION public.admin_screening_users() TO authenticated;
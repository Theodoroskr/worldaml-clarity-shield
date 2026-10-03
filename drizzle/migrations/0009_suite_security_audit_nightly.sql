-- Core audit, callable only by the server (nightly job) and the admin wrapper.
CREATE OR REPLACE FUNCTION public.suite_security_audit_core(_run_by uuid, _kind text DEFAULT 'suite_audit')
RETURNS public.security_audit_runs
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, storage AS $$
DECLARE
  v jsonb := '[]'::jsonb;
  r record;
  v_high int := 0;
  v_row public.security_audit_runs;
  v_prev boolean;
  v_shared text[] := ARRAY['suite_organizations','suite_module_catalog','suite_regulator_adapters'];
BEGIN
  SELECT passed INTO v_prev FROM public.security_audit_runs WHERE kind = 'suite_audit' ORDER BY created_at DESC LIMIT 1;

  FOR r IN
    SELECT c.relname AS t, c.relrowsecurity AS rls,
      EXISTS (SELECT 1 FROM information_schema.columns k WHERE k.table_schema='public' AND k.table_name=c.relname
              AND k.column_name IN ('organisation_id','organization_id','org_id')) AS has_org,
      (SELECT count(*) FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=c.relname) AS pols,
      (SELECT count(*) FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=c.relname
         AND (btrim(coalesce(p.qual,'')) = 'true' OR btrim(coalesce(p.with_check,'')) = 'true')) AS open_pols,
      (SELECT count(*) FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=c.relname
         AND p.cmd <> 'INSERT'
         AND coalesce(p.qual,'') !~* '(auth\.uid|org|has_role|is_suite|is_portal|current_portal|member|token)') AS unscoped_pols,
      has_table_privilege('anon', c.oid, 'SELECT') AS anon_read
    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relkind='r'
      AND (c.relname LIKE 'suite\_%' OR c.relname LIKE 'screening\_%' OR c.relname LIKE 'monitoring\_%')
  LOOP
    IF NOT r.rls THEN
      v := v || jsonb_build_object('area','table','target',r.t,'severity','high','issue','Access rules are switched off');
    ELSIF r.pols = 0 THEN
      v := v || jsonb_build_object('area','table','target',r.t,'severity','info','issue','Locked: no access rules (server only)');
    END IF;
    IF NOT r.has_org AND NOT (r.t = ANY(v_shared)) THEN
      v := v || jsonb_build_object('area','table','target',r.t,'severity','high','issue','Not tied to a client company');
    END IF;
    IF r.open_pols > 0 AND NOT (r.t = ANY(v_shared)) THEN
      v := v || jsonb_build_object('area','table','target',r.t,'severity','high','issue','A rule lets every user in');
    END IF;
    IF r.unscoped_pols > 0 AND NOT (r.t = ANY(v_shared)) THEN
      v := v || jsonb_build_object('area','table','target',r.t,'severity','medium','issue','A rule does not check user or company');
    END IF;
    IF r.anon_read AND NOT (r.t = ANY(v_shared)) THEN
      v := v || jsonb_build_object('area','table','target',r.t,'severity','high','issue','Readable without signing in');
    END IF;
  END LOOP;

  FOR r IN SELECT b.id, b.public FROM storage.buckets b
    WHERE b.id IN ('customer-documents','edd-evidence','onboarding-submissions')
  LOOP
    IF r.public THEN
      v := v || jsonb_build_object('area','files','target',r.id,'severity','high','issue','File area is public');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.schemaname='storage' AND p.tablename='objects'
        AND coalesce(p.qual, p.with_check, '') ILIKE '%' || r.id || '%'
        AND coalesce(p.qual, p.with_check, '') ILIKE '%foldername%') THEN
      v := v || jsonb_build_object('area','files','target',r.id,'severity','medium','issue','No company-folder rule found');
    END IF;
  END LOOP;

  FOR r IN SELECT u.user_id FROM public.user_roles u WHERE u.role = 'admin'
    AND NOT EXISTS (SELECT 1 FROM auth.mfa_factors f WHERE f.user_id = u.user_id AND f.status = 'verified')
  LOOP
    v := v || jsonb_build_object('area','accounts','target',r.user_id::text,'severity','medium','issue','WorldAML admin without two-step sign-in');
  END LOOP;

  SELECT count(*) INTO v_high FROM jsonb_array_elements(v) e WHERE e->>'severity' = 'high';
  INSERT INTO public.security_audit_runs (run_by, kind, passed, high_count, results)
  VALUES (_run_by, 'suite_audit', v_high = 0, v_high, v || jsonb_build_array(jsonb_build_object('area','meta','target',_kind,'severity','info','issue','run source')))
  RETURNING * INTO v_row;

  -- Badge turned red: raise an admin alert (emailed by the admin notification dispatcher)
  IF NOT v_row.passed AND COALESCE(v_prev, true) THEN
    PERFORM public.admin_notify_upsert('Security', 'security_issue', 'security_audit_run', v_row.id,
      'WorldAML Suite go-live check failed',
      v_high || ' high-risk security issue(s) found in the Suite. Open Admin → Security to review.',
      'high', '/admin/security', '/admin/security', jsonb_build_object('source','suite_audit','high_count',v_high));
  END IF;
  -- Badge back to green: close open audit alerts
  IF v_row.passed THEN
    UPDATE public.admin_notifications SET status = 'resolved', resolved_at = now(),
      resolution_note = 'Suite go-live check passed again'
     WHERE event_type = 'security_issue' AND entity_type = 'security_audit_run' AND status = 'open';
  END IF;
  RETURN v_row;
END $$;
REVOKE ALL ON FUNCTION public.suite_security_audit_core(uuid, text) FROM anon, authenticated, public;

CREATE OR REPLACE FUNCTION public.suite_security_audit_run()
RETURNS public.security_audit_runs
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not authorised'; END IF;
  RETURN public.suite_security_audit_core(auth.uid(), 'manual');
END $$;
REVOKE ALL ON FUNCTION public.suite_security_audit_run() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.suite_security_audit_run() TO authenticated;
CREATE TABLE public.security_audit_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_by uuid,
  kind text NOT NULL DEFAULT 'suite_audit',
  passed boolean NOT NULL,
  high_count integer NOT NULL DEFAULT 0,
  results jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.security_audit_runs TO authenticated;
GRANT ALL ON public.security_audit_runs TO service_role;
ALTER TABLE public.security_audit_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read security runs" ON public.security_audit_runs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Audit trails: append-only for everyone
CREATE OR REPLACE FUNCTION public.block_audit_mutation()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'audit records cannot be changed or deleted';
END $$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['suite_audit_log','suite_sof_audit_events','suite_edd_audit','suite_customer_portal_audit','screening_audit_events','admin_module_audit','security_audit_runs'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_block_audit_mutation ON public.%I', t);
    EXECUTE format('CREATE TRIGGER trg_block_audit_mutation BEFORE UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.block_audit_mutation()', t);
  END LOOP;
END $$;

-- Live Suite security audit (admin only); records each run
CREATE OR REPLACE FUNCTION public.suite_security_audit_run()
RETURNS public.security_audit_runs
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, storage AS $$
DECLARE
  v jsonb := '[]'::jsonb;
  r record;
  v_high int := 0;
  v_row public.security_audit_runs;
  v_shared text[] := ARRAY['suite_organizations','suite_module_catalog','suite_regulator_adapters'];
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not authorised'; END IF;

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
  VALUES (auth.uid(), 'suite_audit', v_high = 0, v_high, v) RETURNING * INTO v_row;
  RETURN v_row;
END $$;
REVOKE ALL ON FUNCTION public.suite_security_audit_run() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.suite_security_audit_run() TO authenticated;
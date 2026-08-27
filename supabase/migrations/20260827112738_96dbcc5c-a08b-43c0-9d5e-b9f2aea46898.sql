-- ============ ENUMS ============
CREATE TYPE public.screening_subject_type AS ENUM ('person','organisation');
CREATE TYPE public.screening_case_status AS ENUM (
  'no_potential_matches','potential_matches_require_review','review_in_progress',
  'match_confirmed','false_positives_resolved','escalated','screening_failed',
  'monitoring_update_requires_review','closed'
);
CREATE TYPE public.screening_match_status AS ENUM (
  'review_required','review_in_progress','confirmed','possible','false_positive','escalated'
);
CREATE TYPE public.screening_category AS ENUM ('sanctions','pep_rca','warnings','adverse_media');
CREATE TYPE public.attribute_assessment AS ENUM ('match','partial_match','conflict','unavailable');
CREATE TYPE public.analyst_decision_kind AS ENUM (
  'confirm_match','keep_possible','false_positive','escalate','add_to_monitoring','reopen'
);
CREATE TYPE public.adverse_media_status AS ENUM ('new','relevant','not_relevant','duplicate','escalated');
CREATE TYPE public.monitoring_status AS ENUM ('active','paused','stopped');

-- ============ HELPERS ============
CREATE OR REPLACE FUNCTION public.screening_is_org_member(_org uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.suite_org_members m WHERE m.organization_id = _org AND m.user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.screening_lock_org()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.organisation_id IS DISTINCT FROM OLD.organisation_id THEN
    RAISE EXCEPTION 'organisation_id is immutable';
  END IF;
  RETURN NEW;
END; $$;

-- ============ POLICIES ============
CREATE TABLE public.screening_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  current_version integer NOT NULL DEFAULT 1,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.screening_policies TO authenticated;
GRANT ALL ON public.screening_policies TO service_role;
ALTER TABLE public.screening_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY sp_select ON public.screening_policies FOR SELECT TO authenticated USING (public.screening_is_org_member(organisation_id));
CREATE POLICY sp_insert ON public.screening_policies FOR INSERT TO authenticated WITH CHECK (public.screening_is_org_member(organisation_id));
CREATE POLICY sp_update ON public.screening_policies FOR UPDATE TO authenticated USING (public.screening_is_org_member(organisation_id)) WITH CHECK (public.screening_is_org_member(organisation_id));
CREATE POLICY sp_delete ON public.screening_policies FOR DELETE TO authenticated USING (public.screening_is_org_member(organisation_id));
CREATE TRIGGER sp_lock_org BEFORE UPDATE ON public.screening_policies FOR EACH ROW EXECUTE FUNCTION public.screening_lock_org();

CREATE TABLE public.screening_policy_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  policy_id uuid NOT NULL REFERENCES public.screening_policies(id) ON DELETE CASCADE,
  version integer NOT NULL,
  name text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (policy_id, version)
);
GRANT SELECT, INSERT ON public.screening_policy_versions TO authenticated;
GRANT ALL ON public.screening_policy_versions TO service_role;
ALTER TABLE public.screening_policy_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY spv_select ON public.screening_policy_versions FOR SELECT TO authenticated USING (public.screening_is_org_member(organisation_id));
CREATE POLICY spv_insert ON public.screening_policy_versions FOR INSERT TO authenticated WITH CHECK (public.screening_is_org_member(organisation_id));

-- ============ SUBJECTS ============
CREATE TABLE public.screening_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  subject_type public.screening_subject_type NOT NULL,
  full_name text NOT NULL,
  first_name text, middle_name text, last_name text,
  previous_name text,
  date_of_birth date, year_of_birth integer,
  incorporation_date date,
  country_of_residence text, nationality text, country_of_incorporation text,
  identification_number text, registration_number text,
  registered_address text,
  customer_reference text,
  suite_customer_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.screening_subjects TO authenticated;
GRANT ALL ON public.screening_subjects TO service_role;
ALTER TABLE public.screening_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY ss_select ON public.screening_subjects FOR SELECT TO authenticated USING (public.screening_is_org_member(organisation_id));
CREATE POLICY ss_insert ON public.screening_subjects FOR INSERT TO authenticated WITH CHECK (public.screening_is_org_member(organisation_id));
CREATE POLICY ss_update ON public.screening_subjects FOR UPDATE TO authenticated USING (public.screening_is_org_member(organisation_id)) WITH CHECK (public.screening_is_org_member(organisation_id));
CREATE POLICY ss_delete ON public.screening_subjects FOR DELETE TO authenticated USING (public.screening_is_org_member(organisation_id));
CREATE TRIGGER ss_lock_org BEFORE UPDATE ON public.screening_subjects FOR EACH ROW EXECUTE FUNCTION public.screening_lock_org();

-- ============ SEARCHES ============
CREATE SEQUENCE public.screening_reference_seq;

CREATE TABLE public.screening_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  subject_id uuid REFERENCES public.screening_subjects(id) ON DELETE SET NULL,
  reference text NOT NULL UNIQUE,
  policy_id uuid REFERENCES public.screening_policies(id) ON DELETE SET NULL,
  policy_version_id uuid REFERENCES public.screening_policy_versions(id) ON DELETE SET NULL,
  policy_name text,
  categories_screened public.screening_category[] NOT NULL DEFAULT '{}',
  categories_excluded public.screening_category[] NOT NULL DEFAULT '{}',
  search_parameters jsonb NOT NULL DEFAULT '{}'::jsonb,
  adverse_media_requested boolean NOT NULL DEFAULT false,
  monitoring_requested boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'completed',
  error_message text,
  is_legacy boolean NOT NULL DEFAULT false,
  initiated_by uuid,
  screened_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.screening_searches TO authenticated;
GRANT ALL ON public.screening_searches TO service_role;
ALTER TABLE public.screening_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY sse_select ON public.screening_searches FOR SELECT TO authenticated USING (public.screening_is_org_member(organisation_id));
CREATE POLICY sse_insert ON public.screening_searches FOR INSERT TO authenticated WITH CHECK (public.screening_is_org_member(organisation_id));
CREATE POLICY sse_update ON public.screening_searches FOR UPDATE TO authenticated USING (public.screening_is_org_member(organisation_id)) WITH CHECK (public.screening_is_org_member(organisation_id));
CREATE TRIGGER sse_lock_org BEFORE UPDATE ON public.screening_searches FOR EACH ROW EXECUTE FUNCTION public.screening_lock_org();

-- ============ CASES ============
CREATE TABLE public.screening_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  case_reference text NOT NULL UNIQUE,
  search_id uuid REFERENCES public.screening_searches(id) ON DELETE SET NULL,
  subject_id uuid REFERENCES public.screening_subjects(id) ON DELETE SET NULL,
  customer_reference text,
  status public.screening_case_status NOT NULL DEFAULT 'potential_matches_require_review',
  priority text NOT NULL DEFAULT 'medium',
  assigned_to uuid,
  due_date date,
  monitoring_status public.monitoring_status,
  sanctions_matches integer NOT NULL DEFAULT 0,
  pep_matches integer NOT NULL DEFAULT 0,
  warning_matches integer NOT NULL DEFAULT 0,
  adverse_media_matches integer NOT NULL DEFAULT 0,
  is_legacy boolean NOT NULL DEFAULT false,
  created_by uuid,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.screening_cases TO authenticated;
GRANT ALL ON public.screening_cases TO service_role;
ALTER TABLE public.screening_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY sc_select ON public.screening_cases FOR SELECT TO authenticated USING (public.screening_is_org_member(organisation_id));
CREATE POLICY sc_insert ON public.screening_cases FOR INSERT TO authenticated WITH CHECK (public.screening_is_org_member(organisation_id));
CREATE POLICY sc_update ON public.screening_cases FOR UPDATE TO authenticated USING (public.screening_is_org_member(organisation_id)) WITH CHECK (public.screening_is_org_member(organisation_id));
CREATE TRIGGER sc_lock_org BEFORE UPDATE ON public.screening_cases FOR EACH ROW EXECUTE FUNCTION public.screening_lock_org();

-- ============ MATCHES ============
CREATE TABLE public.screening_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  case_id uuid NOT NULL REFERENCES public.screening_cases(id) ON DELETE CASCADE,
  search_id uuid REFERENCES public.screening_searches(id) ON DELETE SET NULL,
  matched_name text NOT NULL,
  entity_type public.screening_subject_type,
  categories public.screening_category[] NOT NULL DEFAULT '{}',
  category_labels text[] NOT NULL DEFAULT '{}',
  name_similarity numeric(5,2),
  country text,
  year_of_birth integer,
  status public.screening_match_status NOT NULL DEFAULT 'review_required',
  matched_attribute_count integer NOT NULL DEFAULT 0,
  conflicting_attribute_count integer NOT NULL DEFAULT 0,
  profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_data_update timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.screening_matches TO authenticated;
GRANT ALL ON public.screening_matches TO service_role;
ALTER TABLE public.screening_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY sm_select ON public.screening_matches FOR SELECT TO authenticated USING (public.screening_is_org_member(organisation_id));
CREATE POLICY sm_insert ON public.screening_matches FOR INSERT TO authenticated WITH CHECK (public.screening_is_org_member(organisation_id));
CREATE POLICY sm_update ON public.screening_matches FOR UPDATE TO authenticated USING (public.screening_is_org_member(organisation_id)) WITH CHECK (public.screening_is_org_member(organisation_id));
CREATE TRIGGER sm_lock_org BEFORE UPDATE ON public.screening_matches FOR EACH ROW EXECUTE FUNCTION public.screening_lock_org();

CREATE TABLE public.match_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  match_id uuid NOT NULL REFERENCES public.screening_matches(id) ON DELETE CASCADE,
  field_key text NOT NULL,
  field_label text NOT NULL,
  subject_value text,
  match_value text,
  assessment public.attribute_assessment NOT NULL DEFAULT 'unavailable',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_attributes TO authenticated;
GRANT ALL ON public.match_attributes TO service_role;
ALTER TABLE public.match_attributes ENABLE ROW LEVEL SECURITY;
CREATE POLICY ma_select ON public.match_attributes FOR SELECT TO authenticated USING (public.screening_is_org_member(organisation_id));
CREATE POLICY ma_insert ON public.match_attributes FOR INSERT TO authenticated WITH CHECK (public.screening_is_org_member(organisation_id));
CREATE POLICY ma_update ON public.match_attributes FOR UPDATE TO authenticated USING (public.screening_is_org_member(organisation_id)) WITH CHECK (public.screening_is_org_member(organisation_id));
CREATE POLICY ma_delete ON public.match_attributes FOR DELETE TO authenticated USING (public.screening_is_org_member(organisation_id));

CREATE TABLE public.screening_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  match_id uuid NOT NULL REFERENCES public.screening_matches(id) ON DELETE CASCADE,
  source_name text NOT NULL,
  jurisdiction text,
  category public.screening_category,
  listing_date date,
  last_updated date,
  reference_number text,
  description text,
  internal_source_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.screening_sources TO authenticated;
GRANT ALL ON public.screening_sources TO service_role;
ALTER TABLE public.screening_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY sso_select ON public.screening_sources FOR SELECT TO authenticated USING (public.screening_is_org_member(organisation_id));
CREATE POLICY sso_insert ON public.screening_sources FOR INSERT TO authenticated WITH CHECK (public.screening_is_org_member(organisation_id));

CREATE TABLE public.adverse_media_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  match_id uuid REFERENCES public.screening_matches(id) ON DELETE CASCADE,
  case_id uuid REFERENCES public.screening_cases(id) ON DELETE CASCADE,
  headline text NOT NULL,
  publication text,
  published_at date,
  media_category text,
  snippet text,
  relevant_subject text,
  status public.adverse_media_status NOT NULL DEFAULT 'new',
  internal_source_url text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.adverse_media_items TO authenticated;
GRANT ALL ON public.adverse_media_items TO service_role;
ALTER TABLE public.adverse_media_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY ami_select ON public.adverse_media_items FOR SELECT TO authenticated USING (public.screening_is_org_member(organisation_id));
CREATE POLICY ami_insert ON public.adverse_media_items FOR INSERT TO authenticated WITH CHECK (public.screening_is_org_member(organisation_id));
CREATE POLICY ami_update ON public.adverse_media_items FOR UPDATE TO authenticated USING (public.screening_is_org_member(organisation_id)) WITH CHECK (public.screening_is_org_member(organisation_id));

-- ============ DECISIONS / COMMENTS / ATTACHMENTS / AUDIT ============
CREATE TABLE public.analyst_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  case_id uuid NOT NULL REFERENCES public.screening_cases(id) ON DELETE CASCADE,
  match_id uuid REFERENCES public.screening_matches(id) ON DELETE CASCADE,
  decision public.analyst_decision_kind NOT NULL,
  reason_code text,
  reason_label text,
  comment text,
  decided_by uuid,
  decided_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.analyst_decisions TO authenticated;
GRANT ALL ON public.analyst_decisions TO service_role;
ALTER TABLE public.analyst_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY ad_select ON public.analyst_decisions FOR SELECT TO authenticated USING (public.screening_is_org_member(organisation_id));
CREATE POLICY ad_insert ON public.analyst_decisions FOR INSERT TO authenticated WITH CHECK (public.screening_is_org_member(organisation_id) AND decided_by = auth.uid());

CREATE TABLE public.case_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  case_id uuid NOT NULL REFERENCES public.screening_cases(id) ON DELETE CASCADE,
  match_id uuid REFERENCES public.screening_matches(id) ON DELETE CASCADE,
  body text NOT NULL,
  author_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_comments TO authenticated;
GRANT ALL ON public.case_comments TO service_role;
ALTER TABLE public.case_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY cc_select ON public.case_comments FOR SELECT TO authenticated USING (public.screening_is_org_member(organisation_id));
CREATE POLICY cc_insert ON public.case_comments FOR INSERT TO authenticated WITH CHECK (public.screening_is_org_member(organisation_id) AND author_id = auth.uid());
CREATE POLICY cc_update ON public.case_comments FOR UPDATE TO authenticated USING (author_id = auth.uid() AND public.screening_is_org_member(organisation_id)) WITH CHECK (author_id = auth.uid() AND public.screening_is_org_member(organisation_id));
CREATE POLICY cc_delete ON public.case_comments FOR DELETE TO authenticated USING (author_id = auth.uid() AND public.screening_is_org_member(organisation_id));

CREATE TABLE public.case_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  case_id uuid NOT NULL REFERENCES public.screening_cases(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  mime_type text,
  size_bytes integer,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.case_attachments TO authenticated;
GRANT ALL ON public.case_attachments TO service_role;
ALTER TABLE public.case_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY ca_select ON public.case_attachments FOR SELECT TO authenticated USING (public.screening_is_org_member(organisation_id));
CREATE POLICY ca_insert ON public.case_attachments FOR INSERT TO authenticated WITH CHECK (public.screening_is_org_member(organisation_id) AND uploaded_by = auth.uid());
CREATE POLICY ca_delete ON public.case_attachments FOR DELETE TO authenticated USING (public.screening_is_org_member(organisation_id));

CREATE TABLE public.screening_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  case_id uuid REFERENCES public.screening_cases(id) ON DELETE CASCADE,
  match_id uuid REFERENCES public.screening_matches(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  description text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.screening_audit_events TO authenticated;
GRANT ALL ON public.screening_audit_events TO service_role;
ALTER TABLE public.screening_audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY sae_select ON public.screening_audit_events FOR SELECT TO authenticated USING (public.screening_is_org_member(organisation_id));
CREATE POLICY sae_insert ON public.screening_audit_events FOR INSERT TO authenticated WITH CHECK (public.screening_is_org_member(organisation_id));

-- ============ MONITORING ============
CREATE TABLE public.monitoring_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  subject_id uuid REFERENCES public.screening_subjects(id) ON DELETE CASCADE,
  case_id uuid REFERENCES public.screening_cases(id) ON DELETE SET NULL,
  categories public.screening_category[] NOT NULL DEFAULT '{}',
  status public.monitoring_status NOT NULL DEFAULT 'active',
  frequency text NOT NULL DEFAULT 'daily',
  started_at timestamptz NOT NULL DEFAULT now(),
  last_checked_at timestamptz,
  last_change_at timestamptz,
  assigned_to uuid,
  stopped_at timestamptz,
  stopped_by uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.monitoring_subjects TO authenticated;
GRANT ALL ON public.monitoring_subjects TO service_role;
ALTER TABLE public.monitoring_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY ms_select ON public.monitoring_subjects FOR SELECT TO authenticated USING (public.screening_is_org_member(organisation_id));
CREATE POLICY ms_insert ON public.monitoring_subjects FOR INSERT TO authenticated WITH CHECK (public.screening_is_org_member(organisation_id));
CREATE POLICY ms_update ON public.monitoring_subjects FOR UPDATE TO authenticated USING (public.screening_is_org_member(organisation_id)) WITH CHECK (public.screening_is_org_member(organisation_id));
CREATE TRIGGER ms_lock_org BEFORE UPDATE ON public.monitoring_subjects FOR EACH ROW EXECUTE FUNCTION public.screening_lock_org();

CREATE TABLE public.monitoring_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  monitoring_subject_id uuid NOT NULL REFERENCES public.monitoring_subjects(id) ON DELETE CASCADE,
  case_id uuid REFERENCES public.screening_cases(id) ON DELETE SET NULL,
  change_type text NOT NULL,
  change_description text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'unreviewed',
  acknowledged_by uuid,
  acknowledged_at timestamptz,
  detected_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.monitoring_alerts TO authenticated;
GRANT ALL ON public.monitoring_alerts TO service_role;
ALTER TABLE public.monitoring_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY mal_select ON public.monitoring_alerts FOR SELECT TO authenticated USING (public.screening_is_org_member(organisation_id));
CREATE POLICY mal_insert ON public.monitoring_alerts FOR INSERT TO authenticated WITH CHECK (public.screening_is_org_member(organisation_id));
CREATE POLICY mal_update ON public.monitoring_alerts FOR UPDATE TO authenticated USING (public.screening_is_org_member(organisation_id)) WITH CHECK (public.screening_is_org_member(organisation_id));

-- ============ USAGE ============
CREATE TABLE public.usage_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  kind text NOT NULL,
  credits integer NOT NULL DEFAULT 1,
  search_id uuid REFERENCES public.screening_searches(id) ON DELETE SET NULL,
  description text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.usage_transactions TO authenticated;
GRANT ALL ON public.usage_transactions TO service_role;
ALTER TABLE public.usage_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY ut_select ON public.usage_transactions FOR SELECT TO authenticated USING (public.screening_is_org_member(organisation_id));

-- ============ PROVIDER INTERNALS (service role + platform admins only) ============
CREATE TABLE public.provider_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  entity_kind text NOT NULL,
  entity_id uuid NOT NULL,
  provider text NOT NULL,
  provider_id text NOT NULL,
  provider_ref jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.provider_references TO service_role;
ALTER TABLE public.provider_references ENABLE ROW LEVEL SECURITY;
CREATE POLICY pr_admin_select ON public.provider_references FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.provider_raw_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  search_id uuid REFERENCES public.screening_searches(id) ON DELETE CASCADE,
  provider text NOT NULL,
  operation text NOT NULL,
  request_payload jsonb,
  response_payload jsonb,
  http_status integer,
  error_detail text,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.provider_raw_responses TO service_role;
ALTER TABLE public.provider_raw_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY prr_admin_select ON public.provider_raw_responses FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ INDEXES ============
CREATE INDEX idx_scr_cases_org_status ON public.screening_cases(organisation_id, status);
CREATE INDEX idx_scr_cases_assigned ON public.screening_cases(assigned_to);
CREATE INDEX idx_scr_matches_case ON public.screening_matches(case_id);
CREATE INDEX idx_match_attrs_match ON public.match_attributes(match_id);
CREATE INDEX idx_scr_sources_match ON public.screening_sources(match_id);
CREATE INDEX idx_ami_case ON public.adverse_media_items(case_id);
CREATE INDEX idx_audit_case ON public.screening_audit_events(case_id, created_at DESC);
CREATE INDEX idx_mon_alerts_subject ON public.monitoring_alerts(monitoring_subject_id, status);
CREATE INDEX idx_searches_org_date ON public.screening_searches(organisation_id, screened_at DESC);

-- ============ TIMESTAMP TRIGGERS ============
CREATE TRIGGER sp_touch BEFORE UPDATE ON public.screening_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER ss_touch BEFORE UPDATE ON public.screening_subjects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER sc_touch BEFORE UPDATE ON public.screening_cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER sm_touch BEFORE UPDATE ON public.screening_matches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER ms_touch BEFORE UPDATE ON public.monitoring_subjects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ REFERENCE GENERATOR ============
CREATE OR REPLACE FUNCTION public.next_screening_reference(_prefix text DEFAULT 'SCR')
RETURNS text LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public AS $$
  SELECT 'WAML-' || _prefix || '-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.screening_reference_seq')::text, 6, '0');
$$;
GRANT EXECUTE ON FUNCTION public.next_screening_reference(text) TO authenticated, service_role;

-- ============ DEFAULT POLICY PER ORG ============
CREATE OR REPLACE FUNCTION public.ensure_default_screening_policy(_org uuid)
RETURNS uuid LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid;
BEGIN
  SELECT id INTO _id FROM public.screening_policies WHERE organisation_id = _org AND is_default LIMIT 1;
  IF _id IS NOT NULL THEN RETURN _id; END IF;

  INSERT INTO public.screening_policies (organisation_id, name, description, is_default, config)
  VALUES (_org, 'WorldAML Standard', 'Sanctions and PEPs/RCAs screening with warning lists. Adverse media optional.', true,
    jsonb_build_object(
      'sanctions', true, 'pep', true, 'rca', true, 'warnings', true,
      'adverse_media', false, 'adverse_media_categories', '[]'::jsonb,
      'pep_levels', jsonb_build_array(1,2,3,4), 'include_former_pep', true,
      'name_threshold', 0.75, 'exact_match', false,
      'country_matching', true, 'dob_matching', true,
      'monitoring_categories', jsonb_build_array('sanctions','pep_rca'),
      'monitoring_frequency', 'daily',
      'require_decision_reasons', true,
      'max_results', 50,
      'allow_user_advanced_options', true
    ))
  RETURNING id INTO _id;

  INSERT INTO public.screening_policy_versions (organisation_id, policy_id, version, name, config)
  SELECT organisation_id, id, 1, name, config FROM public.screening_policies WHERE id = _id;

  RETURN _id;
END; $$;
GRANT EXECUTE ON FUNCTION public.ensure_default_screening_policy(uuid) TO authenticated, service_role;

-- seed for existing orgs
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id FROM public.suite_organizations LOOP
    PERFORM public.ensure_default_screening_policy(r.id);
  END LOOP;
END $$;
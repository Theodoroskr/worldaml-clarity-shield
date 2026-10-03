
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;

CREATE TABLE IF NOT EXISTS private.pii_keys (
  name text PRIMARY KEY,
  key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON private.pii_keys FROM PUBLIC, anon, authenticated;
INSERT INTO private.pii_keys (name, key) VALUES
  ('enc', encode(extensions.gen_random_bytes(32), 'hex')),
  ('hmac', encode(extensions.gen_random_bytes(32), 'hex'))
ON CONFLICT (name) DO NOTHING;

CREATE OR REPLACE FUNCTION private.pii_key(_name text) RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT key FROM private.pii_keys WHERE name = _name
$$;

CREATE OR REPLACE FUNCTION private.pii_encrypt(_v text) RETURNS bytea
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF _v IS NULL OR _v = '' THEN RETURN NULL; END IF;
  RETURN extensions.pgp_sym_encrypt(_v, private.pii_key('enc'), 'cipher-algo=aes256');
END $$;

CREATE OR REPLACE FUNCTION private.pii_decrypt(_b bytea) RETURNS text
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF _b IS NULL THEN RETURN NULL; END IF;
  RETURN extensions.pgp_sym_decrypt(_b, private.pii_key('enc'));
END $$;

CREATE OR REPLACE FUNCTION private.pii_bidx(_v text) RETURNS text
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF _v IS NULL OR _v = '' THEN RETURN NULL; END IF;
  RETURN encode(extensions.hmac(lower(regexp_replace(_v, '[^A-Za-z0-9]', '', 'g')), private.pii_key('hmac'), 'sha256'), 'hex');
END $$;

CREATE OR REPLACE FUNCTION private.pii_mask(_v text, _kind text) RETURNS text
LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
  SELECT CASE
    WHEN _v IS NULL OR _v = '' THEN NULL
    WHEN _kind = 'date' AND _v ~ '^\d{4}-' THEN '••/••/' || left(_v, 4)
    WHEN length(_v) <= 4 THEN '••••'
    ELSE '••••' || right(_v, 4)
  END
$$;

CREATE OR REPLACE FUNCTION private.pii_split(_j jsonb, _prefix text DEFAULT '') RETURNS jsonb
LANGUAGE plpgsql IMMUTABLE SET search_path = '' AS $$
DECLARE
  k text; v jsonb; r jsonb; i int;
  m jsonb; s jsonb := '{}'::jsonb; txt text;
  re text := '^(passport.*|id_number|id_no|identification_number|national_id.*|nin|ssn|document_number|doc_number|tax.*|tin|vat_number|iban|bank.*|account_number|swift.*|bic|sort_code|routing_number|date_of_birth|dob|birth_date|dateofbirth)$';
BEGIN
  IF _j IS NULL THEN RETURN jsonb_build_object('m', NULL, 's', '{}'::jsonb); END IF;
  IF jsonb_typeof(_j) = 'object' THEN
    m := '{}'::jsonb;
    FOR k, v IN SELECT * FROM jsonb_each(_j) LOOP
      IF lower(k) ~ re AND jsonb_typeof(v) IN ('string','number') THEN
        txt := v #>> '{}';
        IF txt = '' OR left(txt, 1) = '•' THEN
          m := m || jsonb_build_object(k, v);
        ELSE
          s := s || jsonb_build_object(_prefix || k, txt);
          m := m || jsonb_build_object(k, private.pii_mask(txt, CASE WHEN lower(k) ~ '(birth|dob)' THEN 'date' ELSE 'id' END));
        END IF;
      ELSIF jsonb_typeof(v) IN ('object','array') THEN
        r := private.pii_split(v, _prefix || k || '.');
        m := m || jsonb_build_object(k, r->'m');
        s := s || (r->'s');
      ELSE
        m := m || jsonb_build_object(k, v);
      END IF;
    END LOOP;
    RETURN jsonb_build_object('m', m, 's', s);
  ELSIF jsonb_typeof(_j) = 'array' THEN
    m := '[]'::jsonb;
    FOR i IN 0 .. jsonb_array_length(_j) - 1 LOOP
      r := private.pii_split(_j->i, _prefix || i::text || '.');
      m := m || jsonb_build_array(r->'m');
      s := s || (r->'s');
    END LOOP;
    RETURN jsonb_build_object('m', m, 's', s);
  END IF;
  RETURN jsonb_build_object('m', _j, 's', '{}'::jsonb);
END $$;

CREATE OR REPLACE FUNCTION private.merge_pii(_old bytea, _new jsonb) RETURNS bytea
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = '' AS $$
DECLARE cur jsonb := '{}'::jsonb;
BEGIN
  IF _new IS NULL OR _new = '{}'::jsonb THEN RETURN _old; END IF;
  IF _old IS NOT NULL THEN cur := private.pii_decrypt(_old)::jsonb; END IF;
  RETURN private.pii_encrypt((cur || _new)::text);
END $$;

REVOKE EXECUTE ON FUNCTION private.pii_key(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.pii_encrypt(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.pii_decrypt(bytea) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.pii_bidx(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.merge_pii(bytea, jsonb) FROM PUBLIC, anon;

ALTER TABLE public.screening_subjects
  ADD COLUMN IF NOT EXISTS date_of_birth_enc bytea,
  ADD COLUMN IF NOT EXISTS date_of_birth_bidx text,
  ADD COLUMN IF NOT EXISTS date_of_birth_masked text,
  ADD COLUMN IF NOT EXISTS identification_number_enc bytea,
  ADD COLUMN IF NOT EXISTS identification_number_bidx text,
  ADD COLUMN IF NOT EXISTS identification_number_masked text;
ALTER TABLE public.suite_customers
  ADD COLUMN IF NOT EXISTS date_of_birth_enc bytea,
  ADD COLUMN IF NOT EXISTS date_of_birth_bidx text,
  ADD COLUMN IF NOT EXISTS date_of_birth_masked text,
  ADD COLUMN IF NOT EXISTS onboarding_pii_enc bytea;
ALTER TABLE public.suite_ubo
  ADD COLUMN IF NOT EXISTS dob_enc bytea,
  ADD COLUMN IF NOT EXISTS dob_masked text;
ALTER TABLE public.suite_onboarding_submissions
  ADD COLUMN IF NOT EXISTS data_pii_enc bytea;

CREATE INDEX IF NOT EXISTS idx_screening_subjects_idn_bidx ON public.screening_subjects (organisation_id, identification_number_bidx);
CREATE INDEX IF NOT EXISTS idx_screening_subjects_dob_bidx ON public.screening_subjects (organisation_id, date_of_birth_bidx);
CREATE INDEX IF NOT EXISTS idx_suite_customers_dob_bidx ON public.suite_customers (organisation_id, date_of_birth_bidx);

ALTER TABLE public.suite_org_members ADD COLUMN IF NOT EXISTS can_view_pii boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.trg_encrypt_screening_subject() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NEW.date_of_birth IS NOT NULL THEN
    NEW.date_of_birth_enc := private.pii_encrypt(NEW.date_of_birth::text);
    NEW.date_of_birth_bidx := private.pii_bidx(NEW.date_of_birth::text);
    NEW.date_of_birth_masked := private.pii_mask(NEW.date_of_birth::text, 'date');
    NEW.year_of_birth := COALESCE(NEW.year_of_birth, extract(year FROM NEW.date_of_birth)::int);
    NEW.date_of_birth := NULL;
  END IF;
  IF NEW.identification_number IS NOT NULL AND NEW.identification_number <> '' THEN
    NEW.identification_number_enc := private.pii_encrypt(NEW.identification_number);
    NEW.identification_number_bidx := private.pii_bidx(NEW.identification_number);
    NEW.identification_number_masked := private.pii_mask(NEW.identification_number, 'id');
    NEW.identification_number := NULL;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.trg_encrypt_suite_customer() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE r jsonb;
BEGIN
  IF NEW.date_of_birth IS NOT NULL THEN
    NEW.date_of_birth_enc := private.pii_encrypt(NEW.date_of_birth::text);
    NEW.date_of_birth_bidx := private.pii_bidx(NEW.date_of_birth::text);
    NEW.date_of_birth_masked := private.pii_mask(NEW.date_of_birth::text, 'date');
    NEW.date_of_birth := NULL;
  END IF;
  IF NEW.onboarding_data IS NOT NULL THEN
    r := private.pii_split(NEW.onboarding_data);
    NEW.onboarding_data := r->'m';
    NEW.onboarding_pii_enc := private.merge_pii(CASE WHEN TG_OP = 'UPDATE' THEN OLD.onboarding_pii_enc END, r->'s');
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.trg_encrypt_suite_ubo() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NEW.dob IS NOT NULL THEN
    NEW.dob_enc := private.pii_encrypt(NEW.dob::text);
    NEW.dob_masked := private.pii_mask(NEW.dob::text, 'date');
    NEW.dob := NULL;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.trg_encrypt_onboarding_submission() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE r jsonb;
BEGIN
  IF NEW.data IS NOT NULL THEN
    r := private.pii_split(NEW.data);
    NEW.data := r->'m';
    NEW.data_pii_enc := private.merge_pii(CASE WHEN TG_OP = 'UPDATE' THEN OLD.data_pii_enc END, r->'s');
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_encrypt_pii ON public.screening_subjects;
CREATE TRIGGER trg_encrypt_pii BEFORE INSERT OR UPDATE ON public.screening_subjects FOR EACH ROW EXECUTE FUNCTION public.trg_encrypt_screening_subject();
DROP TRIGGER IF EXISTS trg_encrypt_pii ON public.suite_customers;
CREATE TRIGGER trg_encrypt_pii BEFORE INSERT OR UPDATE ON public.suite_customers FOR EACH ROW EXECUTE FUNCTION public.trg_encrypt_suite_customer();
DROP TRIGGER IF EXISTS trg_encrypt_pii ON public.suite_ubo;
CREATE TRIGGER trg_encrypt_pii BEFORE INSERT OR UPDATE ON public.suite_ubo FOR EACH ROW EXECUTE FUNCTION public.trg_encrypt_suite_ubo();
DROP TRIGGER IF EXISTS trg_encrypt_pii ON public.suite_onboarding_submissions;
CREATE TRIGGER trg_encrypt_pii BEFORE INSERT OR UPDATE ON public.suite_onboarding_submissions FOR EACH ROW EXECUTE FUNCTION public.trg_encrypt_onboarding_submission();

CREATE TABLE IF NOT EXISTS public.suite_pii_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  user_id uuid NOT NULL,
  record_table text NOT NULL,
  record_id uuid NOT NULL,
  purpose text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.suite_pii_access_log TO authenticated;
GRANT ALL ON public.suite_pii_access_log TO service_role;
ALTER TABLE public.suite_pii_access_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Suite admins read their company PII access log" ON public.suite_pii_access_log
  FOR SELECT TO authenticated USING (public.is_suite_org_admin(organisation_id));
CREATE TRIGGER trg_block_audit_mutation BEFORE DELETE OR UPDATE ON public.suite_pii_access_log
  FOR EACH ROW EXECUTE FUNCTION public.block_audit_mutation();

CREATE OR REPLACE FUNCTION public.suite_can_view_pii(_org uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.suite_org_members
    WHERE organization_id = _org AND user_id = auth.uid() AND (role = 'admin' OR can_view_pii))
$$;

CREATE OR REPLACE FUNCTION public.suite_reveal_pii(_table text, _id uuid, _purpose text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _org uuid; res jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF _table = 'screening_subjects' THEN
    SELECT organisation_id, jsonb_build_object(
      'date_of_birth', private.pii_decrypt(date_of_birth_enc),
      'identification_number', private.pii_decrypt(identification_number_enc))
      INTO _org, res FROM public.screening_subjects WHERE id = _id;
  ELSIF _table = 'suite_customers' THEN
    SELECT organisation_id, jsonb_build_object(
      'date_of_birth', private.pii_decrypt(date_of_birth_enc),
      'extra', COALESCE(private.pii_decrypt(onboarding_pii_enc)::jsonb, '{}'::jsonb))
      INTO _org, res FROM public.suite_customers WHERE id = _id;
  ELSIF _table = 'suite_ubo' THEN
    SELECT organisation_id, jsonb_build_object('dob', private.pii_decrypt(dob_enc))
      INTO _org, res FROM public.suite_ubo WHERE id = _id;
  ELSIF _table = 'suite_onboarding_submissions' THEN
    SELECT organisation_id, jsonb_build_object(
      'extra', COALESCE(private.pii_decrypt(data_pii_enc)::jsonb, '{}'::jsonb))
      INTO _org, res FROM public.suite_onboarding_submissions WHERE id = _id;
  ELSE
    RAISE EXCEPTION 'unsupported_table';
  END IF;
  IF _org IS NULL OR NOT public.suite_can_view_pii(_org) THEN
    RAISE EXCEPTION 'not_permitted' USING ERRCODE = '42501';
  END IF;
  INSERT INTO public.suite_pii_access_log (organisation_id, user_id, record_table, record_id, purpose)
  VALUES (_org, auth.uid(), _table, _id, left(_purpose, 200));
  RETURN res;
END $$;
REVOKE EXECUTE ON FUNCTION public.suite_reveal_pii(text, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.suite_reveal_pii(text, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.suite_can_view_pii(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.suite_find_subjects_by_identifier(_org uuid, _value text)
RETURNS SETOF uuid LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE h text := private.pii_bidx(_value);
BEGIN
  IF NOT public.screening_is_org_member(_org) THEN RAISE EXCEPTION 'not_permitted' USING ERRCODE = '42501'; END IF;
  RETURN QUERY SELECT id FROM public.screening_subjects
   WHERE organisation_id = _org AND (identification_number_bidx = h OR date_of_birth_bidx = h);
END $$;
REVOKE EXECUTE ON FUNCTION public.suite_find_subjects_by_identifier(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.suite_find_subjects_by_identifier(uuid, text) TO authenticated;

UPDATE public.screening_subjects SET date_of_birth = date_of_birth WHERE date_of_birth IS NOT NULL OR (identification_number IS NOT NULL AND identification_number <> '');
UPDATE public.suite_customers SET onboarding_data = onboarding_data WHERE date_of_birth IS NOT NULL OR onboarding_data IS NOT NULL;
UPDATE public.suite_ubo SET dob = dob WHERE dob IS NOT NULL;
UPDATE public.suite_onboarding_submissions SET data = data WHERE data IS NOT NULL;

COMMENT ON COLUMN public.screening_subjects.date_of_birth IS 'DEPRECATED for storage: write-only, encrypted into date_of_birth_enc by trigger';
COMMENT ON COLUMN public.screening_subjects.identification_number IS 'DEPRECATED for storage: write-only, encrypted into identification_number_enc by trigger';
COMMENT ON COLUMN public.suite_customers.date_of_birth IS 'DEPRECATED for storage: write-only, encrypted into date_of_birth_enc by trigger';
COMMENT ON COLUMN public.suite_ubo.dob IS 'DEPRECATED for storage: write-only, encrypted into dob_enc by trigger';

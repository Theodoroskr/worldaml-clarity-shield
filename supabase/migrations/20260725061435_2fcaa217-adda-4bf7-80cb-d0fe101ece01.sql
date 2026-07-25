
CREATE OR REPLACE FUNCTION public.validate_onboarding_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  form_row public.suite_onboarding_forms%ROWTYPE;
  fld JSONB;
  val JSONB;
  raw TEXT;
  vlen INT;
  numv NUMERIC;
  v JSONB;
  req_doc TEXT;
  found BOOLEAN;
  ftype TEXT;
  fkey TEXT;
  flabel TEXT;
  validation JSONB;
  pat TEXT;
  fmt TEXT;
  min_v NUMERIC;
  max_v NUMERIC;
  min_len INT;
  max_len INT;
BEGIN
  SELECT * INTO form_row FROM public.suite_onboarding_forms WHERE id = NEW.form_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Onboarding form not found';
  END IF;
  IF NOT form_row.is_active THEN
    RAISE EXCEPTION 'This onboarding form is not accepting submissions';
  END IF;

  FOR fld IN SELECT * FROM jsonb_array_elements(COALESCE(form_row.schema, '[]'::jsonb))
  LOOP
    ftype := fld->>'type';
    fkey := fld->>'key';
    flabel := COALESCE(fld->>'label', fkey);
    validation := COALESCE(fld->'validation', '{}'::jsonb);

    IF ftype = 'heading' THEN CONTINUE; END IF;

    val := NEW.data->fkey;

    -- Required check
    IF COALESCE((fld->>'required')::boolean, false) THEN
      IF ftype = 'file' THEN
        IF val IS NULL OR jsonb_typeof(val) <> 'object' OR (val->>'path') IS NULL THEN
          RAISE EXCEPTION '% is required', flabel;
        END IF;
      ELSIF ftype = 'checkbox' THEN
        IF val IS NULL OR val::text = 'false' OR val::text = 'null' THEN
          RAISE EXCEPTION '% is required', flabel;
        END IF;
      ELSE
        IF val IS NULL OR jsonb_typeof(val) = 'null' OR (jsonb_typeof(val) = 'string' AND btrim(val #>> '{}') = '') THEN
          RAISE EXCEPTION '% is required', flabel;
        END IF;
      END IF;
    END IF;

    -- Skip further checks if empty and optional
    IF val IS NULL OR jsonb_typeof(val) = 'null' THEN CONTINUE; END IF;

    IF ftype IN ('text','textarea','email','phone','address','date','select') THEN
      raw := val #>> '{}';
      IF raw IS NOT NULL THEN
        vlen := char_length(raw);
        min_len := NULLIF(validation->>'minLength','')::int;
        max_len := NULLIF(validation->>'maxLength','')::int;
        IF min_len IS NOT NULL AND vlen < min_len THEN
          RAISE EXCEPTION '% must be at least % characters', flabel, min_len;
        END IF;
        IF max_len IS NOT NULL AND vlen > max_len THEN
          RAISE EXCEPTION '% must be at most % characters', flabel, max_len;
        END IF;

        fmt := COALESCE(validation->>'format', '');
        IF ftype = 'email' OR fmt = 'email' THEN
          IF raw !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
            RAISE EXCEPTION '% must be a valid email address', flabel;
          END IF;
        ELSIF fmt = 'url' THEN
          IF raw !~* '^https?://[^\s]+$' THEN
            RAISE EXCEPTION '% must be a valid URL', flabel;
          END IF;
        ELSIF fmt = 'alpha' THEN
          IF raw !~ '^[A-Za-z\s\-]+$' THEN
            RAISE EXCEPTION '% must contain only letters', flabel;
          END IF;
        ELSIF fmt = 'alphanumeric' THEN
          IF raw !~ '^[A-Za-z0-9\s\-]+$' THEN
            RAISE EXCEPTION '% must contain only letters and numbers', flabel;
          END IF;
        END IF;

        pat := NULLIF(validation->>'pattern', '');
        IF pat IS NOT NULL THEN
          BEGIN
            IF raw !~ pat THEN
              RAISE EXCEPTION '%', COALESCE(NULLIF(validation->>'patternMessage',''), flabel || ' has an invalid format');
            END IF;
          EXCEPTION WHEN invalid_regular_expression THEN
            -- ignore malformed patterns
            NULL;
          END;
        END IF;

        IF ftype = 'select' THEN
          IF fld ? 'options' AND jsonb_typeof(fld->'options') = 'array' THEN
            IF NOT (fld->'options' @> to_jsonb(raw)) THEN
              RAISE EXCEPTION '% must be one of the available options', flabel;
            END IF;
          END IF;
        END IF;
      END IF;
    ELSIF ftype = 'number' THEN
      BEGIN
        numv := (val #>> '{}')::numeric;
      EXCEPTION WHEN others THEN
        RAISE EXCEPTION '% must be a number', flabel;
      END;
      min_v := NULLIF(validation->>'min','')::numeric;
      max_v := NULLIF(validation->>'max','')::numeric;
      IF min_v IS NOT NULL AND numv < min_v THEN
        RAISE EXCEPTION '% must be at least %', flabel, min_v;
      END IF;
      IF max_v IS NOT NULL AND numv > max_v THEN
        RAISE EXCEPTION '% must be at most %', flabel, max_v;
      END IF;
    ELSIF ftype = 'file' THEN
      IF jsonb_typeof(val) = 'object' THEN
        max_v := NULLIF(validation->>'maxFileSizeMb','')::numeric;
        IF max_v IS NOT NULL AND (val->>'size') IS NOT NULL AND (val->>'size')::numeric > max_v * 1024 * 1024 THEN
          RAISE EXCEPTION '% must be at most % MB', flabel, max_v;
        END IF;
        IF validation ? 'allowedFileTypes' AND jsonb_typeof(validation->'allowedFileTypes') = 'array'
           AND jsonb_array_length(validation->'allowedFileTypes') > 0 THEN
          IF NOT EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(validation->'allowedFileTypes') ext
            WHERE lower(val->>'name') LIKE '%.' || lower(ext.value)
          ) THEN
            RAISE EXCEPTION '% has an unsupported file type', flabel;
          END IF;
        END IF;
      END IF;
    END IF;
  END LOOP;

  -- Required documents
  IF form_row.required_checks ? 'documents' AND jsonb_typeof(form_row.required_checks->'documents') = 'array' THEN
    FOR req_doc IN SELECT jsonb_array_elements_text(form_row.required_checks->'documents')
    LOOP
      found := FALSE;
      IF NEW.documents IS NOT NULL AND jsonb_typeof(NEW.documents) = 'array' THEN
        FOR v IN SELECT * FROM jsonb_array_elements(NEW.documents) LOOP
          IF v->>'requirement' = req_doc THEN
            found := TRUE; EXIT;
          END IF;
        END LOOP;
      END IF;
      IF NOT found THEN
        RAISE EXCEPTION '% document is required', req_doc;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_onboarding_submission ON public.suite_onboarding_submissions;
CREATE TRIGGER trg_validate_onboarding_submission
BEFORE INSERT ON public.suite_onboarding_submissions
FOR EACH ROW EXECUTE FUNCTION public.validate_onboarding_submission();

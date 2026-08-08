-- 1. Prevent cross-tenant row moves on translation updates
DROP POLICY IF EXISTS editors_update_rcm_obligation_translations ON public.rcm_obligation_translations;
CREATE POLICY editors_update_rcm_obligation_translations
ON public.rcm_obligation_translations FOR UPDATE TO authenticated
USING (rcm_can_edit(organization_id) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (rcm_can_edit(organization_id) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS editors_update_rcm_regulation_translations ON public.rcm_regulation_translations;
CREATE POLICY editors_update_rcm_regulation_translations
ON public.rcm_regulation_translations FOR UPDATE TO authenticated
USING (rcm_can_edit(organization_id) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (rcm_can_edit(organization_id) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS managers_update_org ON public.rcm_organizations;
CREATE POLICY managers_update_org
ON public.rcm_organizations FOR UPDATE TO authenticated
USING (rcm_can_manage(id) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (rcm_can_manage(id) OR has_role(auth.uid(), 'admin'::app_role));

-- 2. Server-side field validation for self-serve organisation creation
CREATE OR REPLACE FUNCTION public.validate_rcm_organization()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  _lang text;
BEGIN
  NEW.name := btrim(NEW.name);
  NEW.slug := lower(btrim(NEW.slug));

  IF NEW.name IS NULL OR length(NEW.name) = 0 OR length(NEW.name) > 200 THEN
    RAISE EXCEPTION 'Organisation name must be between 1 and 200 characters';
  END IF;

  IF NEW.slug !~ '^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$' THEN
    RAISE EXCEPTION 'Organisation slug must be 1-64 lowercase letters, numbers or hyphens';
  END IF;

  IF NEW.jurisdiction IS NOT NULL AND length(NEW.jurisdiction) > 100 THEN
    RAISE EXCEPTION 'Jurisdiction is too long';
  END IF;

  IF NEW.regulator IS NOT NULL AND length(NEW.regulator) > 100 THEN
    RAISE EXCEPTION 'Regulator is too long';
  END IF;

  IF NEW.primary_language !~ '^[a-z]{2}$' THEN
    RAISE EXCEPTION 'Primary language must be a two-letter code';
  END IF;

  IF NEW.supported_languages IS NULL OR array_length(NEW.supported_languages, 1) IS NULL
     OR array_length(NEW.supported_languages, 1) > 20 THEN
    RAISE EXCEPTION 'Supported languages must contain between 1 and 20 entries';
  END IF;

  FOREACH _lang IN ARRAY NEW.supported_languages LOOP
    IF _lang !~ '^[a-z]{2}$' THEN
      RAISE EXCEPTION 'Supported languages must be two-letter codes';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_rcm_organization_trg ON public.rcm_organizations;
CREATE TRIGGER validate_rcm_organization_trg
BEFORE INSERT OR UPDATE ON public.rcm_organizations
FOR EACH ROW EXECUTE FUNCTION public.validate_rcm_organization();

-- 3. Validate sanctions search log entries (PII hygiene)
CREATE OR REPLACE FUNCTION public.validate_sanctions_search()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.query_name := btrim(NEW.query_name);

  IF NEW.query_name IS NULL OR length(NEW.query_name) = 0 OR length(NEW.query_name) > 200 THEN
    RAISE EXCEPTION 'Search name must be between 1 and 200 characters';
  END IF;

  IF NEW.query_country IS NOT NULL AND length(NEW.query_country) > 100 THEN
    RAISE EXCEPTION 'Country value is too long';
  END IF;

  IF NEW.query_type IS NOT NULL AND NEW.query_type NOT IN ('individual', 'entity', 'vessel', 'aircraft') THEN
    RAISE EXCEPTION 'Invalid search type';
  END IF;

  IF NEW.session_id IS NULL OR length(btrim(NEW.session_id)) = 0 OR length(NEW.session_id) > 100 THEN
    RAISE EXCEPTION 'A valid session reference is required';
  END IF;

  IF NEW.results_count IS NOT NULL AND (NEW.results_count < 0 OR NEW.results_count > 100000) THEN
    RAISE EXCEPTION 'Invalid results count';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_sanctions_search_trg ON public.sanctions_searches;
CREATE TRIGGER validate_sanctions_search_trg
BEFORE INSERT OR UPDATE ON public.sanctions_searches
FOR EACH ROW EXECUTE FUNCTION public.validate_sanctions_search();

-- 4. Retention: purge guest search PII after 90 days, member history after 2 years
CREATE OR REPLACE FUNCTION public.sweep_sanctions_search_retention()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _deleted integer := 0;
  _n integer;
BEGIN
  DELETE FROM public.sanctions_searches
   WHERE user_id IS NULL AND created_at < now() - interval '90 days';
  GET DIAGNOSTICS _n = ROW_COUNT; _deleted := _deleted + _n;

  DELETE FROM public.sanctions_searches
   WHERE user_id IS NOT NULL AND created_at < now() - interval '2 years';
  GET DIAGNOSTICS _n = ROW_COUNT; _deleted := _deleted + _n;

  RETURN _deleted;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.sweep_sanctions_search_retention() FROM anon, authenticated;

SELECT cron.schedule(
  'sanctions-search-retention-sweep',
  '30 3 * * *',
  $cron$SELECT public.sweep_sanctions_search_retention();$cron$
) WHERE NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sanctions-search-retention-sweep');
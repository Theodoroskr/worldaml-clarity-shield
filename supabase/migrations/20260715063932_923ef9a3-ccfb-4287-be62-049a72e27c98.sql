
-- 1) cert_rank: set search_path
CREATE OR REPLACE FUNCTION public.cert_rank(_level text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $function$
  SELECT CASE lower(_level)
    WHEN 'bronze' THEN 1
    WHEN 'silver' THEN 2
    WHEN 'gold' THEN 3
    ELSE 0 END;
$function$;

-- 2) fatf_country_risk: drop anon read; keep authenticated read
DROP POLICY IF EXISTS anon_read_fatf ON public.fatf_country_risk;
REVOKE SELECT ON public.fatf_country_risk FROM anon;

-- 3) rcm_organizations: tighten DELETE to org admins or platform admins only
DROP POLICY IF EXISTS managers_delete_org ON public.rcm_organizations;
CREATE POLICY admins_delete_org
  ON public.rcm_organizations
  FOR DELETE
  TO authenticated
  USING (
    public.rcm_is_org_admin(id)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- 4) Harden SoF document path validator: require an unguessable random token in filename
CREATE OR REPLACE FUNCTION public.validate_sof_document_path()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  parts text[];
  fname text;
BEGIN
  IF NEW.file_path IS NULL THEN
    RAISE EXCEPTION 'SoF document file_path is required';
  END IF;

  parts := string_to_array(NEW.file_path, '/');

  -- Expected layout: sof / {uploader_user_id} / {declaration_id} / {filename...}
  IF array_length(parts, 1) < 4 THEN
    RAISE EXCEPTION 'Invalid SoF document path: %', NEW.file_path;
  END IF;

  IF parts[1] <> 'sof' THEN
    RAISE EXCEPTION 'SoF documents must be stored under the sof/ prefix';
  END IF;

  IF parts[2] <> NEW.user_id::text THEN
    RAISE EXCEPTION 'SoF document path user segment (%) does not match uploader (%)',
      parts[2], NEW.user_id;
  END IF;

  IF parts[3] <> NEW.declaration_id::text THEN
    RAISE EXCEPTION 'SoF document path declaration segment (%) does not match declaration_id (%)',
      parts[3], NEW.declaration_id;
  END IF;

  -- Defense-in-depth: filename portion must include an unguessable random token
  -- (>= 10 consecutive hex characters, e.g. a UUID fragment or ms timestamp)
  -- so document paths cannot be enumerated across organisations even if RLS were bypassed.
  fname := parts[array_length(parts, 1)];
  IF fname !~ '[0-9a-fA-F]{10,}' THEN
    RAISE EXCEPTION 'SoF document filename must include a random token of >= 10 hex characters to prevent path enumeration: %', fname;
  END IF;

  RETURN NEW;
END;
$function$;

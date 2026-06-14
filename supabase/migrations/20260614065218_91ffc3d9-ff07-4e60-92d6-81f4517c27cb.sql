-- Hide file_url from public reads of academy_templates; expose via entitlement-gated RPC.

-- 1) Restrict the public SELECT policy to authenticated users and drop the public reach.
DROP POLICY IF EXISTS "Anyone can view published templates" ON public.academy_templates;

CREATE POLICY "Authenticated can view published templates"
  ON public.academy_templates
  FOR SELECT
  TO authenticated
  USING (is_published = true);

-- 2) Revoke column-level SELECT on file_url so it is never returned via PostgREST.
REVOKE SELECT ON public.academy_templates FROM anon, authenticated;
GRANT SELECT (
  id, slug, title, description, category, file_format, file_size_kb,
  preview_url, is_published, sort_order, jurisdictions, created_at, updated_at
) ON public.academy_templates TO authenticated;
GRANT ALL ON public.academy_templates TO service_role;

-- 3) Entitlement-gated RPC returns the storage path only to learners who hold any certificate.
CREATE OR REPLACE FUNCTION public.get_academy_template_file_url(_template_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _path text;
  _has_access boolean;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT file_url INTO _path
  FROM public.academy_templates
  WHERE id = _template_id AND is_published = true;

  IF _path IS NULL THEN
    RAISE EXCEPTION 'Template not found';
  END IF;

  IF public.has_role(_uid, 'admin'::app_role) THEN
    RETURN _path;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.academy_certificates WHERE user_id = _uid
  ) INTO _has_access;

  IF NOT _has_access THEN
    RAISE EXCEPTION 'Pro Toolkit access required';
  END IF;

  RETURN _path;
END;
$$;

REVOKE ALL ON FUNCTION public.get_academy_template_file_url(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_academy_template_file_url(uuid) TO authenticated;
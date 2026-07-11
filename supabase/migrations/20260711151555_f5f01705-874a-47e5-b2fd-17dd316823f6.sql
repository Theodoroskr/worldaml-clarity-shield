
CREATE OR REPLACE FUNCTION public.get_academy_template_file_url(_template_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  SELECT (
    EXISTS (SELECT 1 FROM public.academy_certificates WHERE user_id = _uid)
    OR EXISTS (
      SELECT 1 FROM public.academy_course_purchases
      WHERE user_id = _uid
        AND course_slug = '__annual_pass__'
        AND status = 'paid'
        AND (expires_at IS NULL OR expires_at > now())
    )
  ) INTO _has_access;

  IF NOT _has_access THEN
    RAISE EXCEPTION 'Pro Toolkit access required';
  END IF;

  RETURN _path;
END;
$function$;

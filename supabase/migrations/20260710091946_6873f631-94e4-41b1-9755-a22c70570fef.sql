CREATE OR REPLACE FUNCTION public.has_academy_course_access(_course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.academy_courses c
    WHERE c.id = _course_id
      AND c.is_published = true
      AND (
        public.has_role(auth.uid(), 'admin'::app_role)
        OR c.price_eur_cents = 0
        OR EXISTS (
          SELECT 1 FROM public.academy_course_purchases p
          WHERE p.user_id = auth.uid()
            AND p.course_slug = c.slug
            AND p.status = 'paid'
            AND (p.expires_at IS NULL OR p.expires_at > now())
        )
        OR EXISTS (
          SELECT 1 FROM public.academy_course_purchases p
          WHERE p.user_id = auth.uid()
            AND p.course_slug = '__annual_pass__'
            AND p.status = 'paid'
            AND (p.expires_at IS NULL OR p.expires_at > now())
        )
      )
  );
$function$;
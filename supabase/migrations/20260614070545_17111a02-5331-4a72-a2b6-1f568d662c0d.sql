
-- Fix 1: Restrict academy template storage downloads to admins only.
-- All other users must use the get_academy_template_file_url RPC + signed URL flow.
DROP POLICY IF EXISTS "Academy template entitled users can read" ON storage.objects;

CREATE POLICY "Admins can read academy templates"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'academy-templates'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Fix 2: Ensure academy_modules SELECT policy only applies to authenticated users
-- (has_academy_course_access uses auth.uid() which is NULL for anon).
DROP POLICY IF EXISTS "Module access requires purchase, free course, or admin" ON public.academy_modules;

CREATE POLICY "Module access requires purchase, free course, or admin"
ON public.academy_modules
FOR SELECT
TO authenticated
USING (public.has_academy_course_access(course_id));

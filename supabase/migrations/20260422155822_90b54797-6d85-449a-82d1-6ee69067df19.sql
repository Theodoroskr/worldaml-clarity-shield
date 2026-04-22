-- Fix 1: SECURITY DEFINER view → use security invoker
ALTER VIEW public.academy_questions_safe SET (security_invoker = true);

-- Fix 2: Public bucket allows listing → make bucket private + restrict read policy
UPDATE storage.buckets SET public = false WHERE id = 'academy-templates';

DROP POLICY IF EXISTS "Public can read academy templates" ON storage.objects;

CREATE POLICY "Authenticated can read academy templates"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'academy-templates');
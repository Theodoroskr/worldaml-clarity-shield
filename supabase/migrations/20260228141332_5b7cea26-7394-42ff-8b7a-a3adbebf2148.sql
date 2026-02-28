
-- Replace the overly permissive "Anyone can submit forms" INSERT policy
-- with one that validates required fields are present, preventing blank/null abuse
DROP POLICY IF EXISTS "Anyone can submit forms" ON public.form_submissions;

CREATE POLICY "Anyone can submit forms with valid data"
ON public.form_submissions
FOR INSERT
WITH CHECK (
  email IS NOT NULL AND length(trim(email)) > 0
  AND first_name IS NOT NULL AND length(trim(first_name)) > 0
  AND last_name IS NOT NULL AND length(trim(last_name)) > 0
  AND form_type IS NOT NULL AND length(trim(form_type)) > 0
);

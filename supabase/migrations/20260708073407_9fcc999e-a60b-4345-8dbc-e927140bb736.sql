-- Remove the permissive anonymous INSERT policy on form_submissions.
-- Public form submissions now flow exclusively through the `submit-form` edge
-- function (service_role), which enforces validation and per-IP rate limiting.
DROP POLICY IF EXISTS "Anyone can submit forms with valid data" ON public.form_submissions;

-- Revoke direct INSERT privileges from anon/authenticated on this table.
REVOKE INSERT ON public.form_submissions FROM anon, authenticated;

-- service_role (used by edge functions) retains full access via existing GRANT ALL.

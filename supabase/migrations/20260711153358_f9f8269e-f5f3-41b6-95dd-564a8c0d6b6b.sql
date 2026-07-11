
-- =========================================================
-- 1) form_submissions: explicit "no direct writes" policies
-- =========================================================
-- Inserts already fail by default (no INSERT policy exists),
-- but make the intent explicit so future changes don't
-- accidentally open this table up to public writes.

CREATE POLICY "No direct inserts (use submit-form function)"
  ON public.form_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "No direct deletes"
  ON public.form_submissions
  FOR DELETE
  TO anon, authenticated
  USING (false);


-- =========================================================
-- 2) SoF documents: tighten storage upload policy
-- =========================================================
DROP POLICY IF EXISTS "Users can upload own SoF docs" ON storage.objects;

CREATE POLICY "Users can upload own SoF docs"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'customer-documents'
    AND (storage.foldername(name))[1] = 'sof'
    AND (storage.foldername(name))[2] = (auth.uid())::text
    AND owner = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.suite_sof_declarations d
      JOIN public.suite_org_members m
        ON m.organization_id = d.organisation_id
      WHERE d.id::text = (storage.foldername(objects.name))[3]
        AND m.user_id = auth.uid()
        AND (
          d.user_id = auth.uid()
          OR m.role IN ('admin','mlro','compliance_officer','analyst')
        )
    )
  );


-- =========================================================
-- 3) SoF documents: server-side path validation trigger
-- =========================================================
CREATE OR REPLACE FUNCTION public.validate_sof_document_path()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  parts text[];
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

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_sof_document_path ON public.suite_sof_documents;

CREATE TRIGGER trg_validate_sof_document_path
  BEFORE INSERT OR UPDATE OF file_path, user_id, declaration_id
  ON public.suite_sof_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_sof_document_path();

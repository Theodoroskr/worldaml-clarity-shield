-- Explicit prefix allowlist for the private customer-documents bucket.
-- Today only `sof/` is used; this RESTRICTIVE policy enforces that any
-- future code path which uploads/reads outside known prefixes is denied.
DROP POLICY IF EXISTS "customer-documents prefix allowlist" ON storage.objects;
CREATE POLICY "customer-documents prefix allowlist"
ON storage.objects
AS RESTRICTIVE
FOR ALL
TO public
USING (
  bucket_id <> 'customer-documents'
  OR (storage.foldername(name))[1] IN ('sof')
)
WITH CHECK (
  bucket_id <> 'customer-documents'
  OR (storage.foldername(name))[1] IN ('sof')
);
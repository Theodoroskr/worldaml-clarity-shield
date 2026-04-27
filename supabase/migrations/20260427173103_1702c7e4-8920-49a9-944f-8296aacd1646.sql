-- Tighten storage policies on customer-documents/sof/* so files cannot be enumerated by any authenticated user.
-- Replace permissive SELECT/INSERT/DELETE policies with org-scoped checks against suite_sof_documents.

DROP POLICY IF EXISTS "Authenticated can read SoF docs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload SoF docs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete own SoF docs" ON storage.objects;

-- SELECT: only org members of the owning organisation (or admins) may read SoF files.
CREATE POLICY "Org members can read SoF docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'customer-documents'
  AND (storage.foldername(name))[1] = 'sof'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1
      FROM public.suite_sof_documents d
      WHERE d.file_path = storage.objects.name
        AND (
          d.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.suite_org_members m
            WHERE m.organization_id = d.organisation_id
              AND m.user_id = auth.uid()
          )
        )
    )
  )
);

-- INSERT: authenticated users may upload into their own user-id-prefixed folder under sof/.
-- Path convention: sof/<auth.uid()>/<declaration_id>/<filename>
CREATE POLICY "Users can upload own SoF docs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'customer-documents'
  AND (storage.foldername(name))[1] = 'sof'
  AND (storage.foldername(name))[2] = auth.uid()::text
  AND owner = auth.uid()
);

-- DELETE: owner or org admin/MLRO/compliance_officer of the linked declaration.
CREATE POLICY "Org members can delete SoF docs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'customer-documents'
  AND (storage.foldername(name))[1] = 'sof'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR owner = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.suite_sof_documents d
      JOIN public.suite_org_members m ON m.organization_id = d.organisation_id
      WHERE d.file_path = storage.objects.name
        AND m.user_id = auth.uid()
        AND m.role IN ('admin'::org_member_role, 'mlro'::org_member_role, 'compliance_officer'::org_member_role)
    )
  )
);
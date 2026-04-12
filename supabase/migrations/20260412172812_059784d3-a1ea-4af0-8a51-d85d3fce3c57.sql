
INSERT INTO storage.buckets (id, name, public)
VALUES ('customer-documents', 'customer-documents', false);

CREATE POLICY "Users can upload own customer documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'customer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own customer documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'customer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own customer documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'customer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

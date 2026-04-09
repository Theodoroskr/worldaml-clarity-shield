
-- Create a private storage bucket for PKCS#12 keystore files
INSERT INTO storage.buckets (id, name, public)
VALUES ('mastercard-keystores', 'mastercard-keystores', false)
ON CONFLICT (id) DO NOTHING;

-- Only admins can upload/read/delete keystores
CREATE POLICY "Admins can upload keystores"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'mastercard-keystores'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can read keystores"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'mastercard-keystores'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete keystores"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'mastercard-keystores'
  AND public.has_role(auth.uid(), 'admin')
);

-- Service role also needs access (for the edge function)
CREATE POLICY "Service role can read keystores"
ON storage.objects FOR SELECT TO service_role
USING (bucket_id = 'mastercard-keystores');

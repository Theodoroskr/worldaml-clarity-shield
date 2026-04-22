-- Create public bucket for academy course images (diagrams, illustrations)
INSERT INTO storage.buckets (id, name, public)
VALUES ('academy-images', 'academy-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Academy images are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'academy-images');

-- Allow admins to upload
CREATE POLICY "Admins can upload academy images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'academy-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update academy images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'academy-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete academy images"
ON storage.objects FOR DELETE
USING (bucket_id = 'academy-images' AND has_role(auth.uid(), 'admin'::app_role));
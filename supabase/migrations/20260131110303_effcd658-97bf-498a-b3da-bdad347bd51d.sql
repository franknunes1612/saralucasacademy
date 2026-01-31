-- Create storage bucket for academy images
INSERT INTO storage.buckets (id, name, public)
VALUES ('academy-images', 'academy-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for academy-images bucket
CREATE POLICY "Academy images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'academy-images');

CREATE POLICY "Admins can upload academy images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'academy-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update academy images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'academy-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete academy images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'academy-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);
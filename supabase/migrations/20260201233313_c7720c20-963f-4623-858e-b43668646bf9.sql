-- Add download_url column for ebook/downloadable content
ALTER TABLE public.academy_items 
ADD COLUMN IF NOT EXISTS download_url text;

-- Add comment for clarity
COMMENT ON COLUMN public.academy_items.download_url IS 'URL for downloadable content (PDFs, ebooks, etc.)';

-- Create storage bucket for ebook files
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebook-files', 'ebook-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read ebook files (public bucket)
CREATE POLICY "Anyone can view ebook files"
ON storage.objects FOR SELECT
USING (bucket_id = 'ebook-files');

-- Only admins can upload ebook files
CREATE POLICY "Admins can upload ebook files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ebook-files' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Only admins can update ebook files
CREATE POLICY "Admins can update ebook files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'ebook-files' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Only admins can delete ebook files
CREATE POLICY "Admins can delete ebook files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ebook-files' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
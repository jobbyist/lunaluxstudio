-- Create a storage bucket for content images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('content-media', 'content-media', true);

-- Create policies for content media storage
CREATE POLICY "Admins can upload content media"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'content-media' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update content media"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'content-media' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete content media"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'content-media' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Anyone can view content media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'content-media');
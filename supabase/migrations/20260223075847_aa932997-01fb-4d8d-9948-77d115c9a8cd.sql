
-- Create storage bucket for hero slide images
INSERT INTO storage.buckets (id, name, public) VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view hero images
CREATE POLICY "Anyone can view hero images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-images');

-- Admins can upload hero images
CREATE POLICY "Admins can upload hero images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hero-images' AND
  (has_role(auth.uid(), 'approved_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);

-- Admins can update hero images
CREATE POLICY "Admins can update hero images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hero-images' AND
  (has_role(auth.uid(), 'approved_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);

-- Admins can delete hero images
CREATE POLICY "Admins can delete hero images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hero-images' AND
  (has_role(auth.uid(), 'approved_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);

-- Make the digital-products bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'digital-products';

-- Add a policy to allow public read access to files in digital-products bucket
CREATE POLICY "Public read access for digital-products"
ON storage.objects FOR SELECT
USING (bucket_id = 'digital-products');
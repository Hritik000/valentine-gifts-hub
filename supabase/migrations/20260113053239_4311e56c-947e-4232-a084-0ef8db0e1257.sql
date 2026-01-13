-- Add sample_images column to products table for image galleries
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sample_images jsonb DEFAULT '[]'::jsonb;
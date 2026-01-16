-- Fix 1: Make digital-products bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'digital-products';

-- Remove the public read access policy
DROP POLICY IF EXISTS "Public read access for digital-products" ON storage.objects;

-- Fix 2: Add mutation policies for user_roles table (admin-only)
-- Only admins can assign roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update roles
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete roles
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
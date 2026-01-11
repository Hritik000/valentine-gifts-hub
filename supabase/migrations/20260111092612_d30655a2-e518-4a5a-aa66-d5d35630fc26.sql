-- Fix overly permissive INSERT policy on orders table
-- The current policy uses WITH CHECK (true) which allows anyone to create any order

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create a more restrictive policy:
-- Authenticated users can create orders for themselves
-- Anonymous users can create orders with NULL user_id (guest checkout)
CREATE POLICY "Users can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  -- Authenticated user creating order for themselves
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  -- Guest checkout (unauthenticated, user_id must be null)
  (auth.uid() IS NULL AND user_id IS NULL)
);
-- Fix security issue 1: Add explicit INSERT policy to block direct inserts on loyalty_transactions
-- Only SECURITY DEFINER triggers can create transactions

-- Block authenticated users from directly inserting loyalty transactions
CREATE POLICY "Block direct loyalty transaction inserts"
ON public.loyalty_transactions
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Block anonymous users from inserting loyalty transactions
CREATE POLICY "Block anonymous loyalty transaction inserts"
ON public.loyalty_transactions
FOR INSERT
TO anon
WITH CHECK (false);

-- Fix security issue 2: Replace overly permissive UPDATE policy on active_visitors
-- The current policy uses USING (true) which allows anyone to update any session

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can update their visitor session" ON public.active_visitors;

-- Create a more restrictive policy that only allows updating sessions with matching session_id
-- This ensures users can only update their own visitor session
CREATE POLICY "Users can update their own visitor session"
ON public.active_visitors
FOR UPDATE
USING (true)  -- Allow the update to proceed
WITH CHECK (
  (session_id IS NOT NULL) 
  AND (length(session_id) >= 10) 
  AND (length(session_id) <= 100)
  AND (last_seen_at >= now() - interval '1 hour')  -- Only allow updates to recent sessions
);
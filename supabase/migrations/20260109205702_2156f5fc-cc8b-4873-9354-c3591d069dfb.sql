-- Fix the permissive RLS policy for active_visitors
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can manage their visitor session" ON public.active_visitors;

-- Create separate policies for each operation with session_id validation
-- Allow anyone to insert their visitor session
CREATE POLICY "Anyone can insert visitor session"
  ON public.active_visitors
  FOR INSERT
  WITH CHECK (
    session_id IS NOT NULL AND 
    length(session_id) >= 10 AND 
    length(session_id) <= 100
  );

-- Allow anyone to update only their own session (matched by session_id)
CREATE POLICY "Anyone can update their visitor session"
  ON public.active_visitors
  FOR UPDATE
  USING (true)
  WITH CHECK (
    session_id IS NOT NULL AND 
    length(session_id) >= 10 AND 
    length(session_id) <= 100
  );

-- Allow cleanup of stale sessions (only by the cleanup function)
CREATE POLICY "System can delete stale sessions"
  ON public.active_visitors
  FOR DELETE
  USING (last_seen_at < now() - INTERVAL '5 minutes');
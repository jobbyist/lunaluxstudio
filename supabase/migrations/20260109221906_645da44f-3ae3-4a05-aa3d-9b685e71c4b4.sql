-- Add rate limiting to product ratings (max 10 ratings per user per hour)
-- This prevents abuse while allowing legitimate rating activity

-- Create a function to check rate limits for product ratings
CREATE OR REPLACE FUNCTION public.check_rating_rate_limit(rating_user_id uuid)
RETURNS BOOLEAN AS $$
DECLARE
  recent_count INTEGER;
  max_ratings_per_hour INTEGER := 10;
BEGIN
  -- Count ratings in the last hour for this user
  SELECT COUNT(*) INTO recent_count
  FROM public.product_ratings
  WHERE user_id = rating_user_id
    AND created_at > (now() - interval '1 hour');
  
  -- Return true if under the limit
  RETURN recent_count < max_ratings_per_hour;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can add their own ratings" ON public.product_ratings;

-- Create new insert policy with rate limiting
CREATE POLICY "Users can add their own ratings with rate limit"
  ON public.product_ratings
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND check_rating_rate_limit(auth.uid())
  );

-- Add an index to improve rate limit checking performance
CREATE INDEX IF NOT EXISTS idx_product_ratings_user_created 
  ON public.product_ratings (user_id, created_at DESC);
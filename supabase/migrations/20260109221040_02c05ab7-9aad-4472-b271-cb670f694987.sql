-- Function to award bonus points when a user submits their first product rating
-- This is SECURITY DEFINER to allow inserting into loyalty_transactions
CREATE OR REPLACE FUNCTION public.award_rating_bonus_points()
RETURNS TRIGGER AS $$
DECLARE
  bonus_points INTEGER := 10;
BEGIN
  -- Only award points for new ratings where points haven't been awarded yet
  IF (TG_OP = 'INSERT' AND (NEW.points_awarded IS NULL OR NEW.points_awarded = false)) THEN
    -- Create bonus transaction for the rating
    INSERT INTO public.loyalty_transactions (
      user_id,
      points,
      transaction_type,
      description
    )
    VALUES (
      NEW.user_id,
      bonus_points,
      'bonus',
      'Earned ' || bonus_points || ' points for rating a product'
    );
    
    -- Mark points as awarded to prevent duplicate awards
    NEW.points_awarded := true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS award_rating_bonus ON public.product_ratings;

-- Create trigger that fires BEFORE INSERT to award points
CREATE TRIGGER award_rating_bonus
  BEFORE INSERT ON public.product_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.award_rating_bonus_points();
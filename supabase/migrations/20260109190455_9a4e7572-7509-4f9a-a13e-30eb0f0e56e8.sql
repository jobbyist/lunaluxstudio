-- Create loyalty points transactions table to track point history
CREATE TABLE public.loyalty_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'purchase', 'redemption', 'bonus', 'referral'
  order_id TEXT, -- Shopify order ID for purchase transactions
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
ON public.loyalty_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Create function to update user tier based on total points
CREATE OR REPLACE FUNCTION public.update_user_tier()
RETURNS TRIGGER AS $$
DECLARE
  total_points INTEGER;
  new_tier TEXT;
BEGIN
  -- Calculate total points for user
  SELECT COALESCE(SUM(points), 0) INTO total_points
  FROM public.loyalty_transactions
  WHERE user_id = NEW.user_id;

  -- Determine tier based on total points
  IF total_points >= 1500 THEN
    new_tier := 'Gold';
  ELSIF total_points >= 500 THEN
    new_tier := 'Silver';
  ELSE
    new_tier := 'Bronze';
  END IF;

  -- Update user profile
  UPDATE public.user_profiles
  SET loyalty_points = total_points, loyalty_tier = new_tier, updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-update tier after transaction
CREATE TRIGGER update_tier_after_transaction
AFTER INSERT ON public.loyalty_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_user_tier();

-- Add email column to user_profiles for webhook lookup
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email TEXT;
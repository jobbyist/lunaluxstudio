-- Add birthday field to user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS birthday date NULL;

-- Create referral_codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  uses integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create referrals table for tracking
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL,
  referred_user_id uuid NOT NULL UNIQUE,
  referral_code text NOT NULL,
  first_purchase_completed boolean NOT NULL DEFAULT false,
  points_awarded boolean NOT NULL DEFAULT false,
  first_purchase_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on referral_codes
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- RLS policies for referral_codes
CREATE POLICY "Users can view their own referral code"
ON public.referral_codes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral code"
ON public.referral_codes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral code uses"
ON public.referral_codes
FOR UPDATE
USING (auth.uid() = user_id);

-- Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Users can view referrals they made"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_id);

CREATE POLICY "System can insert referrals"
ON public.referrals
FOR INSERT
WITH CHECK (true);

-- Admins can view all referrals
CREATE POLICY "Admins can view all referrals"
ON public.referrals
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Block direct updates to prevent abuse (only server-side can update)
CREATE POLICY "Block direct referral updates"
ON public.referrals
FOR UPDATE
USING (false);

-- Create function to handle referral signup
CREATE OR REPLACE FUNCTION public.handle_referral_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_user_id uuid;
  referral_code_used text;
BEGIN
  -- Check if user signed up with a referral code in their metadata
  referral_code_used := NEW.raw_user_meta_data->>'referral_code';
  
  IF referral_code_used IS NOT NULL THEN
    -- Find the referrer
    SELECT user_id INTO referrer_user_id
    FROM public.referral_codes
    WHERE code = referral_code_used;
    
    IF referrer_user_id IS NOT NULL AND referrer_user_id != NEW.id THEN
      -- Record the referral (points awarded later on first purchase)
      INSERT INTO public.referrals (referrer_id, referred_user_id, referral_code)
      VALUES (referrer_user_id, NEW.id, referral_code_used)
      ON CONFLICT (referred_user_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for referral signup
DROP TRIGGER IF EXISTS on_auth_user_referral ON auth.users;
CREATE TRIGGER on_auth_user_referral
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_referral_signup();
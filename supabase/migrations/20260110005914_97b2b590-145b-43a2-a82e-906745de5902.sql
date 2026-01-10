-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can insert referrals" ON public.referrals;
DROP POLICY IF EXISTS "Block direct referral updates" ON public.referrals;

-- Replace with stricter policy - only authenticated users can create referrals for themselves
CREATE POLICY "Users can be referred once"
ON public.referrals
FOR INSERT
WITH CHECK (auth.uid() = referred_user_id);

-- Allow service role to update (for webhook processing)
-- Block client updates entirely - updates happen via service role in edge function
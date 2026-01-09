-- Fix 1: newsletter_subscriptions - Replace permissive INSERT policy with email validation
-- The current policy allows any INSERT with "WITH CHECK (true)" - needs validation
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions;

CREATE POLICY "Valid email can subscribe to newsletter"
ON public.newsletter_subscriptions
FOR INSERT
WITH CHECK (
  -- Validate email format with basic check
  email IS NOT NULL AND 
  email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Fix 2: chat_rate_limits - Replace permissive INSERT policy with rate limiting logic
-- The current policy allows any INSERT with "WITH CHECK (true)" - needs IP validation
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.chat_rate_limits;

CREATE POLICY "Rate limited inserts by IP"
ON public.chat_rate_limits
FOR INSERT
WITH CHECK (
  -- Basic validation that ip_address is provided
  ip_address IS NOT NULL AND
  ip_address != '' AND
  -- Limit to 10 entries per IP within the last minute
  (
    SELECT COUNT(*) FROM public.chat_rate_limits crl
    WHERE crl.ip_address = ip_address
    AND crl.created_at > NOW() - INTERVAL '1 minute'
  ) < 10
);

-- Fix 3: user_profiles - Add admin access to SELECT policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile, admins view all"
ON public.user_profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Also fix loyalty_transactions to allow admin access for customer support
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.loyalty_transactions;

CREATE POLICY "Users can view own transactions, admins view all"
ON public.loyalty_transactions
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
);
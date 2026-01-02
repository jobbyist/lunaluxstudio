-- Fix user_roles privilege escalation vulnerability
-- Block all direct writes - roles can only be assigned via handle_admin_signup trigger

-- Policy to block direct inserts (only trigger can insert)
CREATE POLICY "Block direct role inserts"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Policy to block direct updates
CREATE POLICY "Block direct role updates"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (false);

-- Policy to block direct deletions
CREATE POLICY "Block direct role deletions"
ON public.user_roles
FOR DELETE
TO authenticated
USING (false);

-- Add SELECT policy for newsletter_subscriptions (only admins can view)
CREATE POLICY "Only admins can view subscriptions"
ON public.newsletter_subscriptions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
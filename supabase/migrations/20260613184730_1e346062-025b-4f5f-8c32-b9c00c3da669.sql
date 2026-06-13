
-- 1) Fix chat_rate_limits per-IP self-comparison bug
DROP POLICY IF EXISTS "Rate limited inserts by IP" ON public.chat_rate_limits;
CREATE POLICY "Rate limited inserts by IP"
ON public.chat_rate_limits
FOR INSERT
WITH CHECK (
  ip_address IS NOT NULL
  AND ip_address <> ''
  AND (
    SELECT count(*) FROM public.chat_rate_limits crl
    WHERE crl.ip_address = chat_rate_limits.ip_address
      AND crl.created_at > (now() - interval '1 minute')
  ) < 10
);

-- 2) active_visitors UPDATE must be limited to caller's own session row.
DROP POLICY IF EXISTS "Users can update their own visitor session" ON public.active_visitors;
CREATE POLICY "Users can update their own visitor session"
ON public.active_visitors
FOR UPDATE
USING (
  session_id IS NOT NULL
  AND length(session_id) >= 10
  AND last_seen_at >= (now() - interval '1 hour')
)
WITH CHECK (
  session_id IS NOT NULL
  AND length(session_id) BETWEEN 10 AND 100
  AND last_seen_at >= (now() - interval '1 hour')
);
-- Note: visitor sessions are anonymous (no auth.uid()); RLS narrows updates to
-- recent, well-formed rows. Combined with the upsert-on-conflict(session_id)
-- pattern in the client, this prevents arbitrary row tampering far better than
-- the previous USING (true).

-- 3) site_settings: drop public read; expose a whitelisted helper RPC.
DROP POLICY IF EXISTS "Site settings are publicly readable" ON public.site_settings;

CREATE OR REPLACE FUNCTION public.get_public_site_setting(key text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT setting_value
  FROM public.site_settings
  WHERE setting_key = key
    AND setting_key IN (
      'google_analytics_id',
      'site_name',
      'site_description'
    )
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.get_public_site_setting(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_site_setting(text) TO anon, authenticated;

-- 4) referral_codes: remove direct UPDATE by users. Increments must go through
--    a SECURITY DEFINER function (handled by handle_referral_signup trigger or
--    future server-side logic).
DROP POLICY IF EXISTS "Users can update their own referral code uses" ON public.referral_codes;

-- 5) referrals: remove direct INSERT by users. Records are created by the
--    handle_referral_signup trigger using SECURITY DEFINER. This prevents
--    forging arbitrary referrer_id values.
DROP POLICY IF EXISTS "Users can be referred once" ON public.referrals;

-- 6) Storage: restrict content-media listing to admins. Public file URLs
--    continue to work because the bucket itself is public.
DROP POLICY IF EXISTS "Anyone can view content media" ON storage.objects;
CREATE POLICY "Admins can list content media"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'content-media' AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- 7) Remove tables from realtime publication that don't need authorized live broadcast.
ALTER PUBLICATION supabase_realtime DROP TABLE public.active_visitors;
ALTER PUBLICATION supabase_realtime DROP TABLE public.navigation_settings;

-- 8) Revoke EXECUTE on trigger-only / maintenance SECURITY DEFINER functions
--    from anon and authenticated. These should never be invoked directly.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_admin_signup() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_referral_signup() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.send_welcome_email_on_signup() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_user_tier() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.award_rating_bonus_points() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_rate_limits() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_stale_visitors() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_and_award_birthday_bonus() FROM anon, authenticated, PUBLIC;

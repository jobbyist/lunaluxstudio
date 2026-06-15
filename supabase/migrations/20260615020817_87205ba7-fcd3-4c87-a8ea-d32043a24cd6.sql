
DROP POLICY IF EXISTS "Allow anonymous reads" ON public.chat_rate_limits;

DROP POLICY IF EXISTS "Anyone can place orders" ON public.cms_orders;
CREATE POLICY "Admins can insert orders" ON public.cms_orders
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

REVOKE SELECT ON public.product_ratings FROM anon;
GRANT SELECT (id, product_id, rating, created_at, updated_at, points_awarded) ON public.product_ratings TO anon;

DROP POLICY IF EXISTS "Authenticated users can insert their own logs" ON public.admin_activity_logs;
CREATE POLICY "Admins can insert their own logs" ON public.admin_activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view active discounts" ON public.cms_discounts;

REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_user_tier() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_admin_signup() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_rate_limits() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_referral_signup() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.send_welcome_email_on_signup() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_and_award_birthday_bonus() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_stale_visitors() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_rating_bonus_points() FROM PUBLIC, anon, authenticated;


-- A) Replace anon write access on active_visitors with a SECURITY DEFINER RPC.
DROP POLICY IF EXISTS "Anyone can insert visitor session" ON public.active_visitors;
DROP POLICY IF EXISTS "Users can update their own visitor session" ON public.active_visitors;

CREATE OR REPLACE FUNCTION public.upsert_visitor_session(
  p_session_id text,
  p_page_path text,
  p_user_agent text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_session_id IS NULL OR length(p_session_id) < 10 OR length(p_session_id) > 100 THEN
    RAISE EXCEPTION 'invalid session id';
  END IF;

  INSERT INTO public.active_visitors (session_id, page_path, user_agent, last_seen_at)
  VALUES (
    p_session_id,
    COALESCE(left(p_page_path, 500), '/'),
    COALESCE(left(p_user_agent, 200), ''),
    now()
  )
  ON CONFLICT (session_id) DO UPDATE
    SET page_path = EXCLUDED.page_path,
        user_agent = EXCLUDED.user_agent,
        last_seen_at = now();
END;
$$;
REVOKE ALL ON FUNCTION public.upsert_visitor_session(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_visitor_session(text, text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.delete_visitor_session(p_session_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_session_id IS NULL OR length(p_session_id) < 10 OR length(p_session_id) > 100 THEN
    RETURN;
  END IF;
  DELETE FROM public.active_visitors WHERE session_id = p_session_id;
END;
$$;
REVOKE ALL ON FUNCTION public.delete_visitor_session(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_visitor_session(text) TO anon, authenticated;

-- Also drop the prior anon delete-by-staleness policy; cleanup is handled by
-- the dedicated cleanup_stale_visitors() function invoked by maintenance jobs.
DROP POLICY IF EXISTS "System can delete stale sessions" ON public.active_visitors;

-- B) Tighten EXECUTE on remaining SECURITY DEFINER helpers.
-- has_role: keep callable by authenticated (used by client useAdmin hook) but not anon.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- award_birthday_bonus_if_eligible: only logged-in users may claim their own bonus.
REVOKE EXECUTE ON FUNCTION public.award_birthday_bonus_if_eligible(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_birthday_bonus_if_eligible(uuid) TO authenticated;

-- check_rating_rate_limit: not called from client; lock down entirely.
REVOKE EXECUTE ON FUNCTION public.check_rating_rate_limit(uuid) FROM PUBLIC, anon, authenticated;

-- Create chat rate limits table for abuse protection
CREATE TABLE public.chat_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow edge function to insert (no auth required since chat is public)
CREATE POLICY "Allow anonymous inserts"
ON public.chat_rate_limits
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow edge function to read for rate limiting
CREATE POLICY "Allow anonymous reads"
ON public.chat_rate_limits
FOR SELECT
TO anon
USING (true);

-- Create index for fast lookups
CREATE INDEX idx_chat_rate_limits_ip_created 
ON public.chat_rate_limits (ip_address, created_at DESC);

-- Create function to clean old rate limit entries (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.chat_rate_limits
  WHERE created_at < now() - interval '1 hour';
$$;
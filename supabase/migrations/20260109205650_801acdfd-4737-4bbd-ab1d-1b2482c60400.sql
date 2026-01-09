-- Create site_settings table to store configurable settings like GA Measurement ID
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type TEXT NOT NULL DEFAULT 'string',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read site settings (needed for GA ID on frontend)
CREATE POLICY "Site settings are publicly readable"
  ON public.site_settings
  FOR SELECT
  USING (true);

-- Only admins can modify site settings
CREATE POLICY "Admins can manage site settings"
  ON public.site_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create active_visitors table for real-time tracking
CREATE TABLE public.active_visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  page_path TEXT,
  user_agent TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.active_visitors ENABLE ROW LEVEL SECURITY;

-- Anyone can insert/update their own session (anonymous tracking)
CREATE POLICY "Anyone can manage their visitor session"
  ON public.active_visitors
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Admins can read all visitor sessions
CREATE POLICY "Admins can read visitor sessions"
  ON public.active_visitors
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Enable realtime for active_visitors
ALTER PUBLICATION supabase_realtime ADD TABLE public.active_visitors;

-- Create trigger for updated_at on site_settings
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default GA setting
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description)
VALUES ('google_analytics_id', '', 'string', 'Google Analytics 4 Measurement ID (G-XXXXXXXXXX)');

-- Function to cleanup stale visitors (older than 5 minutes)
CREATE OR REPLACE FUNCTION public.cleanup_stale_visitors()
RETURNS void AS $$
BEGIN
  DELETE FROM public.active_visitors
  WHERE last_seen_at < now() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
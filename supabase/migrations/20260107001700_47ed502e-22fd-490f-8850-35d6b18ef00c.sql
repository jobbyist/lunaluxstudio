-- Create navigation_settings table for header/footer menu links
CREATE TABLE public.navigation_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location TEXT NOT NULL CHECK (location IN ('header', 'footer', 'mobile')),
  section TEXT,
  links JSONB NOT NULL DEFAULT '[]'::jsonb,
  social_links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint on location+section combination
CREATE UNIQUE INDEX idx_navigation_location_section ON public.navigation_settings(location, COALESCE(section, ''));

-- Enable Row Level Security
ALTER TABLE public.navigation_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view navigation" 
ON public.navigation_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert navigation" 
ON public.navigation_settings 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update navigation" 
ON public.navigation_settings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete navigation" 
ON public.navigation_settings 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_navigation_settings_updated_at
BEFORE UPDATE ON public.navigation_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for navigation settings
ALTER PUBLICATION supabase_realtime ADD TABLE public.navigation_settings;

-- Insert default navigation data
INSERT INTO public.navigation_settings (location, section, links, social_links) VALUES
('header', 'main', '[
  {"label": "Shop All", "path": "/", "translationKey": "shopAll"},
  {"label": "About", "path": "/about", "translationKey": "about"},
  {"label": "Explore", "path": "/explore", "translationKey": "explore"},
  {"label": "Contact", "path": "/contact", "translationKey": "contact"}
]'::jsonb, '[]'::jsonb),
('header', 'more', '[
  {"label": "Loyalty Rewards", "path": "/loyalty"},
  {"label": "Leave A Review", "path": "/reviews"},
  {"label": "Store Policies", "path": "/policies"},
  {"label": "Admin Dashboard", "path": "/manage"}
]'::jsonb, '[]'::jsonb),
('footer', 'browse', '[
  {"label": "Catalog", "path": "/shop"},
  {"label": "Customize", "path": "/customize"},
  {"label": "Collections", "path": "/explore"},
  {"label": "Support", "path": "/contact"}
]'::jsonb, '[]'::jsonb),
('footer', 'discover', '[
  {"label": "About", "path": "/about"},
  {"label": "Explore", "path": "/explore"},
  {"label": "Shop", "path": "/shop"},
  {"label": "Contact", "path": "/contact"}
]'::jsonb, '[]'::jsonb),
('footer', 'social', '[]'::jsonb, '[
  {"platform": "instagram", "url": "https://instagram.com/lunaluxhair", "label": "Instagram"},
  {"platform": "twitter", "url": "https://twitter.com", "label": "Twitter"},
  {"platform": "facebook", "url": "https://facebook.com", "label": "Facebook"},
  {"platform": "tiktok", "url": "https://tiktok.com/@cindykhan_", "label": "TikTok"}
]'::jsonb);
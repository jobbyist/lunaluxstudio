-- Sync homepage sections with actual homepage layout
-- Add missing sections to match live homepage

-- First, update existing sections with better content structure
UPDATE public.homepage_sections 
SET 
  content = '{"tagline": "LUXURY AWAITS", "title": "Luxury Hair,", "titleHighlight": "Effortless Beauty", "subtitle": "Handcrafted Excellence for the Modern Woman", "description": "Experience premium quality hair extensions and wigs, ethically sourced and expertly crafted. Transform your look with confidence.", "ctaText": "Discover Our Catalog", "ctaLink": "/customize", "secondaryCtaText": "Book Experience", "secondaryCtaLink": "/collections"}',
  display_order = 1
WHERE section_key = 'hero';

UPDATE public.homepage_sections 
SET 
  content = '{"title": "SHOP BY COLLECTION", "subtitle": "Discover our premium hair collections, each crafted with the finest quality materials"}',
  display_order = 2
WHERE section_key = 'collections';

-- Add Categories section (currently not in database)
INSERT INTO public.homepage_sections (section_key, section_name, content, is_visible, display_order) 
VALUES (
  'categories',
  'Categories',
  '{"title": "Browse by Category", "subtitle": "Find your perfect style"}',
  false,
  3
)
ON CONFLICT (section_key) DO UPDATE SET
  content = EXCLUDED.content,
  display_order = EXCLUDED.display_order;

-- Add Main Character Collection section
INSERT INTO public.homepage_sections (section_key, section_name, content, is_visible, display_order) 
VALUES (
  'main_character',
  'Main Character Collection',
  '{"title": "THE MAIN CHARACTER", "subtitle": "Non-custom, readily available wigs for immediate purchase. Look and feel like the main character in your story.", "ctaText": "View Full Collection", "ctaLink": "/collection/main-character"}',
  true,
  4
)
ON CONFLICT (section_key) DO UPDATE SET
  content = EXCLUDED.content,
  display_order = EXCLUDED.display_order;

-- Add Product Grid section
INSERT INTO public.homepage_sections (section_key, section_name, content, is_visible, display_order) 
VALUES (
  'product_grid',
  'Featured Products',
  '{"title": "Featured Products", "subtitle": "Explore our curated selection", "limit": "8"}',
  true,
  5
)
ON CONFLICT (section_key) DO UPDATE SET
  content = EXCLUDED.content,
  display_order = EXCLUDED.display_order;

-- Add Featured Stories section
INSERT INTO public.homepage_sections (section_key, section_name, content, is_visible, display_order) 
VALUES (
  'featured_stories',
  'Featured Stories',
  '{"title": "FEATURED STORIES", "subtitle": "See our latest tutorials, transformations, and behind-the-scenes content"}',
  true,
  6
)
ON CONFLICT (section_key) DO UPDATE SET
  content = EXCLUDED.content,
  display_order = EXCLUDED.display_order;

-- Update Newsletter section
UPDATE public.homepage_sections 
SET 
  content = '{"title": "Join Our Community", "subtitle": "Subscribe for exclusive offers, hair care tips, and early access to new collections", "privacyNote": "We respect your privacy. Unsubscribe at any time."}',
  display_order = 7
WHERE section_key = 'newsletter';

-- Remove or update instagram section (now called featured_stories)
UPDATE public.homepage_sections 
SET is_visible = false
WHERE section_key = 'instagram';

-- Update new_arrivals to be hidden (not currently displayed on homepage)
UPDATE public.homepage_sections 
SET is_visible = false, display_order = 8
WHERE section_key = 'new_arrivals';

-- Create navigation_menu table for editable navigation
CREATE TABLE IF NOT EXISTS public.navigation_menu (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  path text NOT NULL,
  icon text,
  display_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  parent_id uuid REFERENCES public.navigation_menu(id) ON DELETE CASCADE,
  is_mobile_only boolean NOT NULL DEFAULT false,
  is_desktop_only boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.navigation_menu ENABLE ROW LEVEL SECURITY;

-- Anyone can view visible navigation items
CREATE POLICY "Anyone can view visible navigation"
ON public.navigation_menu
FOR SELECT
USING (is_visible = true OR public.has_role(auth.uid(), 'admin'));

-- Only admins can manage navigation
CREATE POLICY "Admins can manage navigation"
ON public.navigation_menu
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_navigation_menu_updated_at
  BEFORE UPDATE ON public.navigation_menu
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default navigation items matching Header.tsx
INSERT INTO public.navigation_menu (label, path, icon, display_order, is_visible, is_desktop_only, is_mobile_only) VALUES
  ('Shop All', '/', 'Home', 1, true, true, false),
  ('About', '/about', 'Info', 2, true, true, false),
  ('Explore', '/explore', 'Compass', 3, true, true, false),
  ('Contact', '/contact', 'Mail', 4, true, true, false),
  ('Loyalty Rewards', '/loyalty', 'Award', 5, true, false, false),
  ('Leave A Review', '/reviews', 'Star', 6, true, false, false),
  ('Store Policies', '/policies', 'FileText', 7, true, false, false),
  ('Admin Dashboard', '/admin', 'Settings', 8, true, false, false);

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for admin access
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create homepage_sections table for editable content
CREATE TABLE public.homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  section_name text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  is_visible boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

-- Anyone can view visible sections
CREATE POLICY "Anyone can view visible sections"
ON public.homepage_sections
FOR SELECT
USING (is_visible = true OR public.has_role(auth.uid(), 'admin'));

-- Only admins can update sections
CREATE POLICY "Admins can update sections"
ON public.homepage_sections
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert sections
CREATE POLICY "Admins can insert sections"
ON public.homepage_sections
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_homepage_sections_updated_at
  BEFORE UPDATE ON public.homepage_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default homepage sections
INSERT INTO public.homepage_sections (section_key, section_name, content, display_order) VALUES
  ('hero', 'Hero Section', '{"title": "Luxury Hair, Effortless Beauty", "subtitle": "Premium quality hair extensions and wigs crafted for the modern woman", "ctaText": "Shop Now", "ctaLink": "/shop"}', 1),
  ('new_arrivals', 'New Arrivals', '{"title": "NEW ARRIVALS", "subtitle": "Discover our latest collection of premium hair products"}', 2),
  ('collections', 'Collections', '{"title": "Shop Our Collections", "subtitle": "Find your perfect style"}', 3),
  ('newsletter', 'Newsletter', '{"title": "Join Our Community", "subtitle": "Subscribe for exclusive offers and updates"}', 4),
  ('instagram', 'Instagram Reels', '{"title": "Follow Us On Instagram", "subtitle": "@lunaluxuryhair"}', 5);

-- Create admin_emails table for allowed admin emails
CREATE TABLE public.admin_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage admin emails
CREATE POLICY "Admins can view admin emails"
ON public.admin_emails
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage admin emails"
ON public.admin_emails
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Function to auto-assign admin role on signup if email is in admin_emails
CREATE OR REPLACE FUNCTION public.handle_admin_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.admin_emails WHERE email = NEW.email) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for auto-assigning admin role
CREATE TRIGGER on_auth_user_created_assign_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admin_signup();
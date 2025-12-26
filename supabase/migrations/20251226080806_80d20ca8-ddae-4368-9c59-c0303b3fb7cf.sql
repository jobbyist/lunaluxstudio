-- Create admin_activity_logs table for tracking login attempts and actions
CREATE TABLE public.admin_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  action_details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_admin_activity_logs_user_id ON public.admin_activity_logs(user_id);
CREATE INDEX idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at DESC);
CREATE INDEX idx_admin_activity_logs_action_type ON public.admin_activity_logs(action_type);

-- Enable Row Level Security
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view activity logs"
ON public.admin_activity_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow inserts from authenticated users (for login tracking)
CREATE POLICY "Authenticated users can insert their own logs"
ON public.admin_activity_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create published_content table for Featured Stories
CREATE TABLE public.published_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'blog', 'image')),
  cover_image_url TEXT,
  content_url TEXT,
  content_body TEXT,
  topic TEXT,
  external_link TEXT,
  seo_score INTEGER DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[],
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_published_content_status ON public.published_content(status);
CREATE INDEX idx_published_content_created_at ON public.published_content(created_at DESC);
CREATE INDEX idx_published_content_display_order ON public.published_content(display_order);

-- Enable Row Level Security
ALTER TABLE public.published_content ENABLE ROW LEVEL SECURITY;

-- Anyone can view published content
CREATE POLICY "Anyone can view published content"
ON public.published_content
FOR SELECT
USING (status = 'published' OR has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert content
CREATE POLICY "Admins can insert content"
ON public.published_content
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update content
CREATE POLICY "Admins can update content"
ON public.published_content
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete content
CREATE POLICY "Admins can delete content"
ON public.published_content
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updating updated_at
CREATE TRIGGER update_published_content_updated_at
BEFORE UPDATE ON public.published_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
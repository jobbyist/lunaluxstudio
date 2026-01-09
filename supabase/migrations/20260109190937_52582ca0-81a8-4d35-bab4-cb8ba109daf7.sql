-- Add points for ratings tracking column if not exists
ALTER TABLE public.product_ratings ADD COLUMN IF NOT EXISTS points_awarded BOOLEAN DEFAULT false;
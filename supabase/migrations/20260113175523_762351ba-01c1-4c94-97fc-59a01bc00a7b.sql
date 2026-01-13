-- Add Stitch Express payment tracking columns to custom_wig_orders
ALTER TABLE public.custom_wig_orders 
ADD COLUMN IF NOT EXISTS payment_link_id text,
ADD COLUMN IF NOT EXISTS order_reference text,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone;

-- Make shopify_order_id nullable for Stitch Express orders
ALTER TABLE public.custom_wig_orders 
ALTER COLUMN shopify_order_id DROP NOT NULL;

-- Create index for payment_link_id lookups (used by webhook)
CREATE INDEX IF NOT EXISTS idx_custom_wig_orders_payment_link_id 
ON public.custom_wig_orders(payment_link_id);

-- Create index for order_reference lookups
CREATE INDEX IF NOT EXISTS idx_custom_wig_orders_order_reference 
ON public.custom_wig_orders(order_reference);

-- Allow service role to insert orders (for edge functions)
CREATE POLICY "Service role can insert custom wig orders"
ON public.custom_wig_orders
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow service role to update orders (for webhook)
CREATE POLICY "Service role can update custom wig orders"
ON public.custom_wig_orders
FOR UPDATE
TO service_role
USING (true);
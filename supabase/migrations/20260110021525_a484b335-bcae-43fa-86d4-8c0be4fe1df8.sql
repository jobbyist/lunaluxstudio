-- Create custom wig orders table to track custom wig orders with add-on pricing
CREATE TABLE public.custom_wig_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shopify_order_id TEXT NOT NULL UNIQUE,
  shopify_order_number TEXT,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  base_bundle TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  addon_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  custom_sku TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.custom_wig_orders ENABLE ROW LEVEL SECURITY;

-- Admins can view and manage all custom wig orders
CREATE POLICY "Admins can view all custom wig orders"
ON public.custom_wig_orders
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update custom wig orders"
ON public.custom_wig_orders
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete custom wig orders"
ON public.custom_wig_orders
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_custom_wig_orders_shopify_id ON public.custom_wig_orders(shopify_order_id);
CREATE INDEX idx_custom_wig_orders_status ON public.custom_wig_orders(status);
CREATE INDEX idx_custom_wig_orders_created ON public.custom_wig_orders(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_custom_wig_orders_updated_at
BEFORE UPDATE ON public.custom_wig_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
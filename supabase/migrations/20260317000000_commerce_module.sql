-- Commerce Module: Commerce Orders table
-- The cms_products table already exists from the admin_cms_schema migration

-- Update the cms_products policy to use has_role (consistent with newer auth pattern)
DROP POLICY IF EXISTS "Admins can manage products" ON public.cms_products;
CREATE POLICY "Admins can manage products"
ON public.cms_products
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Also allow admins to SELECT draft/archived products (existing policy covers active only)
DROP POLICY IF EXISTS "Admins can view all products" ON public.cms_products;
CREATE POLICY "Admins can view all products"
ON public.cms_products
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create commerce_orders table
CREATE TABLE IF NOT EXISTS public.commerce_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_reference TEXT NOT NULL UNIQUE,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  payment_method TEXT,
  payment_reference TEXT,
  shipping_address JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.commerce_orders ENABLE ROW LEVEL SECURITY;

-- Admins can view and manage all orders
CREATE POLICY "Admins can view all commerce orders"
ON public.commerce_orders
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update commerce orders"
ON public.commerce_orders
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete commerce orders"
ON public.commerce_orders
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role (edge functions) can insert orders
-- Note: SUPABASE_SERVICE_ROLE_KEY bypasses RLS entirely for edge functions.
-- This policy covers direct REST API calls with the anon key via the checkout endpoint.
CREATE POLICY "Service role can insert commerce orders"
ON public.commerce_orders
FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_commerce_orders_reference ON public.commerce_orders(order_reference);
CREATE INDEX IF NOT EXISTS idx_commerce_orders_status ON public.commerce_orders(status);
CREATE INDEX IF NOT EXISTS idx_commerce_orders_created ON public.commerce_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commerce_orders_email ON public.commerce_orders(customer_email);

-- Trigger for updated_at
CREATE TRIGGER update_commerce_orders_updated_at
BEFORE UPDATE ON public.commerce_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

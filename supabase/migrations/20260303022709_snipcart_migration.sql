-- Snipcart Migration: E-commerce Backend Replacement
-- This migration adds tables and RLS policies for Snipcart integration

-- Add Snipcart-specific fields to cms_products table
ALTER TABLE public.cms_products 
ADD COLUMN IF NOT EXISTS snipcart_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stock_management BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(10,2) DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS length_cm DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS width_cm DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS height_cm DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS shippable BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS taxable BOOLEAN DEFAULT true;

-- Create orders table for Snipcart order sync
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snipcart_order_id TEXT UNIQUE NOT NULL,
  snipcart_invoice_number TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  billing_address JSONB,
  shipping_address JSONB,
  items JSONB NOT NULL, -- Array of order items
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  payment_status TEXT NOT NULL, -- paid, pending, refunded
  payment_method TEXT, -- card, paystack, stitch
  payment_gateway TEXT, -- snipcart, paystack, stitch_express
  fulfillment_status TEXT DEFAULT 'unfulfilled', -- unfulfilled, processing, shipped, delivered, cancelled
  shipping_method TEXT,
  shipping_carrier TEXT, -- fedex, courier_guy
  tracking_number TEXT,
  tracking_url TEXT,
  notes TEXT,
  metadata JSONB, -- Snipcart customFields, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  fulfilled_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- Create order_items table (normalized order line items)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.cms_products(id) ON DELETE SET NULL,
  snipcart_product_id TEXT,
  product_name TEXT NOT NULL,
  product_variant TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  sku TEXT,
  image_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create shipping_rates table (predefined rates for FedEx, Courier Guy)
CREATE TABLE IF NOT EXISTS public.shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier TEXT NOT NULL, -- fedex, courier_guy
  service_name TEXT NOT NULL, -- e.g., "FedEx Priority Overnight", "Courier Guy Express"
  service_code TEXT NOT NULL,
  description TEXT,
  base_rate DECIMAL(10,2) NOT NULL,
  per_kg_rate DECIMAL(10,2) DEFAULT 0,
  min_weight_kg DECIMAL(10,2) DEFAULT 0,
  max_weight_kg DECIMAL(10,2),
  delivery_days_min INTEGER,
  delivery_days_max INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

-- Create helper function to check if user has admin role
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = user_id 
    AND admin_users.role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (
  auth.uid() = user_id OR 
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Admins can view/manage all orders
CREATE POLICY "Admins can manage all orders"
ON public.orders FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Users can view order items for their orders
CREATE POLICY "Users can view order items for their orders"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (
      orders.user_id = auth.uid() OR 
      orders.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
);

-- Admins can manage order items
CREATE POLICY "Admins can manage order items"
ON public.order_items FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Public can view active shipping rates (for checkout)
CREATE POLICY "Public can view active shipping rates"
ON public.shipping_rates FOR SELECT
USING (is_active = true);

-- Admins can manage shipping rates
CREATE POLICY "Admins can manage shipping rates"
ON public.shipping_rates FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shipping_rates_updated_at
BEFORE UPDATE ON public.shipping_rates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_snipcart_id ON public.orders(snipcart_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON public.orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_carrier ON public.shipping_rates(carrier);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_is_active ON public.shipping_rates(is_active);
CREATE INDEX IF NOT EXISTS idx_cms_products_snipcart_id ON public.cms_products(snipcart_id);

-- Insert sample shipping rates
INSERT INTO public.shipping_rates (
  carrier, service_name, service_code, description, 
  base_rate, per_kg_rate, min_weight_kg, max_weight_kg, 
  delivery_days_min, delivery_days_max, is_active
) VALUES
  ('courier_guy', 'Standard Delivery', 'CG_STANDARD', 'Standard courier delivery within South Africa', 80.00, 15.00, 0, 30, 3, 5, true),
  ('courier_guy', 'Express Delivery', 'CG_EXPRESS', 'Express courier delivery within South Africa', 120.00, 20.00, 0, 30, 1, 2, true),
  ('fedex', 'FedEx International Priority', 'FEDEX_INTL_PRIORITY', 'Fast international shipping', 450.00, 50.00, 0, 50, 2, 4, true),
  ('fedex', 'FedEx International Economy', 'FEDEX_INTL_ECONOMY', 'Economical international shipping', 300.00, 35.00, 0, 50, 5, 7, true)
ON CONFLICT DO NOTHING;

-- Comment on tables for documentation
COMMENT ON TABLE public.orders IS 'Stores orders synced from Snipcart webhooks';
COMMENT ON TABLE public.order_items IS 'Normalized order line items for reporting and inventory management';
COMMENT ON TABLE public.shipping_rates IS 'Predefined shipping rates for FedEx and Courier Guy';
COMMENT ON COLUMN public.cms_products.snipcart_id IS 'Unique Snipcart product identifier (can be different from UUID)';
COMMENT ON COLUMN public.cms_products.weight_kg IS 'Product weight in kilograms for shipping calculations';

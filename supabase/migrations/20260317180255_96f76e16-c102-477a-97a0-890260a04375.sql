
-- CMS Products table (replaces Shopify as source of truth)
CREATE TABLE IF NOT EXISTS public.cms_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  handle text NOT NULL UNIQUE,
  description text,
  description_html text,
  price numeric NOT NULL DEFAULT 0,
  compare_at_price numeric,
  currency_code text NOT NULL DEFAULT 'ZAR',
  sku text,
  inventory_quantity integer NOT NULL DEFAULT 0,
  category text,
  tags text[],
  status text NOT NULL DEFAULT 'active',
  featured_image_url text,
  additional_images text[],
  options jsonb DEFAULT '[]'::jsonb,
  variants jsonb DEFAULT '[]'::jsonb,
  collection text,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cms_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products" ON public.cms_products
  FOR SELECT TO public USING (status = 'active' OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert products" ON public.cms_products
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products" ON public.cms_products
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products" ON public.cms_products
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_cms_products_updated_at
  BEFORE UPDATE ON public.cms_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- CMS Orders table
CREATE TABLE IF NOT EXISTS public.cms_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE,
  customer_name text,
  customer_email text NOT NULL,
  customer_phone text,
  shipping_address jsonb,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  discount_amount numeric NOT NULL DEFAULT 0,
  shipping_cost numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'unpaid',
  payment_method text,
  notes text,
  discount_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cms_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all orders" ON public.cms_orders
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders" ON public.cms_orders
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete orders" ON public.cms_orders
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can place orders" ON public.cms_orders
  FOR INSERT TO public WITH CHECK (true);

CREATE TRIGGER update_cms_orders_updated_at
  BEFORE UPDATE ON public.cms_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- CMS Customers table
CREATE TABLE IF NOT EXISTS public.cms_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text NOT NULL UNIQUE,
  phone text,
  address jsonb,
  total_orders integer NOT NULL DEFAULT 0,
  total_spent numeric NOT NULL DEFAULT 0,
  notes text,
  tags text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cms_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all customers" ON public.cms_customers
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert customers" ON public.cms_customers
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update customers" ON public.cms_customers
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete customers" ON public.cms_customers
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create customer record" ON public.cms_customers
  FOR INSERT TO public WITH CHECK (true);

CREATE TRIGGER update_cms_customers_updated_at
  BEFORE UPDATE ON public.cms_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Discounts table
CREATE TABLE IF NOT EXISTS public.cms_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE,
  title text NOT NULL,
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value numeric NOT NULL DEFAULT 0,
  min_order_amount numeric,
  max_uses integer,
  uses_count integer NOT NULL DEFAULT 0,
  applies_to text NOT NULL DEFAULT 'all',
  applies_to_ids text[],
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cms_discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage discounts" ON public.cms_discounts
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active discounts" ON public.cms_discounts
  FOR SELECT TO public USING (is_active = true);

CREATE TRIGGER update_cms_discounts_updated_at
  BEFORE UPDATE ON public.cms_discounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Generate order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1001;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'LL-' || LPAD(nextval('order_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.cms_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_order_number();

# Snipcart E-commerce Migration Guide

## Overview

This migration replaces Shopify Storefront API with Snipcart as the e-commerce backend for Luna Lux Hair. Snipcart provides a complete cart and checkout solution with webhook integration for order management.

## Environment Variables

Add the following environment variables to your `.env` file and hosting provider:

```bash
# Snipcart Configuration
VITE_SNIPCART_PUBLIC_API_KEY=your_public_api_key_here
SNIPCART_SECRET_KEY=your_secret_key_here  # Server-side only (for Edge Functions)
```

### Getting Snipcart Keys

1. Sign up at [Snipcart](https://snipcart.com)
2. Go to Account Settings → API Keys
3. Copy the Public API Key for `VITE_SNIPCART_PUBLIC_API_KEY`
4. Copy the Secret API Key for `SNIPCART_SECRET_KEY`

## Database Setup

Run the migration to create the required tables:

```bash
# The migration file is located at:
supabase/migrations/20260303022709_snipcart_migration.sql

# This creates:
# - orders table (for storing completed orders)
# - order_items table (normalized line items)
# - shipping_rates table (predefined shipping rates)
# - Adds Snipcart-specific columns to cms_products
```

### Tables Created

#### `orders`
Stores all completed orders synced from Snipcart webhooks.

#### `order_items`
Normalized line items for each order for reporting and inventory management.

#### `shipping_rates`
Predefined shipping rates for carriers (FedEx, Courier Guy).

#### `cms_products` (updated)
Added columns:
- `snipcart_id` - Unique Snipcart product identifier
- `weight_kg` - Product weight for shipping calculations
- `stock_management` - Enable/disable inventory tracking
- `track_inventory` - Whether to decrement inventory on purchase
- `shippable`, `taxable` - Product attributes for checkout
- `length_cm`, `width_cm`, `height_cm` - Dimensions for shipping

## Webhook Configuration

### Deploy Edge Function

The Snipcart webhook handler is located at:
```
supabase/functions/snipcart-webhook/index.ts
```

Deploy it to Supabase:
```bash
supabase functions deploy snipcart-webhook
```

### Configure Snipcart Webhook

1. Go to Snipcart Dashboard → Webhooks
2. Add a new webhook endpoint
3. URL: `https://your-project.supabase.co/functions/v1/snipcart-webhook`
4. Events to listen for:
   - `order.completed`
   - `order.status.changed`
   - `order.trackingNumber.changed`

### What the Webhook Does

When an order is completed:
1. Syncs order data to `orders` table
2. Inserts line items into `order_items` table
3. Updates inventory in `cms_products` (if tracking enabled)
4. Awards loyalty points to registered users (1 point per R10 spent)

## Frontend Integration

### Snipcart is Already Loaded

The Snipcart SDK is already integrated in `index.html`:
```html
<script>
  window.SnipcartSettings = {
    publicApiKey: "NzFlZDA2NDAtNjdmOS00NTEwLWJjOWQtNjYzYzdmODk0NWMzNjM5MDI2MzAwNjI4NzIzODAx",
    loadStrategy: "on-user-interaction",
  };
</script>
```

### Using Snipcart Buy Buttons

#### Option 1: Using the SnipcartBuyButton Component

```tsx
import { SnipcartBuyButton } from '@/components/SnipcartBuyButton';
import { CMSProduct } from '@/lib/snipcart';

function ProductCard({ product }: { product: CMSProduct }) {
  return (
    <div>
      <h3>{product.title}</h3>
      <p>{product.price} {product.currency}</p>
      <SnipcartBuyButton product={product} />
    </div>
  );
}
```

#### Option 2: Manual Data Attributes

```tsx
<button
  className="snipcart-add-item"
  data-item-id={product.snipcart_id || product.id}
  data-item-price={product.price}
  data-item-url={`/product/${product.slug}`}
  data-item-description={product.description}
  data-item-image={product.featured_image}
  data-item-name={product.title}
  data-item-weight={product.weight_kg || 0.5}
  data-item-quantity={product.inventory_quantity || 999}
  data-item-shippable="true"
  data-item-taxable="true"
>
  Add to Cart
</button>
```

### Fetching CMS Products

Replace Shopify product fetches with Supabase queries:

```tsx
// Before (Shopify)
import { fetchProducts } from '@/lib/shopify';
const products = await fetchProducts(20);

// After (CMS)
import { supabase } from '@/integrations/supabase/client';
const { data: products } = await supabase
  .from('cms_products')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false });
```

## Admin Dashboard

### Order Management

Access order management at `/manage/orders`:
- View all orders
- Filter by status (unfulfilled, processing, shipped, delivered, cancelled)
- Search by customer email, name, or invoice number
- Update fulfillment status
- Add tracking numbers
- Export orders to CSV

### Product Management

Access product management at `/manage/products`:
- Create, edit, delete CMS products
- Set pricing, inventory, and shipping details
- Manage product status (draft, active, archived)
- Set Snipcart-specific fields

## Migration Checklist

### Step 1: Database Setup
- [ ] Run database migration
- [ ] Verify tables created successfully
- [ ] Add sample shipping rates if needed

### Step 2: Environment Configuration
- [ ] Add `VITE_SNIPCART_PUBLIC_API_KEY` to `.env`
- [ ] Add `SNIPCART_SECRET_KEY` to Supabase Edge Function secrets
- [ ] Update production environment variables

### Step 3: Webhook Setup
- [ ] Deploy `snipcart-webhook` Edge Function
- [ ] Configure webhook URL in Snipcart dashboard
- [ ] Test webhook with a test order

### Step 4: Product Migration
- [ ] Migrate existing products to `cms_products` table
- [ ] Set `snipcart_id` for each product (can be same as UUID or custom)
- [ ] Set product weights and dimensions
- [ ] Set inventory quantities
- [ ] Publish products (set status to 'active')

### Step 5: Frontend Updates
- [ ] Update product listing pages to fetch from `cms_products`
- [ ] Replace cart/checkout with Snipcart buttons
- [ ] Test add to cart functionality
- [ ] Test checkout flow end-to-end

### Step 6: Testing
- [ ] Place test order in Snipcart test mode
- [ ] Verify order syncs to database
- [ ] Check inventory decrements correctly
- [ ] Verify loyalty points awarded
- [ ] Test order management dashboard
- [ ] Verify email notifications work

### Step 7: Go Live
- [ ] Switch Snipcart to live mode
- [ ] Update live environment variables
- [ ] Monitor webhook logs for errors
- [ ] Disable Shopify integration (if applicable)

## API Reference

### Snipcart Library (`src/lib/snipcart.ts`)

#### `productToSnipcartFormat(product: CMSProduct): SnipcartProduct`
Converts a CMS product to Snipcart-compatible format.

#### `openSnipcartCart()`
Programmatically open the Snipcart cart.

#### `closeSnipcartCart()`
Programmatically close the Snipcart cart.

#### `getCartItemsCount(): number`
Get current cart items count.

#### `subscribeToCart(callback: Function)`
Subscribe to cart state changes.

## Shipping Configuration

Shipping rates are managed in the `shipping_rates` table. The migration includes sample rates for:

- **Courier Guy Standard Delivery**: R80 + R15/kg
- **Courier Guy Express Delivery**: R120 + R20/kg
- **FedEx International Priority**: R450 + R50/kg
- **FedEx International Economy**: R300 + R35/kg

To add/modify shipping rates:
```sql
INSERT INTO shipping_rates (
  carrier, service_name, service_code, description,
  base_rate, per_kg_rate, min_weight_kg, max_weight_kg,
  delivery_days_min, delivery_days_max, is_active
) VALUES (
  'courier_guy', 'Same Day Delivery', 'CG_SAME_DAY', 'Same-day courier delivery',
  200.00, 25.00, 0, 15, 0, 1, true
);
```

## Loyalty Points Integration

The webhook automatically awards loyalty points when orders complete:
- **1 point per R10 spent**
- Points are added to the user's `user_profiles.loyalty_points`
- Transaction recorded in `loyalty_transactions` table
- Works only for authenticated users

## Security Considerations

1. **Webhook Signature Verification**: Currently not implemented. Add proper signature verification in production:
   ```typescript
   // In snipcart-webhook/index.ts
   const signature = req.headers.get('x-snipcart-requesttoken');
   // Verify signature against SNIPCART_SECRET_KEY
   ```

2. **RLS Policies**: All tables have Row Level Security enabled
   - Users can only view their own orders
   - Admins can manage all orders
   - Public can view active products

3. **Environment Variables**: Never commit secrets to version control
   - Keep `SNIPCART_SECRET_KEY` server-side only
   - Use Supabase secrets for Edge Functions

## Troubleshooting

### Orders not syncing
1. Check Supabase Edge Function logs
2. Verify webhook URL is correct in Snipcart dashboard
3. Check webhook signature (if implemented)
4. Ensure `SNIPCART_SECRET_KEY` is set in Edge Function environment

### Inventory not updating
1. Verify `track_inventory` is true in `cms_products`
2. Check that `snipcart_id` matches between product and order item
3. Review webhook logs for errors

### Cart not opening
1. Verify Snipcart script is loaded (check browser console)
2. Check `VITE_SNIPCART_PUBLIC_API_KEY` is correct
3. Ensure data attributes are correct on buy buttons

## Support Resources

- [Snipcart Documentation](https://docs.snipcart.com/)
- [Snipcart API Reference](https://docs.snipcart.com/v3/api-reference/introduction)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## Notes

- Snipcart handles all cart/checkout UI and payment processing
- Orders are synced to your database via webhooks for admin management
- CMS products (`cms_products`) are the source of truth for product data
- Snipcart fetches product data via the `data-item-url` attribute on buy buttons

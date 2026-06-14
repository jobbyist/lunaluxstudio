# Migrate Storefront to Shopify

Move the customer-facing storefront from the custom Supabase CMS (cms_products, cms_orders, Stitch checkout) to Shopify as the source of truth for products, cart, and checkout. Admin CMS tables remain in place but are no longer the storefront's source.

## Scope

**In scope (customer-facing storefront):**
- Product listings (home, Shop, Bestsellers, Collections, all category pages like Brazilian Virgin, Vietnamese Virgin, Raw Vietnamese, Café De Luna, Main Character, Face Card, Pop Out, Premium Accessories)
- Product detail page (`/product/:handle`)
- Cart (replace current cart store with Shopify Storefront API cart)
- Checkout (replace Stitch with Shopify-hosted checkout)
- New Arrivals / Featured / Recently Viewed components

**Out of scope (kept as-is for now):**
- Admin `/manage` dashboard, CMS product editor, orders dashboard — left intact; we'll surface a note that they no longer drive the storefront
- Custom Wig Builder — keeps its current Stitch flow (memory: builder-logic-v3)
- Loyalty / Lux Club, referrals, reviews, wishlist, profile — kept; tied to Supabase user accounts
- Stitch edge functions — left deployed but unused by the standard storefront

## Approach

### 1. Shopify API layer
- Add `SHOPIFY_STORE_PERMANENT_DOMAIN` and `SHOPIFY_STOREFRONT_TOKEN` constants (fetched via tools) into `src/lib/shopify.ts`
- Implement `storefrontApiRequest`, `fetchProducts`, `fetchProductByHandle`, `fetchProductsByCollection(handle)` against Storefront API 2025-07
- Keep current `ShopifyProduct` type shape so existing components don't all need rewrites

### 2. Cart + checkout
- Replace `src/stores/cartStore.ts` with the Shopify cart-sync version (cartCreate / cartLinesAdd / Update / Remove, persistent `cartId` + `checkoutUrl`)
- Add `useCartSync` hook and wire into `App.tsx`
- Update `CartDrawer.tsx` to open `checkoutUrl` (with `channel=online_store`) in a new tab — remove Stitch checkout call
- Remove `CustomerDetailsCheckout` from the standard cart path (custom wig keeps its own flow)

### 3. Collection pages
- Each category page fetches by Shopify collection handle (or tag/title query) instead of `cms_products`
- Café De Luna stays as a collection — pulls via `collection:"cafe-de-luna"` query, falling back to title filter if collection doesn't exist yet

### 4. Product detail
- `/product/:handle` fetches from Shopify, renders variants, options, images

### 5. Cleanup / signaling
- Show a small admin notice on `/manage/products` that storefront now reads from Shopify
- Keep cms_* tables; no schema changes in this migration

## Technical Details

```text
src/lib/shopify.ts          → rewrite (Storefront API client + queries)
src/stores/cartStore.ts     → rewrite (Shopify cart)
src/hooks/useCartSync.ts    → new
src/components/CartDrawer.tsx → simplify checkout handler
src/App.tsx                 → mount useCartSync
src/pages/*Collection.tsx   → swap to fetchProductsByCollection
src/pages/ProductDetail.tsx → already Shopify-shaped, just point at new fetcher
src/pages/Shop.tsx, Bestsellers.tsx, Index sections → use fetchProducts
```

Storefront token + domain are read from existing secrets `VITE_SHOPIFY_STOREFRONT_TOKEN` and `VITE_SHOPIFY_STORE_DOMAIN` (already present); I'll refresh them via the Shopify tools to confirm they point at the new store.

## What you'll need to do after I ship

1. Add products in the new Shopify store (or tell me what to create here in chat — title, price, image, collection)
2. Set up Shopify collections matching your category pages (Café De Luna, Brazilian Virgin, Vietnamese Virgin, Raw Vietnamese, Main Character, Face Card, Pop Out, Premium Accessories)
3. Configure shipping + payments in Shopify admin — checkout will use Shopify's hosted checkout, not Stitch

## Open question

Your current store is brand new and empty. After the migration, every collection page will say "No products found" until products are added in Shopify. Want me to:

- (a) Just do the migration now — pages will be empty until you add products, **or**
- (b) Also recreate the existing CMS products in Shopify as part of this migration (I'd need to read them from `cms_products` and create via Shopify tools — adds time)?

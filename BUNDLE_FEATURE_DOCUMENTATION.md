# Bundle and Save Feature Documentation

## Overview
The Bundle and Save feature has been updated to pull real products from the Shopify integration and create complementary product bundles automatically.

## Implementation

### Product Categorization
Products are automatically categorized based on their title and description:

- **Bundle**: Hair bundles (Brazilian, body wave, straight, curly, etc.)
- **Closure**: Lace closures (4x4, 5x5, etc.)
- **Frontal**: Lace frontals (13x4, 13x6, etc.)
- **Wig**: Complete wigs
- **Accessory**: Wig caps, glue, bands, brushes, stands
- **Care**: Shampoo, conditioner, sprays, oils, serums

### Bundle Types

#### 1. Starter Bundle (20% Savings)
- 2x Hair Bundle
- 1x Lace Closure
- Perfect for first-time buyers

#### 2. Complete Look Bundle (25% Savings) - Popular
- 3x Hair Bundle
- 1x HD Lace Frontal
- 1x Care Product
- Everything needed for a full head install

#### 3. Luxury Collection (30% Savings)
- 3x Premium Hair Bundle
- 1x Swiss Lace Frontal
- 2x Care Products
- Premium quality for discerning clients

#### 4. Wig Essentials Kit (25% Savings)
- 3-5 Wig Accessories
- Complete wig care package

## How It Works

1. When the Bundle & Save popup is opened, it fetches up to 50 products from Shopify
2. Products are categorized based on their titles and descriptions
3. Bundles are created by combining complementary products
4. Prices are calculated from actual Shopify product prices
5. Discount percentages are applied to create bundle prices
6. When a bundle is added to cart, each product is added individually with proper variant information

## Features

- ✅ Real-time product fetching from Shopify
- ✅ Automatic bundle creation based on available products
- ✅ Dynamic pricing based on actual product prices
- ✅ Loading states with spinner
- ✅ Error handling for no products or API failures
- ✅ Complementary product selection logic
- ✅ Individual product tracking in cart

## Edge Cases Handled

1. **No Products Available**: Shows error message "No products available to create bundles"
2. **Insufficient Products**: Shows error "Unable to create bundles from available products"
3. **API Errors**: Catches and displays "Failed to load bundles. Please try again later."
4. **Empty Categories**: Bundles are only created if sufficient products exist in required categories

## Usage

The Bundle & Save button is available on the main index page. When clicked:
1. A loading spinner appears while fetching products
2. Available bundles are displayed with:
   - Bundle name and description
   - List of included products with quantities
   - Original price (crossed out)
   - Bundle price (discounted)
   - Savings percentage badge
   - "Add to Cart" button
3. After adding to cart, button changes to "Added" with checkmark
4. All products from the bundle are added to cart individually

## Technical Details

### Dependencies
- `fetchProducts` from `@/lib/shopify` - Fetches products from Shopify API
- `useCartStore` - Manages cart state
- React hooks: `useState`, `useEffect` for state management

### Key Functions
- `categorizeProduct()` - Categorizes products based on title/description
- `createBundlesFromProducts()` - Creates bundles from categorized products
- `handleAddBundle()` - Adds all bundle products to cart

### Component State
- `bundles` - Array of created bundles
- `loading` - Loading state during API fetch
- `error` - Error message if any
- `addedBundles` - Track which bundles have been added to cart

## Future Enhancements

Potential improvements:
- Allow users to customize bundle contents
- Add product images to bundle display
- Implement bundle-specific inventory tracking
- Add ability to save favorite bundles
- Create personalized bundle recommendations based on purchase history
- Add bundle-specific shipping options

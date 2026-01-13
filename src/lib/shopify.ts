import { supabase } from "@/integrations/supabase/client";

const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_STORE_PERMANENT_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || 'luna-hair-boutique-9dwzm.myshopify.com';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '';

if (!SHOPIFY_STOREFRONT_TOKEN) {
  console.warn('VITE_SHOPIFY_STOREFRONT_TOKEN is not configured. Shopify API calls will fail.');
}

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          availableForSale: boolean;
          selectedOptions: Array<{
            name: string;
            value: string;
          }>;
        };
      }>;
    };
    options: Array<{
      name: string;
      values: string[];
    }>;
  };
}

const STOREFRONT_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          description
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
        }
      }
    }
  }
`;

export async function storefrontApiRequest(query: string, variables: any = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`Error calling Shopify: ${data.errors.map((e: any) => e.message).join(', ')}`);
  }

  return data;
}

export async function fetchProducts(limit: number = 20, searchQuery?: string) {
  const data = await storefrontApiRequest(STOREFRONT_QUERY, {
    first: limit,
    query: searchQuery
  });
  return data.data.products.edges as ShopifyProduct[];
}

// Fetch products from a specific Shopify collection
export async function fetchCollectionProducts(collectionHandle: string, limit: number = 20) {
  const query = `collection:"${collectionHandle}"`;
  return fetchProducts(limit, query);
}

// Fetch bestseller products directly from Shopify
export async function fetchBestsellers(limit: number = 8) {
  return fetchCollectionProducts('bestsellers', limit);
}

// Custom wig product constants
export const CUSTOM_WIG_PRODUCT_ID = 'gid://shopify/Product/10321451811109';
export const CUSTOM_WIG_VARIANTS: Record<string, string> = {
  'straight-18': 'gid://shopify/ProductVariant/51870947672357', // R3000
  'bodywave-22': 'gid://shopify/ProductVariant/51870947705125', // R3700
};

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                  }
                }
              }
              attributes {
                key
                value
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface CartLineInput {
  quantity: number;
  merchandiseId: string;
  attributes?: Array<{ key: string; value: string }>;
}

export async function createStorefrontCheckout(items: any[], customerEmail?: string): Promise<string> {
  try {
    // Check if any items are custom wigs
    const hasCustomWig = items.some(item => 
      item.isCustomWig === true || item.product?.node?.handle === 'custom-wig'
    );

    // If there are custom wigs, use the Stitch Express API
    if (hasCustomWig) {
      return await createCustomWigCheckout(items, customerEmail);
    }

    // For regular items, use the standard Storefront API cart
    const lines: CartLineInput[] = items.map(item => ({
      quantity: item.quantity,
      merchandiseId: item.variantId,
    }));

    const cartData = await storefrontApiRequest(CART_CREATE_MUTATION, {
      input: {
        lines,
      },
    });

    if (cartData.data.cartCreate.userErrors.length > 0) {
      throw new Error(`Cart creation failed: ${cartData.data.cartCreate.userErrors.map((e: any) => e.message).join(', ')}`);
    }

    const cart = cartData.data.cartCreate.cart;
    
    if (!cart.checkoutUrl) {
      throw new Error('No checkout URL returned from Shopify');
    }

    const url = new URL(cart.checkoutUrl);
    url.searchParams.set('channel', 'online_store');
    return url.toString();
  } catch (error) {
    console.error('Error creating storefront checkout:', error);
    throw error;
  }
}

// Create checkout for custom wigs using Stitch Express API
async function createCustomWigCheckout(items: any[], customerEmail?: string): Promise<string> {
  const customWigItems: any[] = [];
  const regularItems: any[] = [];

  for (const item of items) {
    const isCustomWig = item.isCustomWig === true || item.product?.node?.handle === 'custom-wig';

    if (isCustomWig) {
      // Get bundle selection
      const bundleOption = item.selectedOptions?.find((opt: any) => opt.name === 'Base Bundle');
      const bundleValue = bundleOption?.value || 'Straight 18"';
      
      // Calculate pricing
      const basePrice = bundleValue.toLowerCase().includes('bodywave') ? 3700 : 3000;
      const totalPrice = parseFloat(item.price?.amount || '0');
      const addonCost = totalPrice - basePrice;

      customWigItems.push({
        quantity: item.quantity,
        title: item.product?.node?.title || 'Custom Luna Luxury Wig',
        baseBundle: bundleValue,
        basePrice,
        addonCost,
        totalPrice,
        configuration: item.variantTitle || '',
        customSku: item.customSku || 'LUNA-CUSTOM',
        selectedOptions: item.selectedOptions || [],
      });
    } else {
      regularItems.push({
        quantity: item.quantity,
        variantId: item.variantId,
        title: item.product?.node?.title || 'Product',
        price: parseFloat(item.price?.amount || '0'),
      });
    }
  }

  console.log('Creating custom checkout via Stitch Express:', {
    customWigItems: customWigItems.length,
    regularItems: regularItems.length,
    customerEmail: customerEmail || 'not provided',
  });

  // Call the edge function to create a Stitch Express payment link
  const { data, error } = await supabase.functions.invoke('create-custom-checkout', {
    body: {
      customWigItems,
      regularItems,
      customerEmail,
    },
  });

  if (error) {
    console.error('Edge function error:', error);
    throw new Error(`Failed to create custom checkout: ${error.message || 'Unknown error'}`);
  }

  if (!data?.success || !data?.checkoutUrl) {
    console.error('Custom checkout response:', data);
    throw new Error(data?.error || 'Failed to create checkout URL');
  }

  console.log('Stitch Express checkout created:', {
    checkoutUrl: data.checkoutUrl,
    paymentLinkId: data.paymentLinkId,
    orderReference: data.orderReference,
    totalPrice: data.totalPrice,
  });

  return data.checkoutUrl;
}

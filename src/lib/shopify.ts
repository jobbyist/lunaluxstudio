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

export async function createStorefrontCheckout(items: any[]): Promise<string> {
  try {
    const lines: CartLineInput[] = items.map(item => {
      // Check if this is a custom wig item
      const isCustomWig = item.isCustomWig === true ||
                          item.product?.node?.handle === 'custom-wig';
      
      if (isCustomWig) {
        // Get the variant ID for the selected bundle
        const bundleOption = item.selectedOptions?.find((opt: any) => opt.name === 'Base Bundle');
        const bundleValue = bundleOption?.value || '';
        
        // Map bundle name to variant ID
        let variantId = CUSTOM_WIG_VARIANTS['straight-18']; // default
        if (bundleValue.toLowerCase().includes('bodywave') || bundleValue.toLowerCase().includes('22')) {
          variantId = CUSTOM_WIG_VARIANTS['bodywave-22'];
        }
        
        // Calculate add-on costs for display in order notes
        const basePrice = bundleValue.toLowerCase().includes('bodywave') ? 3700 : 3000;
        const totalPrice = parseFloat(item.price?.amount || '0');
        const addOnCost = totalPrice - basePrice;
        
        // Build attributes for order processing
        const attributes = [
          { key: '_custom_wig', value: 'true' },
          { key: '_custom_sku', value: item.customSku || 'LUNA-CUSTOM' },
          { key: '_total_price', value: totalPrice.toString() },
          { key: '_addon_cost', value: addOnCost.toString() },
          { key: '_configuration', value: item.variantTitle || '' },
          { key: '_free_shipping', value: 'true' },
        ];
        
        // Add selected options as attributes for order processing
        if (item.selectedOptions) {
          item.selectedOptions.forEach((opt: any) => {
            if (opt.name && opt.value && opt.name !== 'SKU') {
              attributes.push({ key: opt.name, value: opt.value });
            }
          });
        }
        
        return {
          quantity: item.quantity,
          merchandiseId: variantId,
          attributes,
        };
      }
      
      // Regular product
      return {
        quantity: item.quantity,
        merchandiseId: item.variantId,
      };
    });

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

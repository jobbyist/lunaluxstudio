// Snipcart configuration and helper functions
export const SNIPCART_API_KEY = import.meta.env.VITE_SNIPCART_PUBLIC_API_KEY || 'NzFlZDA2NDAtNjdmOS00NTEwLWJjOWQtNjYzYzdmODk0NWMzNjM5MDI2MzAwNjI4NzIzODAx';
export const SNIPCART_SECRET_KEY = import.meta.env.VITE_SNIPCART_SECRET_KEY; // Server-side only

export interface SnipcartProduct {
  id: string;
  name: string;
  price: number;
  url: string; // Product page URL (required by Snipcart)
  description?: string;
  image?: string;
  categories?: string[];
  metadata?: Record<string, any>;
  customFields?: SnipcartCustomField[];
  shippable?: boolean;
  taxable?: boolean;
  taxes?: SnipcartTax[];
  weight?: number; // in kg
  length?: number; // in cm
  width?: number;
  height?: number;
  quantity?: number; // Available stock
}

export interface SnipcartCustomField {
  name: string;
  type?: 'text' | 'textarea' | 'dropdown' | 'checkbox';
  options?: string;
  required?: boolean;
  placeholder?: string;
}

export interface SnipcartTax {
  name: string;
  rate: number;
  numberForInvoice?: string;
}

export interface CMSProduct {
  id: string;
  snipcart_id?: string | null;
  title: string;
  slug: string;
  description: string;
  price: number | string;
  featured_image?: string | null;
  tags?: string[] | null;
  weight_kg?: number | null;
  inventory_quantity?: number | null;
  shippable?: boolean | null;
  taxable?: boolean | null;
}

// Convert cms_products to Snipcart-compatible format
export function productToSnipcartFormat(product: CMSProduct): SnipcartProduct {
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  
  return {
    id: product.snipcart_id || product.id,
    name: product.title,
    price: price,
    url: `${window.location.origin}/product/${product.slug}`,
    description: product.description,
    image: product.featured_image || undefined,
    categories: product.tags || [],
    shippable: product.shippable !== false,
    taxable: product.taxable !== false,
    weight: product.weight_kg || 0.5, // Default 0.5kg
    quantity: product.inventory_quantity || 999,
  };
}

// Initialize Snipcart (call in index.html or main.tsx)
export function initializeSnipcart() {
  if (typeof window !== 'undefined' && (window as any).Snipcart) {
    (window as any).Snipcart.api.configure('show_cart_automatically', false);
    (window as any).Snipcart.api.configure('cart.language', 'en');
  }
}

// Server-side Snipcart API client (for webhooks, order fetching)
export async function snipcartApiRequest(endpoint: string, method = 'GET', body?: any) {
  if (!SNIPCART_SECRET_KEY) {
    throw new Error('SNIPCART_SECRET_KEY is not configured');
  }

  const response = await fetch(`https://app.snipcart.com/api${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${SNIPCART_SECRET_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Snipcart API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// Fetch order by ID (server-side)
export async function getOrder(orderId: string) {
  return snipcartApiRequest(`/orders/${orderId}`);
}

// Update order fulfillment status
export async function updateOrderFulfillment(
  orderId: string, 
  status: string, 
  trackingNumber?: string, 
  trackingUrl?: string
) {
  return snipcartApiRequest(`/orders/${orderId}`, 'PUT', {
    status,
    trackingNumber,
    trackingUrl,
  });
}

// Helper to open Snipcart cart
export function openSnipcartCart() {
  if (typeof window !== 'undefined' && (window as any).Snipcart) {
    (window as any).Snipcart.api.theme.cart.open();
  }
}

// Helper to close Snipcart cart
export function closeSnipcartCart() {
  if (typeof window !== 'undefined' && (window as any).Snipcart) {
    (window as any).Snipcart.api.theme.cart.close();
  }
}

// Get current cart items count
export function getCartItemsCount(): number {
  if (typeof window !== 'undefined' && (window as any).Snipcart) {
    return (window as any).Snipcart.store.getState().cart.items.count || 0;
  }
  return 0;
}

// Subscribe to cart changes
export function subscribeToCart(callback: (state: any) => void) {
  if (typeof window !== 'undefined' && (window as any).Snipcart) {
    return (window as any).Snipcart.store.subscribe(callback);
  }
  return () => {}; // Return no-op unsubscribe function
}

// TypeScript declarations for Snipcart global
declare global {
  interface Window {
    Snipcart?: any;
    SnipcartSettings?: {
      publicApiKey: string;
      loadStrategy?: string;
      version?: string;
      timeoutDuration?: number;
    };
  }
}

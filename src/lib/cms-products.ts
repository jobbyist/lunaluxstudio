import { supabase } from "@/integrations/supabase/client";

export interface CmsVariant {
  id: string;
  title: string;
  price: number;
  compare_at_price?: number | null;
  sku?: string;
  inventory_quantity: number;
  available: boolean;
  options: Record<string, string>;
}

export interface CmsProduct {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  description_html: string | null;
  price: number;
  compare_at_price: number | null;
  currency_code: string;
  sku: string | null;
  inventory_quantity: number;
  category: string | null;
  tags: string[] | null;
  status: string;
  featured_image_url: string | null;
  additional_images: string[] | null;
  collection: string | null;
  is_featured: boolean | null;
  options: Array<{ name: string; values: string[] }> | null;
  variants: CmsVariant[] | null;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

export async function fetchCmsProducts(limit = 50, searchQuery?: string): Promise<CmsProduct[]> {
  let query = supabase
    .from('cms_products')
    .select('*')
    .eq('status', 'active')
    .order('display_order', { ascending: true })
    .limit(limit);

  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapProduct);
}

export async function fetchCmsProductByHandle(handle: string): Promise<CmsProduct | null> {
  const { data, error } = await supabase
    .from('cms_products')
    .select('*')
    .eq('handle', handle)
    .single();

  if (error) return null;
  return mapProduct(data);
}

export async function fetchCmsProductsByCollection(collection: string, limit = 50): Promise<CmsProduct[]> {
  const { data, error } = await supabase
    .from('cms_products')
    .select('*')
    .eq('status', 'active')
    .eq('collection', collection)
    .order('display_order', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data || []).map(mapProduct);
}

export async function fetchFeaturedProducts(limit = 8): Promise<CmsProduct[]> {
  const { data, error } = await supabase
    .from('cms_products')
    .select('*')
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data || []).map(mapProduct);
}

function mapProduct(raw: any): CmsProduct {
  return {
    ...raw,
    options: Array.isArray(raw.options) ? raw.options : (raw.options ? JSON.parse(raw.options) : []),
    variants: Array.isArray(raw.variants) ? raw.variants : (raw.variants ? JSON.parse(raw.variants) : []),
  };
}

// Helper to get the best variant for a set of selected options
export function findVariant(product: CmsProduct, selectedOptions: Record<string, string>): CmsVariant | null {
  if (!product.variants || product.variants.length === 0) return null;
  
  return product.variants.find(v => 
    Object.entries(selectedOptions).every(([key, value]) => v.options[key] === value)
  ) || null;
}

// Helper to get display price for a product
export function getProductPrice(product: CmsProduct, variant?: CmsVariant | null): number {
  if (variant) return variant.price;
  return product.price;
}

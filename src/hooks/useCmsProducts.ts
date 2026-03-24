import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  fetchCmsProducts,
  fetchCmsProductByHandle,
  fetchCmsProductsByCollection,
  CmsProduct,
} from '@/lib/cms-products';

interface UseCmsProductsOptions {
  collection?: string;
  limit?: number;
  searchQuery?: string;
}

export const useCmsProducts = ({
  collection,
  limit = 50,
  searchQuery,
}: UseCmsProductsOptions = {}) => {
  const [products, setProducts] = useState<CmsProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      let data: CmsProduct[];
      if (collection) {
        data = await fetchCmsProductsByCollection(collection, limit);
      } else {
        data = await fetchCmsProducts(limit, searchQuery);
      }
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [collection, limit, searchQuery]);

  const loadProductsRef = useRef(loadProducts);
  loadProductsRef.current = loadProducts;

  useEffect(() => {
    loadProductsRef.current();

    const channelConfig = collection
      ? {
          event: '*' as const,
          schema: 'public',
          table: 'cms_products',
          filter: `collection=eq.${collection}`,
        }
      : { event: '*' as const, schema: 'public', table: 'cms_products' };

    const channel = supabase
      .channel('cms-products-list-changes')
      .on('postgres_changes', channelConfig, () => {
        loadProductsRef.current();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // Subscription only needs to be recreated when the filter params change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection, limit, searchQuery]);

  return { products, loading, refetch: loadProducts };
};

export const useCmsProduct = (handle: string | undefined) => {
  const [product, setProduct] = useState<CmsProduct | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProduct = useCallback(async () => {
    if (!handle) {
      setProduct(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const found = await fetchCmsProductByHandle(handle);
      setProduct(found);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  }, [handle]);

  const loadProductRef = useRef(loadProduct);
  loadProductRef.current = loadProduct;

  useEffect(() => {
    loadProductRef.current();

    if (!handle) return;

    const channel = supabase
      .channel(`cms-product-detail-${handle}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cms_products',
          filter: `handle=eq.${handle}`,
        },
        () => {
          loadProductRef.current();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // Subscription only needs to be recreated when the handle changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);

  return { product, loading, refetch: loadProduct };
};

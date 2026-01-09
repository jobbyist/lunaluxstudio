import { useState, useEffect } from "react";
import { ShopifyProduct } from "@/lib/shopify";

const STORAGE_KEY = "luna_recently_viewed";
const MAX_ITEMS = 8;

interface RecentlyViewedItem {
  productId: string;
  handle: string;
  title: string;
  imageUrl: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  viewedAt: number;
}

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentlyViewed(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing recently viewed:", e);
      }
    }
  }, []);

  const addProduct = (product: ShopifyProduct) => {
    const { node } = product;
    
    const newItem: RecentlyViewedItem = {
      productId: node.id,
      handle: node.handle,
      title: node.title,
      imageUrl: node.images.edges[0]?.node.url || "/placeholder.svg",
      price: node.priceRange.minVariantPrice,
      viewedAt: Date.now(),
    };

    setRecentlyViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((item) => item.productId !== node.id);
      // Add to beginning
      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentlyViewed([]);
  };

  return { recentlyViewed, addProduct, clearAll };
};

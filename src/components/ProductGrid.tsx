import { useEffect, useState } from "react";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "./ProductCard";
import { Loader2 } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import productPlaceholder from "@/assets/product-placeholder.webp";

interface ProductGridProps {
  title?: string;
  searchQuery?: string;
  limit?: number;
}

// Constants for product filtering and display
// FILTER_BUFFER: 5 extra products provides adequate buffer for filtering a small number of excluded products
// while avoiding over-fetching. Increase if more products need to be excluded in the future.
const FILTER_BUFFER = 5;
const EXCLUDED_PRODUCT_NAME_LOWER = 'luna premium gift voucher'; // Already lowercase for efficient comparison

// Sample product data for when Shopify has no products
const createSampleProducts = (count: number): ShopifyProduct[] => {
  return Array.from({ length: count }, (_, i) => ({
    node: {
      id: `sample-${i}`,
      title: "Example Product Title",
      handle: `example-product-${i}`,
      description: "Premium quality hair product",
      priceRange: {
        minVariantPrice: {
          amount: "999.99",
          currencyCode: "ZAR"
        }
      },
      images: {
        edges: [{
          node: {
            url: productPlaceholder,
            altText: "Example Product"
          }
        }]
      },
      variants: {
        edges: [{
          node: {
            id: `variant-${i}`,
            title: "Default",
            price: {
              amount: "999.99",
              currencyCode: "ZAR"
            },
            availableForSale: true,
            selectedOptions: []
          }
        }]
      },
      options: []
    }
  }));
};

export const ProductGrid = ({ title, searchQuery, limit = 50 }: ProductGridProps) => {
  const { t } = useCurrency();
  const displayTitle = title || t('bestsellers');
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        // Fetch extra products to account for filtering (only needed when filtering is applied)
        // This ensures we can still display the full limit even if some products are filtered out
        const fetchLimit = !searchQuery ? limit + FILTER_BUFFER : limit;
        const data = await fetchProducts(fetchLimit, searchQuery);
        
        // Filter out excluded products only when not performing a search
        // Uses .includes() to match products containing the excluded name
        // This ensures variations like "Luna Premium Gift Voucher - $100" are also filtered
        const filteredData = !searchQuery 
          ? data.filter(product => !product.node.title.toLowerCase().includes(EXCLUDED_PRODUCT_NAME_LOWER))
          : data;
        
        // Limit to the requested number of products after filtering
        const limitedData = filteredData.slice(0, limit);
        
        // If no products from Shopify, use sample products
        if (limitedData.length === 0) {
          setProducts(createSampleProducts(Math.min(limit, 6)));
        } else {
          setProducts(limitedData);
        }
      } catch (error) {
        console.error("Error loading products:", error);
        // On error, show sample products (max 6 to avoid overwhelming the UI)
        setProducts(createSampleProducts(Math.min(limit, 6)));
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [searchQuery, limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif text-center mb-12">{displayTitle}</h2>
          <p className="text-center text-muted-foreground">{t('noProductsFound')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-serif text-center mb-4 tracking-wider">
          {displayTitle}
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          {t('bestsellerDescription')}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.node.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useEffect, useState } from "react";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { Skeleton } from "@/components/ui/skeleton";
import { ALLOWED_MAIN_CHARACTER_PRODUCTS } from "@/lib/constants";

const MainCharacterCollectionPage = () => {
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Fetch products from the "Main Character" collection on Shopify
        const collectionProducts = await fetchProducts(50, 'collection:"main character"');
        
        // Filter to only include specific products
        const filteredProducts = collectionProducts.filter(product => 
          ALLOWED_MAIN_CHARACTER_PRODUCTS.includes(product.node.title)
        );
        
        setProducts(filteredProducts);
      } catch (error) {
        console.error('Failed to load Main Character products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <PageLayout
      title="The Main Character"
      subtitle="Non-custom, readily available wigs for immediate purchase. Be the main character in your own story."
    >
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No products available in this collection</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.node.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                <Link to={`/product/${product.node.handle}`}>
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={product.node.images.edges[0]?.node.url || '/placeholder.svg'}
                      alt={product.node.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-medium text-center">{product.node.title}</h3>
                    <p className="text-sm text-muted-foreground text-center line-clamp-2">
                      {product.node.description || 'Premium quality wig'}
                    </p>
                    <p className="text-primary font-semibold text-center text-lg">
                      {formatPrice(parseFloat(product.node.priceRange.minVariantPrice.amount))}
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-muted/30 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-serif mb-4">Ready to Wear, Ready to Shine</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our Main Character collection features premium quality wigs that are ready for immediate purchase. 
            No customization needed - just choose your style and step into the spotlight. Each wig is crafted 
            with care to ensure you look and feel your absolute best.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default MainCharacterCollectionPage;

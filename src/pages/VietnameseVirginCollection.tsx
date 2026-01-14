import { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { ProductCardWithQuickView } from "@/components/ProductCardWithQuickView";
import { fetchCollectionByHandle, ShopifyProduct } from "@/lib/shopify";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import vietnameseImage from "@/assets/collection-vietnamese.jpg";

export default function VietnameseVirginCollection() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchCollectionByHandle("vietnamese-virgin", 50);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching Vietnamese Virgin products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative -mx-4 md:-mx-8 lg:-mx-16 -mt-8 md:-mt-12 mb-12">
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <img
            src={vietnameseImage}
            alt="Vietnamese Virgin Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 flex items-end justify-center pb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
                Premium Collection
              </p>
              <h1 className="text-4xl md:text-6xl font-serif tracking-wider text-foreground">
                VIETNAMESE VIRGIN
              </h1>
              <p className="text-muted-foreground mt-4 max-w-xl mx-auto px-4">
                Discover the silky smoothness of Vietnamese virgin hair. 
                Naturally straight with a lustrous shine that elevates any style.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif tracking-wider">
            All Products ({products.length})
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {products.map((product, index) => (
              <motion.div
                key={product.node.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ProductCardWithQuickView product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No products found in this collection.
            </p>
          </div>
        )}
      </section>

      {/* Collection Info */}
      <section className="mt-16 bg-card rounded-2xl p-8 md:p-12">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-serif mb-4">About Vietnamese Virgin Hair</h3>
          <p className="text-muted-foreground leading-relaxed">
            Our Vietnamese Virgin hair collection showcases the finest quality hair from Vietnam. 
            Known for its naturally straight texture and silky feel, this hair type is perfect 
            for those seeking a sleek, polished look. Each bundle is carefully selected to ensure 
            consistent quality and exceptional shine that rivals even the most expensive salon treatments.
          </p>
        </div>
      </section>
    </PageLayout>
  );
}

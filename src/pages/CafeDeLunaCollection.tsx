import { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { ProductCard } from "@/components/ProductCard";
import { fetchCmsProductsByCollection, CmsProduct } from "@/lib/cms-products";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import valentinesBanner from "@/assets/valentines-cafe-de-luna.jpg";

export default function CafeDeLunaCollection() {
  const [products, setProducts] = useState<CmsProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchCmsProductsByCollection("cafe-de-luna", 20);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching Cafe De Luna products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <PageLayout>
      <section className="relative -mx-4 md:-mx-8 lg:-mx-16 -mt-8 md:-mt-12 mb-12">
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <img src={valentinesBanner} alt="Cafe De Luna Collection" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 flex items-end justify-center pb-12">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-red-400 fill-red-400" />
                <span className="text-sm uppercase tracking-widest text-muted-foreground">Valentine's Day Special</span>
                <Heart className="h-4 w-4 text-red-400 fill-red-400" />
              </div>
              <h1 className="text-4xl md:text-6xl font-serif tracking-wider text-foreground">CAFÉ DE LUNA</h1>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Warm-toned highlight wigs inspired by your favourite café flavours</p>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (<Skeleton key={i} className="aspect-[3/4] rounded-xl" />))}
          </div>
        ) : products.length > 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {products.map((product) => (<ProductCard key={product.id} product={product} />))}
          </motion.div>
        ) : (
          <div className="text-center py-16"><p className="text-muted-foreground">No products found in this collection.</p></div>
        )}
      </div>
    </PageLayout>
  );
}

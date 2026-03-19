import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchCmsProductsByCollection, CmsProduct } from '@/lib/cms-products';
import { ProductCard } from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const PremiumAccessoriesCollection = () => {
  const [products, setProducts] = useState<CmsProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchCmsProductsByCollection('premium-accessories', 50);
        setProducts(data);
      } catch (error) {
        console.error('Error loading Premium Accessories collection:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden mt-36 md:mt-40">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('/src/assets/collection-accessories.jpg')` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="font-heading text-4xl md:text-6xl text-white mb-4">Premium Accessories</h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto">Essential tools and storage solutions for maintaining your luxury hair</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (<div key={i} className="space-y-4"><Skeleton className="aspect-square w-full rounded-lg" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>))}
          </div>
        ) : products.length > 0 ? (
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div key={product.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16"><p className="text-muted-foreground text-lg">No products found in this collection.</p></div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PremiumAccessoriesCollection;

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchCollectionProducts, ShopifyProduct } from '@/lib/shopify';
import { ProductCardWithQuickView } from '@/components/ProductCardWithQuickView';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const PremiumAccessoriesCollection = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const collectionProducts = await fetchCollectionProducts('premium-accessories', 50);
        setProducts(collectionProducts);
      } catch (error) {
        console.error('Error loading Premium Accessories collection:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('/src/assets/collection-accessories.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-heading text-4xl md:text-6xl text-white mb-4">
              Premium Accessories
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto">
              Essential tools and storage solutions for maintaining your luxury hair
            </p>
          </motion.div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
            Shop the Collection
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From premium brushes to elegant storage bags, discover the accessories that keep your hair looking flawless
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {products.map((product) => (
              <motion.div key={product.node.id} variants={itemVariants}>
                <ProductCardWithQuickView product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No products found in this collection. Check back soon!
            </p>
          </div>
        )}

        {/* Collection Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 bg-card rounded-2xl p-8 md:p-12"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="font-heading text-2xl md:text-3xl text-foreground mb-6">
              Complete Your Hair Care Routine
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Our premium accessories collection features everything you need to maintain and protect 
              your investment. The Luna Hair Storage Bag keeps your extensions safe and tangle-free, 
              while our Luna Premium Brushes are specially designed to gently detangle without 
              damaging delicate hair fibers.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Each accessory is crafted with the same attention to quality that defines all 
              Luna Lux Hair products, ensuring your hair stays beautiful between installations.
            </p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default PremiumAccessoriesCollection;

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Star } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchBestsellers, ShopifyProduct } from "@/lib/shopify";
import { Skeleton } from "@/components/ui/skeleton";

export const NewArrivals = () => {
  const { formatPrice, t } = useCurrency();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  useEffect(() => {
    const loadBestsellers = async () => {
      try {
        // Fetch products from the "bestsellers" collection on Shopify
        const bestsellers = await fetchBestsellers(6);
        setProducts(bestsellers.slice(0, 3)); // Show top 3 for homepage
      } catch (error) {
        console.error('Failed to load bestsellers:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBestsellers();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-3xl md:text-4xl font-serif mb-4 tracking-wider">
            BESTSELLERS
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our most loved products, handpicked by our community
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground">No bestsellers available</p>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.node.id}
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="group relative bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                <Link to={`/product/${product.node.handle}`} className="block">
                  <div className="aspect-square overflow-hidden bg-secondary/20">
                    <motion.img
                      src={product.node.images.edges[0]?.node.url || '/placeholder.svg'}
                      alt={product.node.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </Link>

                <motion.div 
                  className="absolute top-4 right-4 flex flex-col gap-2"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                >
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full shadow-lg hover:scale-110 transition-transform"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full shadow-lg hover:scale-110 transition-transform"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                </motion.div>

                <div className="p-6">
                  <Link to={`/product/${product.node.handle}`}>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {product.node.title}
                    </h3>
                  </Link>
                  <p className="text-2xl font-bold text-primary mb-4">
                    {formatPrice(parseFloat(product.node.priceRange.minVariantPrice.amount))}
                  </p>
                  <Button className="w-full" variant="default">
                    {t('shopNow')}
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

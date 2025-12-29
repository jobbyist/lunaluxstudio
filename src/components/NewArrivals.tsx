import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Star } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import newArrival1 from "@/assets/new-arrival-1.jpg";
import newArrival2 from "@/assets/new-arrival-2.jpg";
import newArrival3 from "@/assets/new-arrival-3.jpg";

export const NewArrivals = () => {
  const { formatPrice, t } = useCurrency();
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const products = [
    {
      id: 1,
      title: t('newArrival1Title'),
      price: 999.99,
      image: newArrival1,
      handle: "brazilian-straight-bundle",
    },
    {
      id: 2,
      title: t('newArrival2Title'),
      price: 999.99,
      image: newArrival2,
      handle: "lace-front-wave-wig",
    },
    {
      id: 3,
      title: t('newArrival3Title'),
      price: 999.99,
      image: newArrival3,
      handle: "hd-lace-frontal",
    },
  ];

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
    <section ref={sectionRef} className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-3xl md:text-4xl font-helvetica uppercase mb-4 tracking-wider">
            {t('newArrivals').toUpperCase()}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our latest collection of premium hair products
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group relative bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <Link to={`/product/${product.handle}`} className="block">
                <div className="aspect-square overflow-hidden bg-secondary/20">
                  <motion.img
                    src={product.image}
                    alt={product.title}
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
                <Link to={`/product/${product.handle}`}>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                </Link>
                <p className="text-2xl font-bold text-primary mb-4">
                  {formatPrice(product.price)}
                </p>
                <Button className="w-full" variant="default">
                  {t('shopNow')}
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
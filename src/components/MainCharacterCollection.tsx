import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import productPlaceholder from "@/assets/product-placeholder.webp";

const mainCharacterWigs = [
  {
    id: "mc-1",
    title: "Classic Bob Wig",
    image: productPlaceholder,
    price: 999.00,
    handle: "classic-bob-wig"
  },
  {
    id: "mc-2",
    title: "Long Straight Wig",
    image: productPlaceholder,
    price: 999.00,
    handle: "long-straight-wig"
  },
  {
    id: "mc-3",
    title: "Curly Shoulder Length Wig",
    image: productPlaceholder,
    price: 999.00,
    handle: "curly-shoulder-wig"
  },
  {
    id: "mc-4",
    title: "Natural Wave Wig",
    image: productPlaceholder,
    price: 999.00,
    handle: "natural-wave-wig"
  }
];

export const MainCharacterCollection = () => {
  const { formatPrice } = useCurrency();
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, rotateY: -10 },
    visible: {
      opacity: 1,
      y: 0,
      rotateY: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <motion.section 
      ref={sectionRef} 
      className="py-20 bg-card overflow-hidden"
      style={{ opacity }}
    >
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-serif mb-4 tracking-wider"
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.2em" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            THE MAIN CHARACTER
          </motion.h2>
          <motion.p 
            className="text-muted-foreground max-w-2xl mx-auto mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Non-custom, readily available wigs for immediate purchase. Look and feel like the main character in your story.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button asChild variant="outline">
              <Link to="/collection/main-character">View Full Collection</Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {mainCharacterWigs.map((wig, index) => (
            <motion.div
              key={wig.id}
              variants={cardVariants}
              whileHover={{ 
                y: -10, 
                scale: 1.03,
                transition: { duration: 0.3 } 
              }}
            >
              <Card className="group overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <Link to={`/product/${wig.handle}`}>
                  <div className="aspect-square overflow-hidden bg-muted">
                    <motion.img
                      src={wig.image}
                      alt={wig.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2 text-center">{wig.title}</h3>
                    <p className="text-primary font-semibold text-center">
                      {formatPrice(wig.price)}
                    </p>
                  </CardContent>
                </Link>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};
import { CollectionCard } from "./CollectionCard";
import { motion } from "framer-motion";
import brazilianImage from "@/assets/hero-1.jpg";
import vietnameseImage from "@/assets/hero-2.jpg";
import rawVietnameseImage from "@/assets/hero-3.jpg";

export const Collections = () => {

  const collections = [
    {
      title: "Brazilian Virgin",
      image: brazilianImage,
      slug: "brazilian-virgin",
    },
    {
      title: "Vietnamese Virgin",
      image: vietnameseImage,
      slug: "vietnamese-virgin",
    },
    {
      title: "Raw Vietnamese",
      image: rawVietnameseImage,
      slug: "raw-vietnamese",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="py-20 bg-background overflow-hidden relative">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-3xl md:text-4xl font-serif mb-4 tracking-wider">
            SHOP BY COLLECTION
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our premium hair collections, each crafted with the finest quality materials
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {collections.map((collection, index) => (
            <motion.div
              key={collection.slug}
              variants={cardVariants}
              whileHover={{ 
                y: -15, 
                scale: 1.02,
                transition: { duration: 0.3 } 
              }}
            >
              <CollectionCard
                title={collection.title}
                image={collection.image}
                slug={collection.slug}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
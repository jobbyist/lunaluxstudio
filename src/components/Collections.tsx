import { CollectionCard } from "./CollectionCard";
import { motion } from "framer-motion";
import brazilianImage from "@/assets/collection-brazilian.jpg";
import vietnameseImage from "@/assets/collection-vietnamese.jpg";
import rawVietnameseImage from "@/assets/collection-raw-vietnamese.jpg";
import accessoriesImage from "@/assets/collection-accessories.jpg";

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
    {
      title: "Premium Accessories",
      image: accessoriesImage,
      slug: "premium-accessories",
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
    <section className="section-shell bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <motion.div 
          className="mb-12 flex items-end justify-between border-b border-border pb-5"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div>
            <p className="eyebrow mb-3">Curated for you</p>
            <h2 className="text-4xl md:text-6xl font-serif font-normal">Shop the collection</h2>
          </div>
          <p className="hidden max-w-sm text-right text-sm leading-6 text-muted-foreground md:block">Premium textures, considered details, and timeless movement.</p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {collections.map((collection, index) => (
            <motion.div
              key={collection.slug}
              variants={cardVariants}
              className={index === 0 ? "col-span-2 md:col-span-5 md:row-span-2" : index === 3 ? "col-span-2 md:col-span-4" : "col-span-1 md:col-span-3"}
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
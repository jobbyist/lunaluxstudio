import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import luxuryImage from "@/assets/collection-wigs.jpg";

export const LuxuryHairExtensionsHighlight = () => {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <motion.div
            className="relative overflow-hidden rounded-3xl shadow-xl"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <img
              src={luxuryImage}
              alt="Luxury Hair Extensions collection"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-background/70 via-transparent to-transparent" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-3">
              Featured Collection
            </p>
            <h2 className="text-3xl md:text-4xl font-serif tracking-wider mb-4">
              Luxury Hair Extensions
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Discover ultra-premium, natural-looking extensions crafted for seamless blending,
              lasting softness, and effortless styling. Elevate every look with hand-selected
              lengths, textures, and finishes.
            </p>
            <Button asChild size="lg">
              <Link to="/collections/luxury-hair-extensions">Shop Luxury Hair Extensions</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

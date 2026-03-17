import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import luxuryImage from "@/assets/clip-in-hair-extension.png";

interface LuxuryHairExtensionsHighlightProps {
  content?: Record<string, string>;
}

export const LuxuryHairExtensionsHighlight = ({ content }: LuxuryHairExtensionsHighlightProps) => {
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
              alt="Clip-In Hair Extensions"
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
              {content?.subtitle || 'Featured Product'}
            </p>
            <h2 className="text-3xl md:text-4xl font-serif tracking-wider mb-4">
              {content?.title || 'Virgin Hair Clip-In Extensions'}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {content?.description || 'Experience the transformative power of premium virgin Remy Brazilian hair with our clip-in extensions. Crafted with ultra-thin, seamless wefts that sit flat against your scalp, these extensions deliver unparalleled comfort and a naturally blended finish. Treat them like your own hair—cut, color, wash, and style with complete freedom. One set provides full coverage for naturally dense hair, while two sets create the voluminous, luxurious look most clients desire. Each set is a versatile investment in your hair\'s potential.'}
            </p>
            <Button asChild size="lg">
              <Link to={content?.cta_link || '/product/virgin-hair-clip-in-extensions'}>
                {content?.cta_text || 'Order This Product'}
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

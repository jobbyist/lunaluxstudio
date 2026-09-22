import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import luxuryImage from "@/assets/clip-in-hair-extension.png";

export const LuxuryHairExtensionsHighlight = () => {
  return (
    <section className="section-shell bg-background">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-0 items-stretch">
          <motion.div
            className="relative min-h-[440px] overflow-hidden"
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
          </motion.div>
          <motion.div className="flex flex-col justify-center bg-card px-7 py-12 md:px-14"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <p className="eyebrow mb-4">
              Featured Product
            </p>
            <h2 className="text-4xl md:text-6xl font-serif font-normal mb-5 leading-none">
              Virgin Hair Clip-In Extensions
            </h2>
            <p className="text-sm text-muted-foreground leading-7 mb-7">
              Experience the transformative power of premium virgin Remy Brazilian hair with our clip-in extensions.
              Crafted with ultra-thin, seamless wefts that sit flat against your scalp, these extensions deliver unparalleled comfort and a naturally blended finish. 
              Treat them like your own hair—cut, color, wash, and style with complete freedom. 
              One set provides full coverage for naturally dense hair, while two sets create the voluminous, luxurious look most clients desire. 
              Each set is a versatile investment in your hair's potential.

            </p>
            <Button asChild size="lg" className="w-fit rounded-none px-7 text-xs uppercase tracking-[0.16em]">
              <Link to="/product/virgin-hair-clip-in-extensions">Order This Product</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import cafeDeLunaImage from "@/assets/valentines-cafe-de-luna.jpg";

export const CafeDeLunaSection = () => {
  return (
    <section className="section-shell bg-card overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="relative overflow-hidden"
        >
          <Link to="/collection/cafe-de-luna" className="block group">
            <div className="relative min-h-[500px] md:aspect-[16/7] md:min-h-0">
              <img
                src={cafeDeLunaImage}
                alt="Café De Luna Collection – warm-toned highlight hair"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
               <div className="absolute inset-0 bg-gradient-to-r from-dark/80 via-dark/45 to-transparent" />

              <div className="absolute inset-0 flex flex-col items-start justify-center px-8 md:px-16">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <p className="mb-4 text-[10px] uppercase tracking-[0.24em] text-primary-foreground/70">LunaLux signature</p>
                  <h2 className="text-5xl md:text-7xl font-serif text-primary-foreground mb-4 font-normal">
                    Café De Luna
                  </h2>
                  <p className="text-primary-foreground/75 text-sm md:text-base max-w-md mb-7 leading-7">
                    Warm-toned highlights inspired by your favourite café flavours. Rich, luxurious, and effortlessly beautiful.
                  </p>
                  <Button
                    variant="outline"
                    className="h-12 rounded-none border-primary-foreground/50 bg-transparent px-8 text-xs uppercase tracking-[0.16em] text-primary-foreground hover:bg-primary-foreground hover:text-dark"
                  >
                    Shop the Collection
                  </Button>
                </motion.div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

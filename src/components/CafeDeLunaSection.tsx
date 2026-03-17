import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import cafeDeLunaImage from "@/assets/valentines-cafe-de-luna.jpg";

interface CafeDeLunaSectionProps {
  content?: Record<string, string>;
}

export const CafeDeLunaSection = ({ content }: CafeDeLunaSectionProps) => {
  const title = content?.title || "Café De Luna";
  const subtitle = content?.subtitle || "Featured Collection";
  const description = content?.description || "Warm-toned highlights inspired by your favourite café flavours. Rich, luxurious, and effortlessly beautiful.";
  const ctaText = content?.cta_text || "Shop the Collection";
  const ctaLink = content?.cta_link || "/collection/cafe-de-luna";
  return (
    <section className="py-16 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="relative rounded-2xl overflow-hidden max-w-6xl mx-auto"
        >
          <Link to={ctaLink} className="block group">
            <div className="relative aspect-[16/9] md:aspect-[16/7]">
              <img
                src={cafeDeLunaImage}
                alt="Café De Luna Collection – warm-toned highlight hair"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

              <div className="absolute inset-0 flex flex-col items-start justify-center px-8 md:px-16">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span className="text-xs uppercase tracking-[0.3em] text-amber-200 font-medium">
                      {subtitle}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-serif text-white mb-3 tracking-wide">
                    {title}
                  </h2>
                  <p className="text-white/80 text-sm md:text-base max-w-md mb-6">
                    {description}
                  </p>
                  <Button
                    variant="outline"
                    className="border-white/40 text-white hover:bg-white/10 hover:border-white/60 rounded-full px-8"
                  >
                    {ctaText}
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

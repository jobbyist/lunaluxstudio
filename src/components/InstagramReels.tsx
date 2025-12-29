import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { motion, useScroll, useTransform } from "framer-motion";
import tutorialBundles from "@/assets/tutorial-bundles.jpg";
import tutorialWigs from "@/assets/tutorial-wigs.jpg";
import tutorialFrontals from "@/assets/tutorial-frontals.jpg";

export const InstagramReels = () => {
  const { t } = useCurrency();
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);
  
  const reels = [
    {
      id: 1,
      title: "Hair Bundle Unboxing",
      image: tutorialBundles,
      topic: "Bundles Collection",
      link: "https://www.instagram.com/reel/"
    },
    {
      id: 2,
      title: "Wig Installation Tutorial",
      image: tutorialWigs,
      topic: "Installation Guide",
      link: "https://www.instagram.com/reel/"
    },
    {
      id: 3,
      title: "Frontal Lace Styling",
      image: tutorialFrontals,
      topic: "Styling Tips",
      link: "https://www.instagram.com/reel/"
    },
    {
      id: 4,
      title: "Customer Transformation",
      image: tutorialBundles,
      topic: "Before & After",
      link: "https://www.instagram.com/reel/"
    },
    {
      id: 5,
      title: "Hair Care Routine",
      image: tutorialWigs,
      topic: "Maintenance Tips",
      link: "https://www.instagram.com/reel/"
    },
    {
      id: 6,
      title: "Color Matching Guide",
      image: tutorialFrontals,
      topic: "How To",
      link: "https://www.instagram.com/reel/"
    },
    {
      id: 7,
      title: "Custom Wig Making",
      image: tutorialBundles,
      topic: "Behind the Scenes",
      link: "https://www.instagram.com/reel/"
    },
    {
      id: 8,
      title: "Ponytail Install",
      image: tutorialWigs,
      topic: "Quick Style",
      link: "https://www.instagram.com/reel/"
    },
    {
      id: 9,
      title: "Virgin Hair Quality",
      image: tutorialFrontals,
      topic: "Product Showcase",
      link: "https://www.instagram.com/reel/"
    },
    {
      id: 10,
      title: "Curling Techniques",
      image: tutorialBundles,
      topic: "Styling Tutorial",
      link: "https://www.instagram.com/reel/"
    }
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reels.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, reels.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + reels.length) % reels.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reels.length);
  };

  const visibleReels = [
    reels[(currentIndex - 1 + reels.length) % reels.length],
    reels[currentIndex],
    reels[(currentIndex + 1) % reels.length],
  ];

  return (
    <motion.section 
      ref={sectionRef} 
      className="py-20 bg-background overflow-hidden"
      style={{ scale }}
    >
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-helvetica uppercase text-center mb-12 tracking-wider"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          {t('featuredStories').toUpperCase()}
        </motion.h2>

        <motion.div 
          className="relative max-w-6xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-4 md:gap-8">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="flex-shrink-0 hover:bg-primary/10"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 max-w-5xl">
              {visibleReels.map((reel, idx) => (
                <motion.a
                  key={`${reel.id}-${idx}`}
                  href={reel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative aspect-[9/16] rounded-lg overflow-hidden cursor-pointer ${
                    idx === 1 
                      ? 'z-10 shadow-2xl shadow-primary/20' 
                      : 'opacity-50 md:opacity-70'
                  }`}
                  initial={{ scale: idx === 1 ? 1 : 0.9 }}
                  animate={{ 
                    scale: idx === 1 ? 1.1 : 0.9,
                    opacity: idx === 1 ? 1 : 0.7
                  }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: idx === 1 ? 1.12 : 0.95 }}
                >
                  <img
                    src={reel.image}
                    alt={reel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <motion.div 
                    className="absolute top-4 right-4"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-primary/90 rounded-full p-2">
                      <ExternalLink className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </motion.div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p className="text-xs text-primary mb-1">{reel.topic}</p>
                    <h3 className="font-semibold">{reel.title}</h3>
                  </div>
                </motion.a>
              ))}
            </div>

            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="flex-shrink-0 hover:bg-primary/10"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </motion.div>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center mt-8 gap-2">
            {reels.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1 rounded-full transition-all ${
                  idx === currentIndex 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Go to reel ${idx + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};
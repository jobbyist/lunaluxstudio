import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
import heroImage from "@/assets/lunahero.png";
import { preloadImage } from "@/components/OptimizedImage";

export const Hero = () => {
  const { t } = useCurrency();
  const sectionRef = useRef<HTMLElement>(null);
  
  // Preload hero image on mount
  useEffect(() => {
    preloadImage(heroImage, 'high');
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section ref={sectionRef} className="relative min-h-[calc(100svh-6.5rem)] overflow-hidden bg-background">
      <div className="relative h-[64svh] min-h-[430px] md:absolute md:inset-0 md:h-auto">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ y, opacity }}
          className="w-full h-full"
        >
          <img
            src={heroImage}
            alt="LunaLuxHair Hero"
            loading="eager"
            decoding="async"
            // @ts-ignore - fetchpriority is valid
            fetchpriority="high"
            className="w-full h-full object-cover object-[58%_center] md:object-center"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background md:bg-gradient-to-r md:from-background/85 md:via-background/25 md:to-transparent" />
      </div>

      <div className="relative z-10 -mt-28 flex min-h-[36svh] items-end px-6 pb-14 md:mx-auto md:mt-0 md:min-h-[calc(100svh-6.5rem)] md:max-w-[1480px] md:items-center md:px-12">
        <motion.div
          className="max-w-xl space-y-6 text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >

          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <span className="h-px w-9 bg-primary" />
            <p className="eyebrow">Premium hair, thoughtfully curated</p>
          </motion.div>
          <motion.h1 variants={itemVariants} className="font-serif text-6xl font-normal leading-[0.82] md:text-8xl lg:text-[7.5rem]">
            Hair,<br /><span className="ml-5 italic md:ml-10">Elevated.</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="max-w-sm text-sm leading-7 text-muted-foreground md:text-base">
            Luxury hair designed to become part of your signature. Exceptional quality, effortless beauty.
          </motion.p>

          <motion.div 
            className="flex flex-col gap-3 pt-2 sm:flex-row"
            variants={itemVariants}
          >
            <motion.div variants={buttonVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <div className="relative block">
                <Button
                  asChild
                  size="lg"
                  className="h-12 w-full rounded-none bg-foreground px-8 text-xs uppercase tracking-[0.18em] text-background hover:bg-foreground/85 sm:w-auto"
                >
                  <Link to="/explore">
                    SHOP THE COLLECTION
                  </Link>
                </Button>
              </div>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 w-full rounded-none border-foreground/50 bg-background/40 px-8 text-xs uppercase tracking-[0.18em] backdrop-blur-sm sm:w-auto"
              >
                <Link to="/customize">BUILD A CUSTOM WIG</Link>
              </Button>
            </motion.div>
          </motion.div>

        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-5 right-6 hidden md:flex md:flex-col md:items-center md:gap-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Scroll</span>
        <motion.div className="h-10 w-px bg-border" animate={{ scaleY: [0.35, 1, 0.35] }} transition={{ duration: 2, repeat: Infinity }} />
      </motion.div>
    </section>
  );
};

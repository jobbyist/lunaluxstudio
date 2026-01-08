import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroImage from "@/assets/lunahero.png";

export const Hero = () => {
  const { t } = useCurrency();
  const sectionRef = useRef<HTMLElement>(null);
  
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
    <section ref={sectionRef} className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
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
            className="w-full h-full object-cover"
          />
        </motion.div>
        {/* Enhanced overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          className="text-center space-y-8 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Heading */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-cursive tracking-tight drop-shadow-lg"
              variants={itemVariants}
            >
              {t('heroTitle')} <span className="text-primary">{t('heroTitleHighlight')}</span>
            </motion.h1>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="pt-8 flex flex-col sm:flex-row gap-4 justify-center"
            variants={itemVariants}
          >
            <motion.div variants={buttonVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg relative animate-subtle-pulse shadow-lg"
              >
                <Link to="/customize">
                  {t('discoverCatalog')}
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg" aria-label="New feature">
                    New!
                  </span>
                </Link>
              </Button>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg backdrop-blur-sm bg-background/30 border-foreground/20"
              >
                <Link to="/collections">{t('bookExperience')}</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Feature Text */}
          <motion.div className="pt-12" variants={itemVariants}>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
              {t('heroDescription')}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <motion.div 
          className="w-6 h-10 border-2 border-primary rounded-full flex items-start justify-center p-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-1 h-2 bg-primary rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

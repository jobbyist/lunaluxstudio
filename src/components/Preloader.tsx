import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoSvg from "@/assets/luna.svg";

export const Preloader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress from 0 to 100 over ~4.5 seconds
    const duration = 4500;
    const interval = 50;
    const steps = duration / interval;
    const increment = 100 / steps;
    
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return next;
      });
    }, interval);

    // Close preloader after progress completes
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ backgroundColor: "hsl(0, 0%, 0%)" }}
        >
          {/* Logo */}
          <motion.img
            src={logoSvg}
            alt="Luna Lux Studio"
            className="w-48 h-auto mb-12"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          
          {/* Loading bar container */}
          <motion.div
            className="w-64 sm:w-80 flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Progress bar background */}
            <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/10">
              {/* Progress bar fill with gradient */}
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, hsl(340, 75%, 65%) 0%, hsl(340, 75%, 85%) 50%, hsl(347, 34%, 82%) 100%)",
                  width: `${progress}%`,
                }}
                initial={{ width: 0 }}
                transition={{ ease: "linear" }}
              />
            </div>
            
            {/* Loading text */}
            <motion.p
              className="text-sm tracking-[0.2em] uppercase"
              style={{ color: "hsl(340, 20%, 85%)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Loading Your Experience…
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

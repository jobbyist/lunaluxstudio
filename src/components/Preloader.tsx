import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Array of 15 inspirational quotes about women for International Women's Month
const INSPIRATIONAL_QUOTES = [
  "A woman is the full circle. Within her is the power to create, nurture and transform.",
  "The question isn't who's going to let me; it's who's going to stop me.",
  "There is no limit to what we, as women, can accomplish.",
  "A strong woman looks a challenge in the eye and gives it a wink.",
  "She believed she could, so she did.",
  "Women are the real architects of society.",
  "Empowered women empower women.",
  "A woman with a voice is, by definition, a strong woman.",
  "The future is female.",
  "Well-behaved women seldom make history.",
  "A girl should be two things: who and what she wants.",
  "I am woman, phenomenally. Phenomenal woman, that's me.",
  "The most courageous act is still to think for yourself. Aloud.",
  "Women belong in all places where decisions are being made.",
  "She is clothed in strength and dignity, and she laughs without fear of the future."
];

const PRELOADER_SESSION_KEY = "lunastudio_preloader_shown";

export const Preloader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [quote] = useState(() => {
    // Select a random quote from the array
    const randomIndex = Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length);
    return INSPIRATIONAL_QUOTES[randomIndex];
  });
  const [duration] = useState(() => {
    // Random duration between 5-8 seconds (5000-8000ms)
    return Math.floor(Math.random() * 3000) + 5000;
  });

  useEffect(() => {
    // Check if preloader has already been shown in this session
    const hasBeenShown = sessionStorage.getItem(PRELOADER_SESSION_KEY);
    
    if (hasBeenShown) {
      // Don't show preloader if it's already been shown this session
      setIsLoading(false);
      return;
    }

    // Mark as shown in session storage
    sessionStorage.setItem(PRELOADER_SESSION_KEY, "true");

    // Animate progress from 0 to 100 over the random duration
    const progressDuration = duration - 500; // End progress slightly before closing
    const interval = 50;
    const steps = progressDuration / interval;
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

    // Close preloader after the random duration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [duration]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black px-4"
        >
          {/* Logo */}
          <motion.img
            src="/lunalove.png"
            alt="Luna Lux Studio"
            className="mb-12"
            style={{ width: "200px", height: "auto" }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          
          {/* Loading bar container */}
          <motion.div
            className="w-64 sm:w-80 flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Progress bar background */}
            <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/10">
              {/* Progress bar fill with gradient and glow */}
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, hsl(340, 75%, 65%) 0%, hsl(340, 75%, 85%) 50%, hsl(347, 34%, 82%) 100%)",
                  width: `${progress}%`,
                  boxShadow: "0 0 12px hsl(340, 75%, 75%), 0 0 24px hsl(340, 75%, 70% / 0.5), 0 0 40px hsl(340, 75%, 65% / 0.3)",
                }}
                initial={{ width: 0 }}
                transition={{ ease: "linear" }}
              />
            </div>
            
            {/* Inspirational Quote */}
            <motion.p
              className="text-center text-sm sm:text-base italic text-white/90 max-w-md leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              "{quote}"
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

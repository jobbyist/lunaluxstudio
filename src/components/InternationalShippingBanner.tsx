import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";

const BANNER_DELAY_MS = 45000; // 45 seconds
const BANNER_STORAGE_KEY = "luna-shipping-banner-dismissed";
const BANNER_EXPIRY_DAYS = 7;

export const InternationalShippingBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(BANNER_STORAGE_KEY);
    if (dismissed) {
      const daysSince = (Date.now() - parseInt(dismissed, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < BANNER_EXPIRY_DAYS) return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, BANNER_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(BANNER_STORAGE_KEY, Date.now().toString());
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 text-white rounded-2xl shadow-2xl p-5 md:p-6">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-start gap-4 pr-8">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Plane className="h-6 w-6" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-semibold mb-1">
                    🌍 Now Shipping Internationally!
                  </h3>
                  <p className="text-sm md:text-base text-blue-50 mb-3">
                    We now offer international shipping via FedEx for just <span className="font-bold">$35</span>. 
                    Get your Luna Luxury Hair products delivered worldwide!
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white text-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        window.location.href = "/policies#shipping";
                        handleDismiss();
                      }}
                    >
                      Learn More
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={handleDismiss}
                    >
                      Got it
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

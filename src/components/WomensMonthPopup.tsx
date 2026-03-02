import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Gift, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const POPUP_DELAY_MS = 15000; // 15 seconds
const POPUP_STORAGE_KEY = "luna-womens-month-popup-shown";
const POPUP_EXPIRY_HOURS = 24;

export const WomensMonthPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const lastShown = localStorage.getItem(POPUP_STORAGE_KEY);
    if (lastShown) {
      const hoursSince = (Date.now() - parseInt(lastShown, 10)) / (1000 * 60 * 60);
      if (hoursSince < POPUP_EXPIRY_HOURS) return;
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem(POPUP_STORAGE_KEY, Date.now().toString());
    }, POPUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => setIsOpen(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-none bg-transparent shadow-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative rounded-2xl overflow-hidden bg-card"
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-100 to-pink-100 dark:from-pink-950/40 dark:via-purple-950/40 dark:to-pink-950/40" />
              
              {/* Decorative pattern overlay */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

              {/* Content */}
              <div className="relative px-6 py-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Heart className="h-5 w-5 text-pink-500 fill-pink-500 animate-pulse" />
                  <Badge className="bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30">
                    International Women's Month
                  </Badge>
                  <Heart className="h-5 w-5 text-pink-500 fill-pink-500 animate-pulse" />
                </div>

                <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-3 tracking-wide">
                  Celebrating Women
                </h2>

                <p className="text-muted-foreground text-sm md:text-base max-w-sm mx-auto mb-6">
                  This March, we honor the strength and beauty of women everywhere with an exclusive offer
                </p>

                {/* Special Offer Highlight */}
                <div className="bg-card/80 backdrop-blur rounded-xl p-5 mb-6 border-2 border-pink-200 dark:border-pink-800">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Gift className="h-5 w-5 text-pink-500" />
                    <span className="font-semibold text-lg">Exclusive Offer</span>
                  </div>
                  
                  <p className="text-base font-medium mb-1">
                    Get a <span className="text-pink-600 dark:text-pink-400 font-bold">FREE 10" 2x6 inch bob</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    with any purchase from Café De Luna or Raw Vietnamese Bundles
                  </p>
                  
                  <div className="mt-3 text-xs text-muted-foreground italic">
                    *Automatically added to qualifying orders
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button asChild size="lg" className="w-full btn-glow">
                    <Link to="/womens-month" onClick={handleClose}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Shop the Promotion
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleClose} className="text-muted-foreground">
                    Maybe later
                  </Button>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

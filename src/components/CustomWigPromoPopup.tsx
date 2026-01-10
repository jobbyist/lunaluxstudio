import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Truck, Scissors, X } from "lucide-react";
import { Link } from "react-router-dom";

const POPUP_DELAY_MS = 60000; // 60 seconds
const POPUP_STORAGE_KEY = "luna-custom-wig-promo-shown";
const POPUP_EXPIRY_HOURS = 24; // Don't show again for 24 hours after dismissal

export const CustomWigPromoPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if popup was recently shown
    const lastShown = localStorage.getItem(POPUP_STORAGE_KEY);
    if (lastShown) {
      const lastShownTime = parseInt(lastShown, 10);
      const hoursSinceShown = (Date.now() - lastShownTime) / (1000 * 60 * 60);
      if (hoursSinceShown < POPUP_EXPIRY_HOURS) {
        return; // Don't show popup again within 24 hours
      }
    }

    // Set up timer to show popup after 60 seconds of interaction
    let interactionTimer: NodeJS.Timeout | null = null;
    let hasInteracted = false;

    const startTimer = () => {
      if (interactionTimer || hasInteracted) return;
      hasInteracted = true;
      
      interactionTimer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem(POPUP_STORAGE_KEY, Date.now().toString());
      }, POPUP_DELAY_MS);
    };

    // Listen for user interactions
    const events = ['scroll', 'click', 'mousemove', 'keydown', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, startTimer, { once: true, passive: true });
    });

    return () => {
      if (interactionTimer) {
        clearTimeout(interactionTimer);
      }
      events.forEach(event => {
        window.removeEventListener(event, startTimer);
      });
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md overflow-hidden border-primary/20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Decorative gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
              
              <DialogHeader className="relative">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    <Truck className="h-3 w-3 mr-1" />
                    FREE SHIPPING
                  </Badge>
                </div>
                <DialogTitle className="text-2xl font-serif text-center">
                  Build Your Perfect Look
                </DialogTitle>
                <DialogDescription className="text-center">
                  Create your dream custom wig with our easy-to-use Wig Builder
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Key benefits */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Free Shipping Included</p>
                      <p className="text-xs text-muted-foreground">On every custom wig order</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                      <Scissors className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Fully Customizable</p>
                      <p className="text-xs text-muted-foreground">Choose texture, length, color & more</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                    <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-950 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Premium Quality</p>
                      <p className="text-xs text-muted-foreground">100% virgin human hair</p>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <Button asChild size="lg" className="w-full btn-glow">
                    <Link to="/customize" onClick={handleClose}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Start Building Now
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
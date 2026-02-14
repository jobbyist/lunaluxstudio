import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import valentinesImage from "@/assets/valentines-cafe-de-luna.jpg";

const POPUP_DELAY_MS = 3000;
const POPUP_STORAGE_KEY = "luna-valentines-popup-shown";
const POPUP_EXPIRY_HOURS = 24;

export const ValentinesPopup = () => {
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
              {/* Banner Image */}
              <div className="relative w-full aspect-[16/10]">
                <img
                  src={valentinesImage}
                  alt="Café De Luna Valentine's Collection"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative px-6 pb-6 -mt-16 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-red-400 fill-red-400 animate-pulse" />
                  <span className="text-xs uppercase tracking-[0.3em] text-red-400 font-medium">
                    Valentine's Day Special
                  </span>
                  <Heart className="h-4 w-4 text-red-400 fill-red-400 animate-pulse" />
                </div>

                <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-2 tracking-wide">
                  Café De Luna
                </h2>

                <p className="text-muted-foreground text-sm md:text-base max-w-sm mx-auto mb-6">
                  Love is in the hair… Warm-toned highlights crafted for the one who deserves something special.
                </p>

                <div className="flex flex-col gap-2">
                  <Button asChild size="lg" className="w-full btn-glow">
                    <Link to="/collection/cafe-de-luna" onClick={handleClose}>
                      <Heart className="mr-2 h-4 w-4 fill-current" />
                      Shop the Collection
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

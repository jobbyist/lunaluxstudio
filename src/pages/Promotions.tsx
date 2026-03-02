import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { Tag, Bell, ArrowRight, Heart, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Promotions = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Tag className="h-4 w-4" />
              <span className="text-sm font-medium">Special Offers</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">
              Promotions & Specials
            </h1>
            
            {/* Active Promotion - International Women's Month */}
            <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-background dark:from-pink-950/20 dark:via-purple-950/20 dark:to-card border-2 border-pink-200 dark:border-pink-800 rounded-2xl p-8 md:p-12 mt-8 mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
                <Badge className="bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30">
                  Active Promotion
                </Badge>
                <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-serif mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                International Women's Month
              </h2>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <Gift className="h-6 w-6 text-pink-500" />
                <p className="text-lg md:text-xl font-medium">
                  Get a <span className="text-pink-600 dark:text-pink-400 font-bold">FREE 10" 2x6 inch bob</span>
                </p>
              </div>
              
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Purchase any item from our Café De Luna or Raw Vietnamese Bundles collections 
                and receive a complimentary 10" 2x6 inch bob — automatically added to your order!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="btn-glow">
                  <Link to="/womens-month" className="gap-2">
                    <Heart className="h-4 w-4 fill-current" />
                    View Promotion Details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg">
                  <Link to="/collection/cafe-de-luna" className="gap-2">
                    Shop Café De Luna
                  </Link>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-6 italic">
                Valid during International Women's Month (March 2026)
              </p>
            </div>
            
            {/* Other Promotions Section */}
            <div className="bg-card border border-border rounded-2xl p-8 md:p-12 mt-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Bell className="h-10 w-10 text-muted-foreground" />
              </div>
              
              <h3 className="text-2xl font-serif mb-4">
                Other Promotions
              </h3>
              
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                No other active promotions at the moment. 
                Check back later for more exclusive deals and offers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline" size="lg">
                  <Link to="/explore" className="gap-2">
                    Browse Products
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Button asChild size="lg">
                  <Link to="/loyalty" className="gap-2">
                    Join Lux Club
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-8">
              Want to be the first to know about new promotions?{" "}
              <Link to="/loyalty" className="text-primary hover:underline">
                Join The Lux Club
              </Link>{" "}
              for exclusive member-only offers.
            </p>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Promotions;

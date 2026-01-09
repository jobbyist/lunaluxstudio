import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { Tag, Bell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
            
            <div className="bg-card border border-border rounded-2xl p-8 md:p-12 mt-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Bell className="h-10 w-10 text-muted-foreground" />
              </div>
              
              <h2 className="text-2xl font-serif mb-4">
                No Active Promotions
              </h2>
              
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                There are no active promotions or specials available at the moment. 
                Please check back later for exclusive deals and offers.
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

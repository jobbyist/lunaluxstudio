import { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts, fetchCollectionByHandle, ShopifyProduct } from "@/lib/shopify";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Heart, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CAFE_DE_LUNA_HANDLES = [
  "5x5-hd-highlight-wig",
  "highlight-wig-virgin-vietnamese-bundles",
];

export default function WomensMonth() {
  const [cafeProducts, setCafeProducts] = useState<ShopifyProduct[]>([]);
  const [rawProducts, setRawProducts] = useState<ShopifyProduct[]>([]);
  const [freeBobProducts, setFreeBobProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Fetch Cafe De Luna products
        const cafeData = await fetchProducts(20, "title:highlight wig");
        const filteredCafe = cafeData.filter((p) =>
          CAFE_DE_LUNA_HANDLES.includes(p.node.handle)
        );
        setCafeProducts(filteredCafe.length > 0 ? filteredCafe : cafeData.slice(0, 2));

        // Fetch Raw Vietnamese products
        const rawData = await fetchCollectionByHandle("raw-vietnamese", 8);
        setRawProducts(rawData);

        // Fetch bob products (searching for 2x6 closure)
        const bobData = await fetchProducts(20, "title:2x6 OR title:closure");
        setFreeBobProducts(bobData.slice(0, 2));
      } catch (error) {
        console.error("Error fetching Women's Month products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative -mx-4 md:-mx-8 lg:-mx-16 -mt-8 md:-mt-12 mb-12">
        <div className="relative min-h-[60vh] bg-gradient-to-br from-pink-50 via-purple-50 to-background dark:from-pink-950/20 dark:via-purple-950/20 dark:to-background">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
          
          <div className="relative container mx-auto px-4 py-16 md:py-24 flex items-center justify-center min-h-[60vh]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl"
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
                <Badge className="bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30">
                  International Women's Month 2026
                </Badge>
                <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Luna Luxury Hair Celebrates Women
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                This International Women's Month, we celebrate the strength, beauty, and resilience of women everywhere
              </p>

              {/* Special Offer Highlight */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-card border-2 border-pink-200 dark:border-pink-800 rounded-2xl p-6 md:p-8 mb-8"
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Gift className="h-6 w-6 text-pink-500" />
                  <h2 className="text-2xl md:text-3xl font-serif text-foreground">
                    Exclusive Offers
                  </h2>
                  <Gift className="h-6 w-6 text-pink-500" />
                </div>
                
                <p className="text-lg md:text-xl font-medium mb-2">
                  Get a <span className="text-pink-600 dark:text-pink-400 font-bold">FREE 10" 2x6 inch bob</span>
                </p>
                <p className="text-muted-foreground mb-4">
                  when you purchase any item from our Café De Luna or Raw Vietnamese Bundles collections
                </p>
                
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-xl p-4 mb-4 border border-pink-200 dark:border-pink-800">
                  <p className="text-base font-semibold text-black dark:text-white mb-1">
                    🎁 BONUS OFFER
                  </p>
                  <p className="text-sm text-black dark:text-white">
                    New and existing members of The Lux Club will earn <span className="font-bold text-pink-600 dark:text-pink-400">DOUBLE</span> the loyalty rewards points for all purchases made throughout International Women's Month.
                  </p>
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground italic">
                  *Free bob automatically added to qualifying orders at checkout
                </div>
              </motion.div>

              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" className="btn-glow" asChild>
                  <a href="#cafe-de-luna">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Shop Café De Luna
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#raw-vietnamese">
                    Shop Raw Vietnamese
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Promo Video Section */}
      <section className="mb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Celebrating Women's Stories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Watch our special International Women's Month campaign video
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="aspect-video bg-muted rounded-2xl overflow-hidden border-2 border-border">
              <video 
                className="w-full h-full object-cover"
                autoPlay 
                loop 
                muted
                playsInline
                controls
              >
                <source src="/womensmonth.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Café De Luna Collection */}
      <section id="cafe-de-luna" className="mb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Café De Luna Collection
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Warm-toned highlights inspired by your favorite café flavors
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cafeProducts.map((product, index) => (
                <motion.div
                  key={product.node.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Raw Vietnamese Collection */}
      <section id="raw-vietnamese" className="mb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Raw Vietnamese Bundles Collection
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ultra-premium raw Vietnamese hair for the most discerning customers
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {rawProducts.map((product, index) => (
                <motion.div
                  key={product.node.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Free Bob Showcase */}
      <section className="mb-16 bg-gradient-to-br from-pink-50 via-purple-50 to-background dark:from-pink-950/10 dark:via-purple-950/10 dark:to-background py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <Badge className="bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30 mb-4">
              Your Free Gift
            </Badge>
            <h2 className="text-3xl md:text-4xl font-serif mb-4 text-foreground">
              Free 10" 2x6 Inch Bob
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-2">
              Receive this premium bob absolutely free with qualifying purchases
            </p>
            <p className="text-sm text-muted-foreground italic">
              *Value: $150 - Automatically added to cart with qualifying orders
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          ) : freeBobProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {freeBobProducts.map((product, index) => (
                <motion.div
                  key={product.node.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="absolute -top-3 -right-3 z-10">
                    <Badge className="bg-pink-500 text-white shadow-lg">
                      FREE GIFT
                    </Badge>
                  </div>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-card rounded-2xl border max-w-md mx-auto">
              <Gift className="h-12 w-12 text-pink-500 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Free bob details will be added to your cart at checkout
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Terms and Conditions */}
      <section className="mb-8">
        <div className="container mx-auto px-4">
          <div className="bg-muted/50 rounded-lg p-6 max-w-3xl mx-auto">
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider">
              Promotion Terms & Conditions
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Valid for purchases made during International Women's Month (March 2026)</li>
              <li>• Free 10" 2x6 inch bob automatically added to qualifying orders</li>
              <li>• Qualifying purchase: Any item from Café De Luna or Raw Vietnamese Bundles collections</li>
              <li>• BONUS: New and existing members of The Lux Club will earn DOUBLE the loyalty rewards points for all purchases made throughout International Women's Month</li>
              <li>• Terms and conditions apply. Offer valid while stocks last</li>
              <li>• Items purchased through a sale/promotion are not eligible for a refund/exchange unless otherwise specified by management</li>
              <li>• Promotion cannot be combined with other offers unless specified</li>
              <li>• Luna Luxury Hair reserves the right to modify or cancel this promotion at any time</li>
            </ul>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

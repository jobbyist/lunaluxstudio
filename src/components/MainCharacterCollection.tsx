import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import { motion } from "framer-motion";
import productPlaceholder from "@/assets/product-placeholder.webp";

// Sample wig data for The Main Character collection
const mainCharacterWigs = [
  {
    id: "mc-1",
    title: "Classic Bob Wig",
    image: productPlaceholder,
    price: 999.00,
    handle: "classic-bob-wig"
  },
  {
    id: "mc-2",
    title: "Long Straight Wig",
    image: productPlaceholder,
    price: 999.00,
    handle: "long-straight-wig"
  },
  {
    id: "mc-3",
    title: "Curly Shoulder Length Wig",
    image: productPlaceholder,
    price: 999.00,
    handle: "curly-shoulder-wig"
  },
  {
    id: "mc-4",
    title: "Natural Wave Wig",
    image: productPlaceholder,
    price: 999.00,
    handle: "natural-wave-wig"
  }
];

export const MainCharacterCollection = () => {
  const { formatPrice } = useCurrency();

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif mb-4 tracking-wider">
            THE MAIN CHARACTER
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Non-custom, readily available wigs for immediate purchase. Look and feel like the main character in your story.
          </p>
          <Button asChild variant="outline">
            <Link to="/collection/main-character">View Full Collection</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {mainCharacterWigs.map((wig, index) => (
            <motion.div
              key={wig.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                <Link to={`/product/${wig.handle}`}>
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={wig.image}
                      alt={wig.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2 text-center">{wig.title}</h3>
                    <p className="text-primary font-semibold text-center">
                      {formatPrice(wig.price)}
                    </p>
                  </CardContent>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

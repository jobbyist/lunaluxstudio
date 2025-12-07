import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import productPlaceholder from "@/assets/product-placeholder.webp";

// Sample wig data for The Main Character collection
const mainCharacterWigs = [
  {
    id: "mc-1",
    title: "Classic Bob Wig",
    description: "Sleek and sophisticated bob cut, perfect for any occasion",
    image: productPlaceholder,
    price: 999.00,
    handle: "classic-bob-wig"
  },
  {
    id: "mc-2",
    title: "Long Straight Wig",
    description: "Luxurious long straight hair with natural shine",
    image: productPlaceholder,
    price: 999.00,
    handle: "long-straight-wig"
  },
  {
    id: "mc-3",
    title: "Curly Shoulder Length Wig",
    description: "Bouncy curls that frame your face beautifully",
    image: productPlaceholder,
    price: 999.00,
    handle: "curly-shoulder-wig"
  },
  {
    id: "mc-4",
    title: "Natural Wave Wig",
    description: "Soft waves for an effortlessly elegant look",
    image: productPlaceholder,
    price: 999.00,
    handle: "natural-wave-wig"
  }
];

const MainCharacterCollectionPage = () => {
  const { formatPrice } = useCurrency();

  return (
    <PageLayout
      title="The Main Character"
      subtitle="Non-custom, readily available wigs for immediate purchase. Be the main character in your own story."
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainCharacterWigs.map((wig) => (
            <Card key={wig.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
              <Link to={`/product/${wig.handle}`}>
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={wig.image}
                    alt={wig.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-medium text-center">{wig.title}</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    {wig.description}
                  </p>
                  <p className="text-primary font-semibold text-center text-lg">
                    {formatPrice(wig.price)}
                  </p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-muted/30 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-serif mb-4">Ready to Wear, Ready to Shine</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our Main Character collection features premium quality wigs that are ready for immediate purchase. 
            No customization needed - just choose your style and step into the spotlight. Each wig is crafted 
            with care to ensure you look and feel your absolute best.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default MainCharacterCollectionPage;

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Star } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import newArrival1 from "@/assets/new-arrival-1.jpg";
import newArrival2 from "@/assets/new-arrival-2.jpg";
import newArrival3 from "@/assets/new-arrival-3.jpg";

const products = [
  {
    id: 1,
    title: "Brazilian Straight Bundle",
    price: 999.99,
    image: newArrival1,
    handle: "brazilian-straight-bundle",
  },
  {
    id: 2,
    title: "Lace Front Wave Wig",
    price: 999.99,
    image: newArrival2,
    handle: "lace-front-wave-wig",
  },
  {
    id: 3,
    title: "HD Lace Frontal",
    price: 999.99,
    image: newArrival3,
    handle: "hd-lace-frontal",
  },
];

export const NewArrivals = () => {
  const { formatPrice } = useCurrency();

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif mb-4 tracking-wider">
            NEW <span className="text-primary">ARRIVALS</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our latest collection of premium hair products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <Link to={`/product/${product.handle}`} className="block">
                <div className="aspect-square overflow-hidden bg-secondary/20">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </Link>

              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full shadow-lg hover:scale-110 transition-transform"
                  onClick={(e) => {
                    e.preventDefault();
                    // Wishlist functionality
                  }}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full shadow-lg hover:scale-110 transition-transform"
                  onClick={(e) => {
                    e.preventDefault();
                    // Rating functionality
                  }}
                >
                  <Star className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6">
                <Link to={`/product/${product.handle}`}>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                </Link>
                <p className="text-2xl font-bold text-primary mb-4">
                  {formatPrice(product.price)}
                </p>
                <Button className="w-full" variant="default">
                  View Product
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

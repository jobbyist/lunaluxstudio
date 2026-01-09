import { Link } from "react-router-dom";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Clock } from "lucide-react";

export const RecentlyViewed = () => {
  const { recentlyViewed } = useRecentlyViewed();
  const { formatPrice } = useCurrency();

  if (recentlyViewed.length === 0) return null;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="h-6 w-6 text-primary" />
          <h2 className="text-2xl md:text-3xl font-serif">Recently Viewed</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {recentlyViewed.map((item) => (
            <Link
              key={item.productId}
              to={`/product/${item.handle}`}
              className="group"
            >
              <div className="bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300">
                <div className="aspect-square bg-muted overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-primary font-semibold mt-1">
                    {formatPrice(parseFloat(item.price.amount))}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

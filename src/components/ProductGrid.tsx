import { useCmsProducts } from "@/hooks/useCmsProducts";
import { ProductCard } from "./ProductCard";
import { Loader2 } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ProductGridProps {
  title?: string;
  searchQuery?: string;
  limit?: number;
  content?: Record<string, string>;
  collection?: string;
}

export const ProductGrid = ({ title, searchQuery, limit = 50, collection }: ProductGridProps) => {
  const { t } = useCurrency();
  const displayTitle = title || t('bestsellers');
  const { products, loading } = useCmsProducts({ limit, searchQuery, collection });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif text-center mb-12">{displayTitle}</h2>
          <p className="text-center text-muted-foreground">{t('noProductsFound')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-serif text-center mb-4 tracking-wider">{displayTitle}</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">{t('bestsellerDescription')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

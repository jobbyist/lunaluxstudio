import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { ProductGrid } from "@/components/ProductGrid";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function Shop() {
  const { t } = useCurrency();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageTransition>
      <main className="container mx-auto px-4 pt-36 md:pt-40 pb-16">
        <h1 className="text-4xl md:text-5xl font-heading text-center mb-8">
          {t("shopCollection")}
        </h1>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Explore our complete collection of premium hair extensions, wigs, and accessories.
        </p>
        <ProductGrid />
      </main>
      </PageTransition>
      <Footer />
    </div>
  );
}

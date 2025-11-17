import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Categories } from "@/components/Categories";
import { NewArrivals } from "@/components/NewArrivals";
import { ProductGrid } from "@/components/ProductGrid";
import { InstagramReels } from "@/components/InstagramReels";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";
import { useCurrency } from "@/contexts/CurrencyContext";

const Index = () => {
  const { t } = useCurrency();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32">
        <Hero />
        
        <section className="py-16 text-center bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-serif mb-4 tracking-wider">
              {t('luxuryTitle')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('luxuryDescription')}
            </p>
          </div>
        </section>

        <ProductGrid />
        <NewArrivals />
        <Categories />
        <InstagramReels />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

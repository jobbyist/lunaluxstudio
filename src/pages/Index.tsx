import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Categories } from "@/components/Categories";
import { NewArrivals } from "@/components/NewArrivals";
import { MainCharacterCollection } from "@/components/MainCharacterCollection";
import { ProductGrid } from "@/components/ProductGrid";
import { Collections } from "@/components/Collections";
import { InstagramReels } from "@/components/InstagramReels";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";
import { useCurrency } from "@/contexts/CurrencyContext";

const Index = () => {
  const { t } = useCurrency();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <Hero />
        <NewArrivals />
        <MainCharacterCollection />
        <ProductGrid />
        <Collections />
        <InstagramReels />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

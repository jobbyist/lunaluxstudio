import { useState } from "react";
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
import { BundleSavePopup } from "@/components/BundleSavePopup";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

const Index = () => {
  const { t } = useCurrency();
  const [showBundlePopup, setShowBundlePopup] = useState(false);
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-40 md:pt-44">
        <Hero />
        <NewArrivals />
        <MainCharacterCollection />
        <ProductGrid />
        <Collections />
        <InstagramReels />
        <Newsletter />
      </main>
      <Footer />

      {/* Bundle & Save Floating Button */}
      <Button
        onClick={() => setShowBundlePopup(true)}
        className="fixed bottom-4 left-4 z-40 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg gap-2"
        size="lg"
      >
        <Package className="h-4 w-4" />
        Bundle & Save
      </Button>

      <BundleSavePopup 
        isOpen={showBundlePopup} 
        onClose={() => setShowBundlePopup(false)} 
      />
    </div>
  );
};

export default Index;

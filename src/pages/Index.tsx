import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CafeDeLunaSection } from "@/components/CafeDeLunaSection";
import { MainCharacterCollection } from "@/components/MainCharacterCollection";
import { ProductGrid } from "@/components/ProductGrid";
import { Collections } from "@/components/Collections";
import { LuxuryHairExtensionsHighlight } from "@/components/LuxuryHairExtensionsHighlight";
import { FeaturedStories } from "@/components/FeaturedStories";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { useHomepageSections } from "@/hooks/useHomepageSections";

const Index = () => {
  const { sections, loading, isVisible, getContent } = useHomepageSections();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-36 md:pt-44">
          {isVisible('hero') && <Hero content={getContent('hero')} />}
          {isVisible('cafe_de_luna') && <CafeDeLunaSection content={getContent('cafe_de_luna')} />}
          {isVisible('collections') && <Collections content={getContent('collections')} />}
          {isVisible('luxury_highlight') && <LuxuryHairExtensionsHighlight content={getContent('luxury_highlight')} />}
          {isVisible('main_character') && <MainCharacterCollection content={getContent('main_character')} />}
          {isVisible('product_grid') && <ProductGrid limit={8} content={getContent('product_grid')} />}
          {isVisible('featured_stories') && <FeaturedStories content={getContent('featured_stories')} />}
          {isVisible('newsletter') && <Newsletter content={getContent('newsletter')} />}
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;

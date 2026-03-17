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

const sectionComponents: Record<string, React.FC<{ content?: Record<string, string> }>> = {
  hero: Hero,
  cafe_de_luna: CafeDeLunaSection,
  collections: Collections,
  luxury_highlight: LuxuryHairExtensionsHighlight,
  main_character: MainCharacterCollection,
  product_grid: ProductGrid,
  featured_stories: FeaturedStories,
  newsletter: Newsletter,
};

const Index = () => {
  const { sections, loading } = useHomepageSections();

  // Sort visible sections by display_order, render in that order
  const visibleSections = sections
    .filter(s => s.is_visible && sectionComponents[s.section_key])
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-36 md:pt-44">
          {visibleSections.map(section => {
            const Component = sectionComponents[section.section_key];
            return <Component key={section.id} content={section.content} />;
          })}
          {/* Fallback while loading */}
          {loading && (
            <>
              <Hero />
              <CafeDeLunaSection />
              <Collections />
              <LuxuryHairExtensionsHighlight />
              <MainCharacterCollection />
              <ProductGrid limit={8} />
              <FeaturedStories />
              <Newsletter />
            </>
          )}
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;

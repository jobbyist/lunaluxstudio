import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MainCharacterCollection } from "@/components/MainCharacterCollection";
import { ProductGrid } from "@/components/ProductGrid";
import { Collections } from "@/components/Collections";
import { FeaturedStories } from "@/components/FeaturedStories";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";

const Index = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-36 md:pt-44">
          <Hero />
          <Collections />
          <MainCharacterCollection />
          <ProductGrid limit={8} />
          <FeaturedStories />
          <Newsletter />
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;

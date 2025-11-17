import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Categories } from "@/components/Categories";
import { NewArrivals } from "@/components/NewArrivals";
import { ProductGrid } from "@/components/ProductGrid";
import { InstagramReels } from "@/components/InstagramReels";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32">
        <Hero />
        
        <section className="py-16 text-center bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-serif mb-4 tracking-wider">
              TREAT YOURSELF TO TRUE LUXURY
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              At Luna Studio, we are confident that our premium hair products and accessories are of the best possible quality. If you're unhappy with your purchase, let us know and we'll refund you or replace your item with another product or service of the same value.
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

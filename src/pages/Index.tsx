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
import { motion } from "framer-motion";

const Index = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-[104px] md:pt-[116px]">
          <Hero />
          <section className="section-shell bg-card text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
              className="mx-auto max-w-3xl"
            >
              <p className="eyebrow mb-5">The LunaLux ethos</p>
              <h2 className="font-serif text-4xl font-normal italic md:text-6xl">Luxury isn’t loud. It’s felt.</h2>
              <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                True luxury lives in the details — exceptional quality, beautiful texture, and craftsmanship that feels as good as it looks.
              </p>
            </motion.div>
          </section>
          <CafeDeLunaSection />
          <Collections />
          <LuxuryHairExtensionsHighlight />
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

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function Community() {
  const { t } = useCurrency();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-32 md:pt-40 pb-16">
        <h1 className="text-4xl md:text-5xl font-heading text-center mb-8">
          {t("community")}
        </h1>
        <div className="max-w-4xl mx-auto">
          <p className="text-muted-foreground text-center mb-12">
            Welcome to our community blog. Stay tuned for hair care tips, styling guides, and the latest trends.
          </p>
          
          <div className="grid gap-8">
            <div className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-heading mb-4">Coming Soon</h2>
              <p className="text-muted-foreground">
                Our community blog is currently under development. Check back soon for inspiring content!
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

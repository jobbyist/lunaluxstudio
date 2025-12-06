import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductGrid } from "@/components/ProductGrid";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function CollectionCategory() {
  const { collection, category } = useParams<{
    collection: string;
    category: string;
  }>();
  const { t } = useCurrency();

  // Format collection and category names for display
  const formatName = (str: string = "") => {
    return str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const collectionName = formatName(collection || "");
  const categoryName = formatName(category || "");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-card py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
                {collectionName} Collection
              </p>
              <h1 className="text-4xl md:text-5xl font-serif mb-4 tracking-wide">
                {categoryName}
              </h1>
              <p className="text-muted-foreground text-lg">
                Explore our premium {categoryName.toLowerCase()} from the {collectionName} collection.
                Each piece is crafted with the finest quality materials for a natural, luxurious look.
              </p>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-12">
          <ProductGrid 
            title={`${collectionName} ${categoryName}`}
            searchQuery={`${collection || ""} ${category || ""}`.trim()}
            limit={12}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}

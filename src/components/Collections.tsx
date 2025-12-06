import { CollectionCard } from "./CollectionCard";
import { useCurrency } from "@/contexts/CurrencyContext";
// Using existing assets as placeholders for high-res collection images
import brazilianImage from "@/assets/hero-1.jpg";
import vietnameseImage from "@/assets/hero-2.jpg";
import rawVietnameseImage from "@/assets/hero-3.jpg";

export const Collections = () => {
  const { t } = useCurrency();

  const collections = [
    {
      title: "Brazilian Virgin",
      image: brazilianImage,
      slug: "brazilian-virgin",
    },
    {
      title: "Vietnamese Virgin",
      image: vietnameseImage,
      slug: "vietnamese-virgin",
    },
    {
      title: "Raw Vietnamese",
      image: rawVietnameseImage,
      slug: "raw-vietnamese",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif mb-4 tracking-wider">
            SHOP BY COLLECTION
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our premium hair collections, each crafted with the finest quality materials
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.slug}
              title={collection.title}
              image={collection.image}
              slug={collection.slug}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

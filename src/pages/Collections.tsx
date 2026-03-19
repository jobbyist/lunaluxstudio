import { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { PageLoadingSkeleton } from "@/components/PageLoadingSkeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { fetchCmsProductsByCollection, CmsProduct } from "@/lib/cms-products";
import { ProductCard } from "@/components/ProductCard";
import brazilianImage from "@/assets/collection-brazilian.jpg";
import vietnameseImage from "@/assets/collection-vietnamese.jpg";
import rawVietnameseImage from "@/assets/collection-raw-vietnamese.jpg";
import premiumAccessoriesImage from "@/assets/collection-accessories.jpg";

const Collections = () => {
  const [mainCharacterProducts, setMainCharacterProducts] = useState<CmsProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const products = await fetchCmsProductsByCollection("main-character", 4);
        setMainCharacterProducts(products);
      } catch (error) {
        console.error("Error loading main character products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };
    load();
  }, []);

  const standardCollections = [
    { title: "Brazilian Virgin", image: brazilianImage, slug: "brazilian-virgin", description: "Premium Brazilian hair with natural shine and movement" },
    { title: "Vietnamese Virgin", image: vietnameseImage, slug: "vietnamese-virgin", description: "Silky smooth Vietnamese hair for effortless styling" },
    { title: "Raw Vietnamese", image: rawVietnameseImage, slug: "raw-vietnamese", description: "Unprocessed raw hair with superior quality and longevity" },
    { title: "Premium Accessories", image: premiumAccessoriesImage, slug: "premium-accessories", description: "Luxury add-ons designed to elevate every install" },
  ];

  return (
    <PageLayout title="Our Collections" subtitle="Discover our curated selection of premium hair collections">
      <div className="max-w-7xl mx-auto space-y-16">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif text-center mb-8">Premium Hair Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {standardCollections.map((collection) => (
              <Card key={collection.slug} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                <Link to={`/collections/${collection.slug}`}>
                  <div className="aspect-[3/4] overflow-hidden bg-muted">
                    <img src={collection.image} alt={collection.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-center">{collection.title}</CardTitle>
                    <CardDescription className="text-center">{collection.description}</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Star className="h-8 w-8 text-primary fill-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-serif mb-4">The Main Character Collection</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">Ready-to-wear luxury wigs for those who are ready to shine.</p>
          </div>
          {loadingProducts ? (
            <div className="py-12"><PageLoadingSkeleton variant="grid" /></div>
          ) : mainCharacterProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {mainCharacterProducts.map((product) => (<ProductCard key={product.id} product={product} />))}
              </div>
              <div className="text-center"><Button asChild size="lg"><Link to="/collection/main-character">View Full Collection</Link></Button></div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Explore our curated collection of ready-to-wear wigs</p>
              <Button asChild><Link to="/collection/main-character">View Collection</Link></Button>
            </div>
          )}
        </div>

        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <CardContent className="pt-8 pb-8 text-center">
            <h3 className="text-2xl font-serif mb-3">Not Sure Where to Start?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">Our expert team can help you find the perfect collection for your needs.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild size="lg"><Link to="/contact">Get Help</Link></Button>
              <Button asChild variant="outline" size="lg"><Link to="/explore">Browse All Products</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Collections;

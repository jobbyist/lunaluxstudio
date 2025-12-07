import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Heart, PartyPopper } from "lucide-react";
import brazilianImage from "@/assets/hero-1.jpg";
import vietnameseImage from "@/assets/hero-2.jpg";
import rawVietnameseImage from "@/assets/hero-3.jpg";
import productPlaceholder from "@/assets/product-placeholder.webp";

const Collections = () => {
  const standardCollections = [
    {
      title: "Brazilian Virgin",
      image: brazilianImage,
      slug: "brazilian-virgin",
      description: "Premium Brazilian hair with natural shine and movement"
    },
    {
      title: "Vietnamese Virgin",
      image: vietnameseImage,
      slug: "vietnamese-virgin",
      description: "Silky smooth Vietnamese hair for effortless styling"
    },
    {
      title: "Raw Vietnamese",
      image: rawVietnameseImage,
      slug: "raw-vietnamese",
      description: "Unprocessed raw hair with superior quality and longevity"
    },
    {
      title: "The Main Character",
      image: productPlaceholder,
      slug: "main-character",
      description: "Ready-to-wear wigs for immediate purchase"
    }
  ];

  const curatedCollections = [
    {
      title: "Face Card Never Declines 💁‍♀️💳",
      description: "Curated selection of products that complement different facial features and enhance your natural beauty",
      icon: Heart,
      slug: "face-card-collection"
    },
    {
      title: "Sometimes You Gotta Pop Out 🥂💯",
      description: "Perfect products for special events and occasions like Weddings, Graduations, and celebrations",
      icon: PartyPopper,
      slug: "pop-out-collection"
    }
  ];

  return (
    <PageLayout
      title="Our Collections"
      subtitle="Discover our curated selection of premium hair collections, each designed to help you express your unique style"
    >
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Standard Collections */}
        <div>
          <h2 className="text-2xl md:text-3xl font-serif text-center mb-8">
            Premium Hair Collections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {standardCollections.map((collection) => (
              <Card key={collection.slug} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                <Link to={`/collection/${collection.slug}`}>
                  <div className="aspect-[3/4] overflow-hidden bg-muted">
                    <img
                      src={collection.image}
                      alt={collection.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-center">{collection.title}</CardTitle>
                    <CardDescription className="text-center">
                      {collection.description}
                    </CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Curated Collections */}
        <div>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-serif mb-4">
              Curated Collections
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Specially curated collections to match your vibe, occasion, and personal style
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {curatedCollections.map((collection) => (
              <Card key={collection.slug} className="hover:border-primary/50 transition-colors">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-4">
                    <collection.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl mb-3">{collection.title}</CardTitle>
                  <CardDescription className="text-base">
                    {collection.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-6">
                  <Button asChild>
                    <Link to={`/collection/${collection.slug}`}>
                      Explore Collection
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <CardContent className="pt-8 pb-8 text-center">
            <h3 className="text-2xl font-serif mb-3">Not Sure Where to Start?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our expert team can help you find the perfect collection for your needs. Contact us for personalized recommendations.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild size="lg">
                <Link to="/contact">Get Help</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/shop">Browse All Products</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Collections;

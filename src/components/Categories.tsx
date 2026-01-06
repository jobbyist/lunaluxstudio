import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    title: "BUNDLES",
    description: "Pure hair with an image to focus on your chosen products. Details go here and style your shop.",
    image: "/placeholder.svg",
    link: "/bundles"
  },
  {
    title: "FRONTALS",
    description: "Pure hair with an image to focus on your chosen products. Details go here and style your shop.",
    image: "/placeholder.svg",
    link: "/frontals"
  },
  {
    title: "WIGS",
    description: "Pure hair with an image to focus on your chosen products. Details go here and style your shop.",
    image: "/placeholder.svg",
    link: "/wigs"
  }
];

export const Categories = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div key={index} className="group relative overflow-hidden bg-card rounded-lg">
              <div className="aspect-[3/4] bg-muted overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              <div className="p-6 text-center space-y-4">
                <h3 className="text-2xl font-serif tracking-wider text-primary">
                  {category.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {category.description}
                </p>
                <Button
                  asChild
                  variant="ghost"
                  className="group/btn"
                >
                  <Link to={category.link} className="flex items-center justify-center">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

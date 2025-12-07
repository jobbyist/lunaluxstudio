import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import productPlaceholder from "@/assets/product-placeholder.webp";

// Sample products for the Face Card collection
const faceCardProducts = [
  {
    id: "fc-1",
    title: "Oval Face Perfect Bob",
    description: "Designed to complement oval facial features",
    image: productPlaceholder,
    price: 1299.00,
    handle: "oval-face-bob"
  },
  {
    id: "fc-2",
    title: "Round Face Lengthening Wig",
    description: "Creates the illusion of length for round faces",
    image: productPlaceholder,
    price: 1399.00,
    handle: "round-face-wig"
  },
  {
    id: "fc-3",
    title: "Heart Face Framing Layers",
    description: "Softens and frames heart-shaped faces beautifully",
    image: productPlaceholder,
    price: 1499.00,
    handle: "heart-face-layers"
  },
  {
    id: "fc-4",
    title: "Square Face Softening Waves",
    description: "Adds softness to angular facial features",
    image: productPlaceholder,
    price: 1399.00,
    handle: "square-face-waves"
  },
  {
    id: "fc-5",
    title: "Diamond Face Balance Wig",
    description: "Perfect proportions for diamond-shaped faces",
    image: productPlaceholder,
    price: 1299.00,
    handle: "diamond-face-wig"
  },
  {
    id: "fc-6",
    title: "Long Face Volume Wig",
    description: "Adds width and volume for longer face shapes",
    image: productPlaceholder,
    price: 1449.00,
    handle: "long-face-volume"
  }
];

const FaceCardCollection = () => {
  const { formatPrice } = useCurrency();

  return (
    <PageLayout
      title="Face Card Never Declines 💁‍♀️💳"
      subtitle="Curated selection of products that complement different facial features and enhance your natural beauty"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {faceCardProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
              <Link to={`/product/${product.handle}`}>
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-medium text-center">{product.title}</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    {product.description}
                  </p>
                  <p className="text-primary font-semibold text-center text-lg">
                    {formatPrice(product.price)}
                  </p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-muted/30 rounded-lg p-8">
          <h3 className="text-2xl font-serif mb-4 text-center">Find Your Perfect Match</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto text-center mb-6">
            Every face shape is unique and beautiful. Our Face Card collection is carefully curated to help you 
            find styles that naturally complement your facial features, enhancing your natural beauty and boosting 
            your confidence.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <h4 className="font-semibold mb-2">Expert Curation</h4>
              <p className="text-sm text-muted-foreground">
                Each style selected by professional stylists
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-2">Face Shape Guide</h4>
              <p className="text-sm text-muted-foreground">
                Not sure of your face shape? Contact us for help
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-2">Premium Quality</h4>
              <p className="text-sm text-muted-foreground">
                All products feature our signature quality standards
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default FaceCardCollection;

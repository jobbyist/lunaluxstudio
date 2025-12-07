import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import productPlaceholder from "@/assets/product-placeholder.webp";

// Sample products for the Pop Out collection
const popOutProducts = [
  {
    id: "po-1",
    title: "Bridal Elegance Wig",
    description: "Perfect for your special wedding day",
    image: productPlaceholder,
    price: 2499.00,
    handle: "bridal-elegance-wig",
    occasion: "Wedding"
  },
  {
    id: "po-2",
    title: "Graduation Glam Wig",
    description: "Sophisticated style for your big achievement",
    image: productPlaceholder,
    price: 1699.00,
    handle: "graduation-glam-wig",
    occasion: "Graduation"
  },
  {
    id: "po-3",
    title: "Red Carpet Ready Wig",
    description: "Hollywood glamour for gala events",
    image: productPlaceholder,
    price: 2299.00,
    handle: "red-carpet-wig",
    occasion: "Gala"
  },
  {
    id: "po-4",
    title: "Birthday Queen Wig",
    description: "Stand out on your special day",
    image: productPlaceholder,
    price: 1599.00,
    handle: "birthday-queen-wig",
    occasion: "Birthday"
  },
  {
    id: "po-5",
    title: "Holiday Party Perfection",
    description: "Festive and fabulous for celebrations",
    image: productPlaceholder,
    price: 1799.00,
    handle: "holiday-party-wig",
    occasion: "Holiday"
  },
  {
    id: "po-6",
    title: "Anniversary Elegance",
    description: "Romantic and sophisticated",
    image: productPlaceholder,
    price: 1899.00,
    handle: "anniversary-wig",
    occasion: "Anniversary"
  }
];

const PopOutCollection = () => {
  const { formatPrice } = useCurrency();

  return (
    <PageLayout
      title="Sometimes You Gotta Pop Out 🥂💯"
      subtitle="Perfect products for special events and occasions like Weddings, Graduations, and celebrations"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popOutProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
              <Link to={`/product/${product.handle}`}>
                <div className="aspect-square overflow-hidden bg-muted relative">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    {product.occasion}
                  </div>
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
        <div className="mt-12 bg-gradient-to-br from-primary/5 to-transparent rounded-lg p-8">
          <h3 className="text-2xl font-serif mb-4 text-center">Make Every Moment Memorable</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto text-center mb-6">
            Life's special moments deserve a special look. Our Pop Out collection features premium styles 
            curated for those occasions when you need to make an unforgettable entrance. From weddings to 
            graduations, celebrations to galas - we've got you covered.
          </p>
          <div className="grid md:grid-cols-4 gap-6 mt-8">
            <div className="text-center">
              <h4 className="font-semibold mb-2">🎊 Weddings</h4>
              <p className="text-sm text-muted-foreground">
                Bridal and guest styles
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-2">🎓 Graduations</h4>
              <p className="text-sm text-muted-foreground">
                Celebrate your achievement
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-2">🥳 Parties</h4>
              <p className="text-sm text-muted-foreground">
                Birthdays and celebrations
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-2">✨ Galas</h4>
              <p className="text-sm text-muted-foreground">
                Red carpet ready
              </p>
            </div>
          </div>
        </div>

        {/* Styling Tips */}
        <Card className="mt-8 border-primary/20">
          <CardContent className="p-8">
            <h3 className="text-xl font-serif mb-4 text-center">Need Styling Assistance?</h3>
            <p className="text-muted-foreground text-center mb-6">
              Our stylists can help you choose the perfect look for your event. Book a consultation 
              or contact us for personalized recommendations.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/booking" className="text-primary hover:underline">
                Book Consultation
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/contact" className="text-primary hover:underline">
                Contact Us
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default PopOutCollection;

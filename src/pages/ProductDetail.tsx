import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { PageLoadingSkeleton } from "@/components/PageLoadingSkeleton";
import { Button } from "@/components/ui/button";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { RecentlyViewed } from "@/components/RecentlyViewed";

const ProductDetail = () => {
  const { handle } = useParams();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const addItem = useCartStore(state => state.addItem);
  const { formatPrice } = useCurrency();
  const { addProduct } = useRecentlyViewed();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const products = await fetchProducts(50);
        const found = products.find(p => p.node.handle === handle);
        setProduct(found || null);
        
        // Track recently viewed
        if (found) {
          addProduct(found);
        }
        
        if (found) {
          // Initialize with first variant
          const firstVariant = found.node.variants.edges[0]?.node;
          if (firstVariant) {
            setSelectedVariant(firstVariant);
            const initialOptions: Record<string, string> = {};
            firstVariant.selectedOptions.forEach(opt => {
              initialOptions[opt.name] = opt.value;
            });
            setSelectedOptions(initialOptions);
          }
        }
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [handle]);

  const handleOptionChange = (optionName: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);

    // Find matching variant
    const variant = product?.node.variants.edges.find(({ node }) =>
      node.selectedOptions.every(opt => newOptions[opt.name] === opt.value)
    )?.node;

    if (variant) {
      setSelectedVariant(variant);
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    const cartItem = {
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || []
    };
    
    addItem(cartItem);
    toast.success("Added to cart", {
      description: product.node.title,
      position: "top-center",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-36 md:pt-40 pb-20">
          <PageLoadingSkeleton variant="product" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-36 md:pt-40">
          <p className="text-center text-muted-foreground">Product not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const { node } = product;
  const imageUrl = node.images.edges[0]?.node.url || "/placeholder.svg";
  const price = selectedVariant?.price || node.priceRange.minVariantPrice;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageTransition>
      <main className="pt-36 md:pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={node.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {node.images.edges.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {node.images.edges.slice(0, 4).map((img, idx) => (
                    <div key={idx} className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img
                        src={img.node.url}
                        alt={`${node.title} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-serif mb-2">{node.title}</h1>
                <p className="text-2xl font-semibold text-primary">
                  {formatPrice(parseFloat(price.amount))}
                </p>
              </div>

              {node.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-white leading-relaxed">{node.description}</p>
                </div>
              )}

              {/* Product Options */}
              <div className="space-y-6">
                {node.options.map((option) => (
                  <div key={option.name} className="space-y-3">
                    <Label className="text-base font-semibold">
                      {option.name}: {selectedOptions[option.name]}
                    </Label>
                    <RadioGroup
                      value={selectedOptions[option.name]}
                      onValueChange={(value) => handleOptionChange(option.name, value)}
                      className="flex flex-wrap gap-2"
                    >
                      {option.values.map((value) => (
                        <div key={value}>
                          <RadioGroupItem
                            value={value}
                            id={`${option.name}-${value}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`${option.name}-${value}`}
                            className="flex items-center justify-center px-4 py-2 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
                          >
                            {value}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full bg-primary hover:bg-primary/90 btn-glow"
                size="lg"
                disabled={!selectedVariant?.availableForSale}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {selectedVariant?.availableForSale ? "Add to Cart" : "Out of Stock"}
              </Button>

              <div className="border-t border-border pt-6 space-y-2 text-sm text-muted-foreground">
                <p>• 7-day return policy</p>
                <p>• Eligible for international shipping</p>
                <p>• Authentic premium hair</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recently Viewed Section */}
        <RecentlyViewed />
      </main>
      </PageTransition>
      <Footer />
    </div>
  );
};

export default ProductDetail;

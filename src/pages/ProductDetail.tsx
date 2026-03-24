import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { PageLoadingSkeleton } from "@/components/PageLoadingSkeleton";
import { Button } from "@/components/ui/button";
import { CmsVariant, findVariant } from "@/lib/cms-products";
import { useCmsProduct } from "@/hooks/useCmsProducts";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCurrency } from "@/contexts/CurrencyContext";

const ProductDetail = () => {
  const { handle } = useParams();
  const { product, loading } = useCmsProduct(handle);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<CmsVariant | null>(null);
  const addItem = useCartStore(state => state.addItem);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (product?.options && product.options.length > 0) {
      const initialOptions: Record<string, string> = {};
      product.options.forEach(option => {
        if (option.values.length > 0) {
          initialOptions[option.name] = option.values[0];
        }
      });
      setSelectedOptions(initialOptions);
    }
  }, [product]);

  useEffect(() => {
    if (!product) { setSelectedVariant(null); return; }
    const variant = findVariant(product, selectedOptions);
    setSelectedVariant(variant);
  }, [product, selectedOptions]);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
  };

  const handleAddToCart = () => {
    if (!product) return;
    const price = selectedVariant?.price || product.price;
    const variantId = selectedVariant?.id || product.id;
    const variantTitle = selectedVariant?.title || "Default";
    const available = selectedVariant ? selectedVariant.available : product.inventory_quantity > 0;
    
    if (!available) { toast.error("This product is out of stock"); return; }

    addItem({
      productId: product.id,
      title: product.title,
      handle: product.handle,
      imageUrl: product.featured_image_url || "/placeholder.svg",
      variantId,
      variantTitle,
      price,
      quantity: 1,
      selectedOptions: Object.entries(selectedOptions).map(([name, value]) => ({ name, value })),
    });
    toast.success("Added to cart", { description: product.title, position: "top-center" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-36 md:pt-40 pb-20"><PageLoadingSkeleton variant="product" /></main>
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

  const imageUrl = product.featured_image_url || "/placeholder.svg";
  const allImages = [imageUrl, ...(product.additional_images || [])];
  const price = selectedVariant?.price || product.price;
  const displayOptions = (product.options || []).filter(o => !(o.values.length === 1 && o.values[0] === "Default Title"));
  const isAvailable = selectedVariant ? selectedVariant.available : product.inventory_quantity > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageTransition>
      <main className="pt-36 md:pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                <img src={imageUrl} alt={product.title} className="w-full h-full object-cover" />
              </div>
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {allImages.slice(0, 4).map((img, idx) => (
                    <div key={idx} className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img src={img} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-serif mb-2">{product.title}</h1>
                <p className="text-2xl font-semibold text-primary">{formatPrice(price)}</p>
                {product.compare_at_price && product.compare_at_price > price && (
                  <p className="text-lg text-muted-foreground line-through">{formatPrice(product.compare_at_price)}</p>
                )}
              </div>

              {product.description_html ? (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <div className="prose max-w-none text-sm text-foreground dark:prose-invert" dangerouslySetInnerHTML={{ __html: product.description_html }} />
                </div>
              ) : product.description ? (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </div>
              ) : null}

              {displayOptions.length > 0 && (
                <div className="space-y-6">
                  {displayOptions.map((option) => (
                    <div key={option.name} className="space-y-3">
                      <Label className="text-base font-semibold">{option.name}: {selectedOptions[option.name]}</Label>
                      <RadioGroup
                        value={selectedOptions[option.name]}
                        onValueChange={(value) => handleOptionChange(option.name, value)}
                        className="flex flex-wrap gap-2"
                      >
                        {option.values.map((value) => (
                          <div key={value}>
                            <RadioGroupItem value={value} id={`${option.name}-${value}`} className="peer sr-only" />
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
              )}

              <Button onClick={handleAddToCart} className="w-full bg-primary hover:bg-primary/90 btn-glow" size="lg" disabled={!isAvailable}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isAvailable ? "Add to Cart" : "Out of Stock"}
              </Button>

              <div className="border-t border-border pt-6 space-y-2 text-sm text-muted-foreground">
                <p>• 7-day return policy</p>
                <p>• Authentic premium hair</p>
                <p>• R150 flat-rate shipping via The Courier Guy</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      </PageTransition>
      <Footer />
    </div>
  );
};

export default ProductDetail;

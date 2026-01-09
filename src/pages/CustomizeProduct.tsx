import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Plus } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";
import productImage from "@/assets/product-placeholder.webp";

interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

const lengthOptions: CustomizationOption[] = [
  { id: "12", name: '12"', price: 0 },
  { id: "14", name: '14"', price: 50 },
  { id: "16", name: '16"', price: 100 },
  { id: "18", name: '18"', price: 150 },
  { id: "20", name: '20"', price: 200 },
  { id: "22", name: '22"', price: 250 },
];

const textureOptions: CustomizationOption[] = [
  { id: "straight", name: "Straight", price: 0 },
  { id: "body-wave", name: "Body Wave", price: 50 },
  { id: "deep-wave", name: "Deep Wave", price: 75 },
  { id: "curly", name: "Curly", price: 100 },
];

const colorOptions: CustomizationOption[] = [
  { id: "natural", name: "Natural Black", price: 0 },
  { id: "brown", name: "Dark Brown", price: 30 },
  { id: "highlight", name: "Highlighted", price: 80 },
  { id: "ombre", name: "Ombré", price: 100 },
];

const densityOptions: CustomizationOption[] = [
  { id: "130", name: "130%", price: 0 },
  { id: "150", name: "150%", price: 40 },
  { id: "180", name: "180%", price: 80 },
  { id: "200", name: "200%", price: 120 },
];

const upsells = [
  { id: "closure", name: "4x4 Lace Closure", price: 120 },
  { id: "frontal", name: "13x4 Lace Frontal", price: 180 },
  { id: "care-kit", name: "Premium Care Kit", price: 45 },
  { id: "styling", name: "Professional Styling Service", price: 95 },
];

export default function CustomizeProduct() {
  const { formatPrice, t } = useCurrency();
  const addItem = useCartStore((state) => state.addItem);
  
  const basePrice = 999.99;
  
  const [selectedLength, setSelectedLength] = useState(lengthOptions[0]);
  const [selectedTexture, setSelectedTexture] = useState(textureOptions[0]);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [selectedDensity, setSelectedDensity] = useState(densityOptions[0]);
  const [selectedUpsells, setSelectedUpsells] = useState<string[]>([]);

  const calculateTotal = () => {
    let total = basePrice;
    total += selectedLength.price;
    total += selectedTexture.price;
    total += selectedColor.price;
    total += selectedDensity.price;
    
    selectedUpsells.forEach(upsellId => {
      const upsell = upsells.find(u => u.id === upsellId);
      if (upsell) total += upsell.price;
    });
    
    return total;
  };

  const toggleUpsell = (upsellId: string) => {
    setSelectedUpsells(prev => 
      prev.includes(upsellId) 
        ? prev.filter(id => id !== upsellId)
        : [...prev, upsellId]
    );
  };

  const handleAddToCart = () => {
    const cartItem = {
      product: {
        node: {
          id: "custom-wig-1",
          title: "Custom Luna Luxury Wig",
          description: "Fully customized luxury wig",
          handle: "custom-wig",
          priceRange: {
            minVariantPrice: {
              amount: calculateTotal().toString(),
              currencyCode: "ZAR"
            }
          },
          images: {
            edges: [{
              node: {
                url: productImage,
                altText: "Custom Wig"
              }
            }]
          },
          variants: { edges: [] },
          options: []
        }
      },
      variantId: `custom-${Date.now()}`,
      variantTitle: `${selectedLength.name} ${selectedTexture.name} ${selectedColor.name}`,
      price: {
        amount: calculateTotal().toString(),
        currencyCode: "ZAR"
      },
      quantity: 1,
      selectedOptions: [
        { name: "Length", value: selectedLength.name },
        { name: "Texture", value: selectedTexture.name },
        { name: "Color", value: selectedColor.name },
        { name: "Density", value: selectedDensity.name },
      ]
    };

    addItem(cartItem);
    toast.success("Added to cart!", {
      description: "Your customized wig has been added to your cart."
    });
  };

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageTransition>
      <main className="pt-36 md:pt-40 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square bg-card rounded-lg overflow-hidden">
                <img
                  src={productImage}
                  alt="Custom Wig"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-card rounded-lg overflow-hidden opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                    <img
                      src={productImage}
                      alt={`View ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Customization Options */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-serif mb-2">Build Your Perfect Look</h1>
                <p className="text-muted-foreground">Customize every detail of your luxury wig</p>
              </div>

              {/* Base Price */}
              <div className="p-4 bg-card rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Base Price</span>
                  <span className="text-lg font-semibold">{formatPrice(basePrice)}</span>
                </div>
              </div>

              {/* Length Selection */}
              <div className="space-y-4">
                <Label className="text-lg font-medium">Length</Label>
                <RadioGroup value={selectedLength.id} onValueChange={(value) => {
                  const option = lengthOptions.find(o => o.id === value);
                  if (option) setSelectedLength(option);
                }}>
                  <div className="grid grid-cols-3 gap-3">
                    {lengthOptions.map((option) => (
                      <Label
                        key={option.id}
                        htmlFor={`length-${option.id}`}
                        className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedLength.id === option.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem
                          value={option.id}
                          id={`length-${option.id}`}
                          className="sr-only"
                        />
                        <span className="font-semibold">{option.name}</span>
                        {option.price > 0 && (
                          <span className="text-xs text-muted-foreground">+{formatPrice(option.price)}</span>
                        )}
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Texture Selection */}
              <div className="space-y-4">
                <Label className="text-lg font-medium">Texture</Label>
                <RadioGroup value={selectedTexture.id} onValueChange={(value) => {
                  const option = textureOptions.find(o => o.id === value);
                  if (option) setSelectedTexture(option);
                }}>
                  <div className="grid grid-cols-2 gap-3">
                    {textureOptions.map((option) => (
                      <Label
                        key={option.id}
                        htmlFor={`texture-${option.id}`}
                        className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedTexture.id === option.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem
                          value={option.id}
                          id={`texture-${option.id}`}
                          className="sr-only"
                        />
                        <span className="font-semibold">{option.name}</span>
                        {option.price > 0 && (
                          <span className="text-xs text-muted-foreground">+{formatPrice(option.price)}</span>
                        )}
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Color Selection */}
              <div className="space-y-4">
                <Label className="text-lg font-medium">Color</Label>
                <RadioGroup value={selectedColor.id} onValueChange={(value) => {
                  const option = colorOptions.find(o => o.id === value);
                  if (option) setSelectedColor(option);
                }}>
                  <div className="grid grid-cols-2 gap-3">
                    {colorOptions.map((option) => (
                      <Label
                        key={option.id}
                        htmlFor={`color-${option.id}`}
                        className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedColor.id === option.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem
                          value={option.id}
                          id={`color-${option.id}`}
                          className="sr-only"
                        />
                        <span className="font-semibold">{option.name}</span>
                        {option.price > 0 && (
                          <span className="text-xs text-muted-foreground">+{formatPrice(option.price)}</span>
                        )}
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Density Selection */}
              <div className="space-y-4">
                <Label className="text-lg font-medium">Density</Label>
                <RadioGroup value={selectedDensity.id} onValueChange={(value) => {
                  const option = densityOptions.find(o => o.id === value);
                  if (option) setSelectedDensity(option);
                }}>
                  <div className="grid grid-cols-2 gap-3">
                    {densityOptions.map((option) => (
                      <Label
                        key={option.id}
                        htmlFor={`density-${option.id}`}
                        className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedDensity.id === option.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem
                          value={option.id}
                          id={`density-${option.id}`}
                          className="sr-only"
                        />
                        <span className="font-semibold">{option.name}</span>
                        {option.price > 0 && (
                          <span className="text-xs text-muted-foreground">+{formatPrice(option.price)}</span>
                        )}
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Upsells */}
              <div className="space-y-4">
                <Label className="text-lg font-medium">Enhance Your Experience</Label>
                <div className="space-y-3">
                  {upsells.map((upsell) => (
                    <div
                      key={upsell.id}
                      onClick={() => toggleUpsell(upsell.id)}
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedUpsells.includes(upsell.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedUpsells.includes(upsell.id)
                            ? "bg-primary border-primary"
                            : "border-border"
                        }`}>
                          {selectedUpsells.includes(upsell.id) && (
                            <Plus className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{upsell.name}</p>
                          <p className="text-sm text-muted-foreground">+{formatPrice(upsell.price)}</p>
                        </div>
                      </div>
                      {selectedUpsells.includes(upsell.id) && (
                        <Badge variant="secondary">Added</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Total and Add to Cart */}
              <div className="space-y-4 sticky bottom-0 bg-background pt-4">
                <div className="p-6 bg-card rounded-lg space-y-4">
                  <div className="flex justify-between items-center text-2xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                  <Button 
                    onClick={handleAddToCart}
                    size="lg" 
                    className="w-full text-lg py-6"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      </PageTransition>
      <Footer />
    </div>
  );
}

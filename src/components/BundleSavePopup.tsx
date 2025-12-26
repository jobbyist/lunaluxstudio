import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Sparkles, Check } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

interface Bundle {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  items: {
    name: string;
    quantity: number;
  }[];
  popular?: boolean;
}

const BUNDLES: Bundle[] = [
  {
    id: "starter-bundle",
    name: "Starter Bundle",
    description: "Perfect for first-time buyers",
    originalPrice: 4500,
    bundlePrice: 3600,
    savings: 20,
    items: [
      { name: "Brazilian Body Wave 16\"", quantity: 2 },
      { name: "Lace Closure 4x4", quantity: 1 },
    ],
  },
  {
    id: "complete-look",
    name: "Complete Look Bundle",
    description: "Everything for a full head install",
    originalPrice: 7500,
    bundlePrice: 5625,
    savings: 25,
    popular: true,
    items: [
      { name: "Brazilian Body Wave 18\"", quantity: 3 },
      { name: "HD Lace Frontal 13x4", quantity: 1 },
      { name: "Edge Control", quantity: 1 },
    ],
  },
  {
    id: "luxury-collection",
    name: "Luxury Collection",
    description: "Premium quality for the discerning client",
    originalPrice: 12000,
    bundlePrice: 8400,
    savings: 30,
    items: [
      { name: "Raw Vietnamese Hair 20\"", quantity: 3 },
      { name: "Swiss Lace Frontal 13x6", quantity: 1 },
      { name: "Silk Press Spray", quantity: 1 },
      { name: "Heat Protectant", quantity: 1 },
    ],
  },
  {
    id: "wig-essentials",
    name: "Wig Essentials Kit",
    description: "Complete wig care package",
    originalPrice: 3200,
    bundlePrice: 2400,
    savings: 25,
    items: [
      { name: "Wig Cap (2 pack)", quantity: 1 },
      { name: "Wig Glue", quantity: 1 },
      { name: "Wig Band", quantity: 1 },
      { name: "Edge Brush", quantity: 1 },
      { name: "Wig Stand", quantity: 1 },
    ],
  },
];

interface BundleSavePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BundleSavePopup = ({ isOpen, onClose }: BundleSavePopupProps) => {
  const { addItem } = useCartStore();
  const [addedBundles, setAddedBundles] = useState<string[]>([]);

  const handleAddBundle = (bundle: Bundle) => {
    // Add bundle as a single cart item with proper CartItem structure
    const bundleProduct = {
      id: bundle.id,
      title: bundle.name,
      handle: bundle.id,
      description: bundle.description,
      images: { edges: [] },
      variants: { edges: [] },
      priceRange: {
        minVariantPrice: {
          amount: bundle.bundlePrice.toString(),
          currencyCode: "ZAR"
        }
      }
    };

    addItem({
      product: bundleProduct as any,
      variantId: bundle.id,
      variantTitle: "Bundle",
      price: {
        amount: bundle.bundlePrice.toString(),
        currencyCode: "ZAR"
      },
      quantity: 1,
      selectedOptions: []
    });
    
    setAddedBundles(prev => [...prev, bundle.id]);
    toast.success(`${bundle.name} added to cart!`);
  };

  const formatPrice = (price: number) => {
    return `R${price.toLocaleString()}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Package className="h-6 w-6 text-primary" />
            Bundle & Save
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            Get more value with our pre-configured bundles. Save up to 30% when you buy together!
          </p>
        </DialogHeader>

        <div className="grid gap-4 mt-4">
          {BUNDLES.map((bundle) => (
            <div
              key={bundle.id}
              className={`relative border rounded-lg p-4 transition-all hover:border-primary/50 ${
                bundle.popular ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              {bundle.popular && (
                <Badge className="absolute -top-2 right-4 bg-primary">
                  Most Popular
                </Badge>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{bundle.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{bundle.description}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {bundle.items.map((item, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {item.quantity}x {item.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground line-through">
                      {formatPrice(bundle.originalPrice)}
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(bundle.bundlePrice)}
                    </p>
                    <Badge variant="destructive" className="mt-1">
                      Save {bundle.savings}%
                    </Badge>
                  </div>

                  <Button
                    onClick={() => handleAddBundle(bundle)}
                    disabled={addedBundles.includes(bundle.id)}
                    className="w-full md:w-auto"
                  >
                    {addedBundles.includes(bundle.id) ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Added
                      </>
                    ) : (
                      "Add to Cart"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Bundle prices are pre-configured and cannot be modified. Individual items subject to availability.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

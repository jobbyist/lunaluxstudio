import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ArrowRight, Sparkles, Tag } from "lucide-react";
import { fetchCmsProducts, CmsProduct } from "@/lib/cms-products";
import { useCartStore } from "@/stores/cartStore";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

interface Bundle {
  id: string;
  name: string;
  description: string;
  products: CmsProduct[];
  savingsPercent: number;
}

interface BundleSavePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BundleSavePopup = ({ isOpen, onClose }: BundleSavePopupProps) => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedBundles, setAddedBundles] = useState<string[]>([]);
  const { addItem } = useCartStore();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (isOpen) {
      loadBundles();
    }
  }, [isOpen]);

  const loadBundles = async () => {
    setLoading(true);
    try {
      const allProducts = await fetchCmsProducts(50);
      const bundleProducts = allProducts.filter(p => p.collection === "bundles");
      
      // Create suggested bundles from available products
      const suggestedBundles: Bundle[] = [];
      
      if (bundleProducts.length > 0) {
        suggestedBundles.push({
          id: "bundle-deal",
          name: "Bundle Deal",
          description: "Save with our bundle deals",
          products: bundleProducts.slice(0, 3),
          savingsPercent: 10,
        });
      }

      setBundles(suggestedBundles);
    } catch (error) {
      console.error("Failed to load bundles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBundle = (bundle: Bundle) => {
    bundle.products.forEach(product => {
      const firstVariant = product.variants?.[0];
      addItem({
        productId: product.id,
        title: product.title,
        handle: product.handle,
        imageUrl: product.featured_image_url || "/placeholder.svg",
        variantId: firstVariant?.id || product.id,
        variantTitle: firstVariant?.title || "Default",
        price: firstVariant?.price || product.price,
        quantity: 1,
        selectedOptions: firstVariant?.options
          ? Object.entries(firstVariant.options).map(([name, value]) => ({ name, value }))
          : [],
      });
    });
    
    setAddedBundles(prev => [...prev, bundle.id]);
    toast.success(`${bundle.name} added to cart!`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Bundle & Save
          </DialogTitle>
          <DialogDescription>Get more value with our curated bundles.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : bundles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No bundles available right now.</p>
          ) : (
            <div className="space-y-4">
              {bundles.map(bundle => (
                <div key={bundle.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{bundle.name}</h3>
                  <p className="text-sm text-muted-foreground">{bundle.description}</p>
                  <div className="mt-2 space-y-1">
                    {bundle.products.map(p => (
                      <p key={p.id} className="text-sm">• {p.title} — {formatPrice(p.price)}</p>
                    ))}
                  </div>
                  <Button 
                    className="mt-3 w-full" 
                    size="sm"
                    disabled={addedBundles.includes(bundle.id)}
                    onClick={() => handleAddBundle(bundle)}
                  >
                    {addedBundles.includes(bundle.id) ? "Added!" : "Add Bundle to Cart"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

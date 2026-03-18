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
import { Plus, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { fetchCmsProducts, CmsProduct } from "@/lib/cms-products";
import { useCartStore } from "@/stores/cartStore";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

interface UpsellPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const UpsellPopup = ({ isOpen, onClose, onProceedToCheckout }: UpsellPopupProps) => {
  const [recommendations, setRecommendations] = useState<CmsProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { items, addItem } = useCartStore();
  const { formatPrice } = useCurrency();

  const cartProductIds = items.map(item => item.productId);

  useEffect(() => {
    if (isOpen) loadRecommendations();
  }, [isOpen, items]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const allProducts = await fetchCmsProducts(50);
      const accessories = allProducts.filter(p => {
        if (cartProductIds.includes(p.id)) return false;
        return p.collection === "accessories";
      });
      setRecommendations(accessories.slice(0, 4));
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const handleAddToCart = (product: CmsProduct) => {
    setAddingToCart(product.id);
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
    toast.success(`${product.title} added!`, { position: "top-center" });
    setRecommendations(prev => prev.filter(p => p.id !== product.id));
    setAddingToCart(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />Complete Your Look
          </DialogTitle>
          <DialogDescription>These items pair perfectly with your selection.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground"><p>You've got great taste! Ready to checkout?</p></div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {recommendations.map((product) => (
                <div key={product.id} className="group bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300">
                  <div className="aspect-square bg-muted overflow-hidden">
                    {product.featured_image_url ? (
                      <img src={product.featured_image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <h4 className="font-medium text-sm truncate">{product.title}</h4>
                    <p className="text-primary font-semibold text-sm">{formatPrice(product.price)}</p>
                    <Button onClick={() => handleAddToCart(product)} disabled={addingToCart === product.id} size="sm" className="w-full" variant="outline">
                      {addingToCart === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" />Add to Order</>}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={onClose}>Continue Shopping</Button>
          <Button onClick={onProceedToCheckout} className="bg-primary hover:bg-primary/90">
            <ArrowRight className="h-4 w-4 mr-2" />Proceed to Checkout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

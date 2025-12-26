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
import { ShopifyProduct, fetchProducts } from "@/lib/shopify";
import { useCartStore, CartItem } from "@/stores/cartStore";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

interface UpsellPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const UpsellPopup = ({ isOpen, onClose, onProceedToCheckout }: UpsellPopupProps) => {
  const [recommendations, setRecommendations] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { items, addItem } = useCartStore();
  const { formatPrice } = useCurrency();

  // Get IDs of products already in cart to exclude them
  const cartProductIds = items.map(item => item.product.node.id);

  useEffect(() => {
    if (isOpen) {
      loadRecommendations();
    }
  }, [isOpen]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      // Fetch products that could be add-ons (limiting to 6 for display)
      const products = await fetchProducts(12);
      
      // Filter out products already in cart and limit to 4 recommendations
      const filtered = products
        .filter(p => !cartProductIds.includes(p.node.id))
        .slice(0, 4);
      
      setRecommendations(filtered);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: ShopifyProduct) => {
    const firstVariant = product.node.variants.edges[0]?.node;
    if (!firstVariant || !firstVariant.availableForSale) {
      toast.error("This product is currently unavailable");
      return;
    }

    setAddingToCart(product.node.id);

    const cartItem: CartItem = {
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions || []
    };

    addItem(cartItem);
    toast.success(`${product.node.title} added to cart!`, {
      position: "top-center"
    });

    // Remove from recommendations
    setRecommendations(prev => prev.filter(p => p.node.id !== product.node.id));
    setAddingToCart(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Complete Your Look
          </DialogTitle>
          <DialogDescription>
            These items pair perfectly with your selection. Add them now before checkout!
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>You've got great taste! Ready to checkout?</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {recommendations.map((product) => {
                const firstVariant = product.node.variants.edges[0]?.node;
                const price = firstVariant?.price.amount || product.node.priceRange.minVariantPrice.amount;
                const imageUrl = product.node.images.edges[0]?.node.url;
                const isAdding = addingToCart === product.node.id;

                return (
                  <div
                    key={product.node.id}
                    className="group bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="aspect-square bg-muted overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.node.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm truncate">{product.node.title}</h4>
                      <p className="text-primary font-semibold mt-1">
                        {formatPrice(parseFloat(price))}
                      </p>
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={isAdding || !firstVariant?.availableForSale}
                        size="sm"
                        className="w-full mt-2"
                        variant="outline"
                      >
                        {isAdding ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            Add to Order
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="sm:order-1"
          >
            Continue Shopping
          </Button>
          <Button
            onClick={onProceedToCheckout}
            className="bg-primary hover:bg-primary/90 sm:order-2"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Proceed to Checkout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

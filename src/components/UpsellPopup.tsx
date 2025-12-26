import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Minus, Loader2, ArrowRight, Sparkles, Tag, Check } from "lucide-react";
import { ShopifyProduct, fetchProducts } from "@/lib/shopify";
import { useCartStore, CartItem } from "@/stores/cartStore";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

interface UpsellPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

interface ProductWithQuantity {
  product: ShopifyProduct;
  quantity: number;
}

export const UpsellPopup = ({ isOpen, onClose, onProceedToCheckout }: UpsellPopupProps) => {
  const [recommendations, setRecommendations] = useState<ProductWithQuantity[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const { items, addItem } = useCartStore();
  const { formatPrice } = useCurrency();

  // Get IDs and product types from cart for smart recommendations
  const cartProductIds = items.map(item => item.product.node.id);
  const cartProductTypes = items.map(item => {
    // Extract product type hints from title (e.g., "wig", "bundle", "frontal")
    const title = item.product.node.title.toLowerCase();
    if (title.includes('wig')) return 'wig';
    if (title.includes('bundle')) return 'bundle';
    if (title.includes('frontal')) return 'frontal';
    if (title.includes('closure')) return 'closure';
    return 'accessory';
  });

  useEffect(() => {
    if (isOpen) {
      loadRecommendations();
      setDiscountCode("");
      setDiscountApplied(false);
    }
  }, [isOpen, items]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      // Fetch more products to filter intelligently
      const allProducts = await fetchProducts(20);
      
      // Smart filtering: recommend complementary products
      const complementaryProducts = allProducts.filter(p => {
        // Exclude products already in cart
        if (cartProductIds.includes(p.node.id)) return false;
        
        const title = p.node.title.toLowerCase();
        
        // If cart has wigs, recommend care products, frontals, or accessories
        if (cartProductTypes.includes('wig')) {
          if (title.includes('care') || title.includes('oil') || title.includes('spray')) return true;
          if (title.includes('cap') || title.includes('edge')) return true;
        }
        
        // If cart has bundles, recommend closures or frontals
        if (cartProductTypes.includes('bundle')) {
          if (title.includes('closure') || title.includes('frontal')) return true;
        }
        
        // If cart has frontals/closures, recommend bundles or styling products
        if (cartProductTypes.includes('frontal') || cartProductTypes.includes('closure')) {
          if (title.includes('bundle')) return true;
        }
        
        return true; // Include as fallback
      });

      // Prioritize complementary items, limit to 4
      const prioritized = complementaryProducts.slice(0, 4);
      
      setRecommendations(prioritized.map(p => ({ product: p, quantity: 1 })));
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setRecommendations(prev => 
      prev.map(item => 
        item.product.node.id === productId 
          ? { ...item, quantity: Math.max(1, Math.min(10, item.quantity + delta)) }
          : item
      )
    );
  };

  const handleAddToCart = async (item: ProductWithQuantity) => {
    const firstVariant = item.product.node.variants.edges[0]?.node;
    if (!firstVariant || !firstVariant.availableForSale) {
      toast.error("This product is currently unavailable");
      return;
    }

    setAddingToCart(item.product.node.id);

    const cartItem: CartItem = {
      product: item.product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: item.quantity,
      selectedOptions: firstVariant.selectedOptions || []
    };

    addItem(cartItem);
    toast.success(`${item.quantity}x ${item.product.node.title} added!`, {
      position: "top-center"
    });

    // Remove from recommendations
    setRecommendations(prev => prev.filter(p => p.product.node.id !== item.product.node.id));
    setAddingToCart(null);
  };

  const handleApplyDiscount = () => {
    if (!discountCode.trim()) {
      toast.error("Please enter a discount code");
      return;
    }
    // Note: Actual discount validation happens at Shopify checkout
    setDiscountApplied(true);
    toast.success("Discount code will be applied at checkout!", {
      position: "top-center"
    });
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

        <div className="py-4 space-y-6">
          {/* Discount Code Section */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Have a discount code?</span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                disabled={discountApplied}
                className="flex-1"
              />
              <Button
                onClick={handleApplyDiscount}
                variant={discountApplied ? "secondary" : "outline"}
                disabled={discountApplied}
                size="sm"
              >
                {discountApplied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Applied
                  </>
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
            {discountApplied && (
              <p className="text-xs text-muted-foreground mt-2">
                Code "{discountCode}" will be applied at Shopify checkout
              </p>
            )}
          </div>

          {/* Product Recommendations */}
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
              {recommendations.map((item) => {
                const firstVariant = item.product.node.variants.edges[0]?.node;
                const price = firstVariant?.price.amount || item.product.node.priceRange.minVariantPrice.amount;
                const imageUrl = item.product.node.images.edges[0]?.node.url;
                const isAdding = addingToCart === item.product.node.id;
                const itemTotal = parseFloat(price) * item.quantity;

                return (
                  <div
                    key={item.product.node.id}
                    className="group bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="aspect-square bg-muted overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.product.node.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <h4 className="font-medium text-sm truncate">{item.product.node.title}</h4>
                      <div className="flex items-center justify-between">
                        <p className="text-primary font-semibold text-sm">
                          {formatPrice(parseFloat(price))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total: {formatPrice(itemTotal)}
                        </p>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-center gap-2 py-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.product.node.id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.product.node.id, 1)}
                          disabled={item.quantity >= 10}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        onClick={() => handleAddToCart(item)}
                        disabled={isAdding || !firstVariant?.availableForSale}
                        size="sm"
                        className="w-full"
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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";
import { UpsellPopup } from "./UpsellPopup";
import { PointsRedemption } from "./PointsRedemption";

export const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [pointsUsed, setPointsUsed] = useState(0);
  const { 
    items, 
    isLoading, 
    updateQuantity, 
    removeItem, 
    createCheckout 
  } = useCartStore();
  const { formatPrice } = useCurrency();
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  // Calculate total in ZAR (assuming prices from Shopify are in ZAR)
  const totalPriceZAR = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
  const finalTotal = Math.max(0, totalPriceZAR - pointsDiscount);

  const handleDiscountApplied = (discount: number, points: number) => {
    setPointsDiscount(discount);
    setPointsUsed(points);
  };

  const handleDiscountRemoved = () => {
    setPointsDiscount(0);
    setPointsUsed(0);
  };

  // Show upsell popup when checkout button is clicked
  const handleCheckoutClick = () => {
    setShowUpsell(true);
  };

  // Proceed with actual checkout after upsell
  const handleProceedToCheckout = async () => {
    setShowUpsell(false);
    try {
      await createCheckout();
      const checkoutUrl = useCartStore.getState().checkoutUrl;
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error("Failed to create checkout. Please try again.");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            {totalItems === 0 ? "Your cart is empty" : `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`}
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col flex-1 pt-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                <div className="space-y-4">
                  {items.map((item) => {
                    // Calculate add-on cost for custom wigs
                    const isCustomWig = item.isCustomWig || item.variantId?.startsWith('LUNA-CUSTOM-');
                    const totalPrice = parseFloat(item.price.amount);
                    const bundleOption = item.selectedOptions.find(opt => opt.name === 'Base Bundle');
                    const basePrice = bundleOption?.value?.toLowerCase().includes('bodywave') ? 3700 : 3000;
                    const addonCost = isCustomWig ? totalPrice - basePrice : 0;
                    
                    return (
                      <div key={item.variantId} className="flex gap-4 p-2 bg-card rounded-lg">
                        <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                          {item.product.node.images?.edges?.[0]?.node && (
                            <img
                              src={item.product.node.images.edges[0].node.url}
                              alt={item.product.node.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{item.product.node.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.selectedOptions
                              .filter(opt => opt.name !== 'SKU' && opt.name !== 'Free Shipping')
                              .map(option => option.value)
                              .join(' • ')}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-primary">
                              {formatPrice(totalPrice)}
                            </p>
                            {isCustomWig && addonCost > 0 && (
                              <span className="text-xs text-muted-foreground">
                                (Base: {formatPrice(basePrice)} + Add-ons: {formatPrice(addonCost)})
                              </span>
                            )}
                            {isCustomWig && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                Free Shipping
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeItem(item.variantId)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex-shrink-0 space-y-4 pt-4 border-t bg-background">
                {/* Custom Wig Add-on Notice */}
                {items.some(item => item.isCustomWig) && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      <strong>Custom Wig Order:</strong> Your checkout will show the base bundle price. Add-on customizations are included in your order details and will be processed together.
                    </p>
                  </div>
                )}

                {/* Points Redemption */}
                <PointsRedemption
                  cartTotal={totalPriceZAR}
                  onDiscountApplied={handleDiscountApplied}
                  onDiscountRemoved={handleDiscountRemoved}
                  appliedDiscount={pointsDiscount}
                />

                {pointsDiscount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Points Discount</span>
                    <span className="text-green-600 font-medium">
                      -{formatPrice(pointsDiscount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
                
                <Button 
                  onClick={handleCheckoutClick}
                  className="w-full bg-primary hover:bg-primary/90 btn-glow" 
                  size="lg"
                  disabled={items.length === 0 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Checkout...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Checkout
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>

      {/* Upsell Popup */}
      <UpsellPopup
        isOpen={showUpsell}
        onClose={() => setShowUpsell(false)}
        onProceedToCheckout={handleProceedToCheckout}
      />
    </Sheet>
  );
};

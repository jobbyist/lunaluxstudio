import { useState } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";
import { ShoppingCart, X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";

interface QuickViewModalProps {
  product: ShopifyProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickViewModal = ({ product, open, onOpenChange }: QuickViewModalProps) => {
  const { node } = product;
  const addItem = useCartStore((state) => state.addItem);
  const { formatPrice } = useCurrency();

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const variants = node.variants.edges;
  const selectedVariant = variants[selectedVariantIndex]?.node;
  const imageUrl = node.images.edges[0]?.node.url || "/placeholder.svg";
  const price = selectedVariant?.price || node.priceRange.minVariantPrice;

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    const cartItem = {
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions || [],
    };

    addItem(cartItem);
    toast.success("Added to cart", {
      description: `${node.title} x${quantity}`,
      position: "top-center",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{node.title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="aspect-square bg-muted">
            <img
              src={imageUrl}
              alt={node.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="p-6 flex flex-col">
            <h2 className="text-xl font-serif mb-2">{node.title}</h2>
            <p className="text-2xl font-semibold text-primary mb-4">
              {formatPrice(parseFloat(price.amount))}
            </p>

            {/* Variant Selection */}
            {variants.length > 1 && (
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Variant</label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant, index) => (
                    <button
                      key={variant.node.id}
                      onClick={() => setSelectedVariantIndex(index)}
                      disabled={!variant.node.availableForSale}
                      className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                        selectedVariantIndex === index
                          ? "border-primary bg-primary text-primary-foreground"
                          : variant.node.availableForSale
                          ? "border-border hover:border-primary"
                          : "border-border opacity-50 cursor-not-allowed"
                      }`}
                    >
                      {variant.node.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-border rounded-md hover:bg-muted transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 border border-border rounded-md hover:bg-muted transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              disabled={!selectedVariant?.availableForSale}
              className="w-full mb-3"
              size="lg"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {selectedVariant?.availableForSale ? "Add to Cart" : "Out of Stock"}
            </Button>

            {/* View Full Details */}
            <Link
              to={`/product/${node.handle}`}
              onClick={() => onOpenChange(false)}
              className="text-center text-sm text-muted-foreground hover:text-primary underline transition-colors"
            >
              View Full Details
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

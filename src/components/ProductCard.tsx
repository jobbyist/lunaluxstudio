import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ProductCardProps {
  product: ShopifyProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const { node } = product;
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { formatPrice, currency } = useCurrency();

  useEffect(() => {
    checkAuthAndLoadData();
  }, [node.id]);

  const checkAuthAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);

    if (user) {
      // Check wishlist
      const { data: wishlistData } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", node.id)
        .single();
      
      setIsInWishlist(!!wishlistData);

      // Get user rating
      const { data: ratingData } = await supabase
        .from("product_ratings")
        .select("rating")
        .eq("user_id", user.id)
        .eq("product_id", node.id)
        .single();
      
      if (ratingData) setUserRating(ratingData.rating);
    }

    // Get average rating
    const { data: ratingsData } = await supabase
      .from("product_ratings")
      .select("rating")
      .eq("product_id", node.id);
    
    if (ratingsData && ratingsData.length > 0) {
      const avg = ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length;
      setAverageRating(avg);
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to add to wishlist");
      return;
    }

    try {
      if (isInWishlist) {
        await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", node.id);
        
        setIsInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        await supabase
          .from("wishlists")
          .insert({ user_id: user.id, product_id: node.id });
        
        setIsInWishlist(true);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error("Failed to update wishlist");
    }
  };

  const handleRating = async (rating: number, e: React.MouseEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to rate products");
      return;
    }

    try {
      const { error } = await supabase
        .from("product_ratings")
        .upsert(
          { user_id: user.id, product_id: node.id, rating },
          { onConflict: "user_id,product_id" }
        );

      if (error) throw error;

      setUserRating(rating);
      toast.success(`Rated ${rating} stars`);
      checkAuthAndLoadData(); // Refresh average rating
    } catch (error) {
      console.error("Rating error:", error);
      toast.error("Failed to submit rating");
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const defaultVariant = node.variants.edges[0]?.node;
    if (!defaultVariant) return;

    const cartItem = {
      product,
      variantId: defaultVariant.id,
      variantTitle: defaultVariant.title,
      price: defaultVariant.price,
      quantity: 1,
      selectedOptions: defaultVariant.selectedOptions || []
    };
    
    addItem(cartItem);
    toast.success("Added to cart", {
      description: node.title,
      position: "top-center",
    });
  };

  const imageUrl = node.images.edges[0]?.node.url || "/placeholder.svg";
  const price = node.priceRange.minVariantPrice;
  
  // Convert Shopify price (in ZAR) to selected currency
  const priceInZAR = parseFloat(price.amount);
  const displayPrice = formatPrice(priceInZAR);

  return (
    <Link to={`/product/${node.handle}`} className="group">
      <div className="bg-background rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
        <div className="aspect-[3/4] bg-muted overflow-hidden relative">
          <img
            src={imageUrl}
            alt={node.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {isAuthenticated && (
            <button
              onClick={toggleWishlist}
              className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
            >
              <Heart
                className={`h-5 w-5 ${isInWishlist ? "fill-primary text-primary" : "text-foreground"}`}
              />
            </button>
          )}
        </div>
        
        <div className="p-4 space-y-3">
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {node.title}
          </h3>
          
          {isAuthenticated && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={(e) => handleRating(star, e)}
                  className="p-0.5 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-4 w-4 ${
                      star <= userRating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              {averageRating > 0 && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({averageRating.toFixed(1)})
                </span>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-primary">
              {displayPrice}
            </span>
          </div>

          <Button
            onClick={handleAddToCart}
            className="w-full bg-primary hover:bg-primary/90"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </Link>
  );
};

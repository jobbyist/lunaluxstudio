import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { OptimizedImage } from "@/components/OptimizedImage";

interface ProductCardProps {
  product: ShopifyProduct;
}

const REVIEW_BONUS_POINTS = 10; // Points awarded for each review

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const { node } = product;
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { formatPrice, currency } = useCurrency();

  useEffect(() => {
    checkAuthAndLoadData();
  }, [node.id]);

  const checkAuthAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
    setUserId(user?.id || null);

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
      // Check if user already rated this product
      const { data: existingRating } = await supabase
        .from("product_ratings")
        .select("id, points_awarded")
        .eq("user_id", user.id)
        .eq("product_id", node.id)
        .single();

      const isFirstRating = !existingRating;

      // Upsert the rating - bonus points are awarded automatically via database trigger
      const { error } = await supabase
        .from("product_ratings")
        .upsert(
          { 
            user_id: user.id, 
            product_id: node.id, 
            rating,
            points_awarded: false // Will be set to true by trigger when points are awarded
          },
          { onConflict: "user_id,product_id" }
        );

      if (error) throw error;

      setUserRating(rating);

      // Show appropriate toast - points are awarded server-side via trigger for first ratings
      if (isFirstRating) {
        toast.success(`Rated ${rating} stars! +${REVIEW_BONUS_POINTS} bonus points earned`);
      } else {
        toast.success(`Rating updated to ${rating} stars`);
      }
      
      checkAuthAndLoadData(); // Refresh average rating
    } catch (error: any) {
      console.error("Rating error:", error);
      // Check if this is a rate limit error
      if (error?.message?.includes("violates row-level security") || error?.code === "42501") {
        toast.error("Too many ratings. Please try again later.");
      } else {
        toast.error("Failed to submit rating");
      }
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
    <Link
      to={`/product/${node.handle}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="border-gradient rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover-lift shine animate-in fade-in-0 zoom-in-95">
        <div className="aspect-[3/4] overflow-hidden relative bg-muted">
          <OptimizedImage
            src={imageUrl}
            alt={node.title}
            containerClassName="w-full h-full"
            className="group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          {isAuthenticated && (
            <button
              onClick={toggleWishlist}
              className="absolute top-3 right-3 p-2.5 glass rounded-full hover:scale-110 transition-all duration-300 z-10 shadow-sm"
            >
              <Heart
                className={`h-5 w-5 transition-colors duration-300 ${isInWishlist ? "fill-primary text-primary" : "text-foreground"}`}
              />
            </button>
          )}
        </div>
        
        <div className="p-5 space-y-3 border-t border-border/40 bg-card/80 backdrop-blur-sm">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
            {node.title}
          </h3>
          
          {isAuthenticated && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={(e) => handleRating(star, e)}
                  className="p-0.5 hover:scale-125 transition-transform duration-200"
                >
                  <Star
                    className={`h-4 w-4 transition-all duration-200 ${
                      star <= userRating
                        ? "fill-gold text-gold"
                        : "text-muted-foreground hover:text-gold/50"
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
            <span className="text-lg font-semibold gradient-text">
              {displayPrice}
            </span>
          </div>

          <Button
            onClick={handleAddToCart}
            className="w-full btn-glow bg-primary hover:bg-primary/90 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20"
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

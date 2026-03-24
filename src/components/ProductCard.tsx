import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { OptimizedImage } from "@/components/OptimizedImage";
import { CmsProduct } from "@/lib/cms-products";

interface ProductCardProps {
  product: CmsProduct;
}

const REVIEW_BONUS_POINTS = 10;

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    checkAuthAndLoadData();
  }, [product.id]);

  const checkAuthAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);

    if (user) {
      const { data: wishlistData } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .single();
      setIsInWishlist(!!wishlistData);

      const { data: ratingData } = await supabase
        .from("product_ratings")
        .select("rating")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .single();
      if (ratingData) setUserRating(ratingData.rating);
    }

    const { data: ratingsData } = await supabase
      .from("product_ratings")
      .select("rating")
      .eq("product_id", product.id);
    if (ratingsData && ratingsData.length > 0) {
      const avg = ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length;
      setAverageRating(avg);
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Please sign in to add to wishlist"); return; }

    try {
      if (isInWishlist) {
        await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", product.id);
        setIsInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        await supabase.from("wishlists").insert({ user_id: user.id, product_id: product.id });
        setIsInWishlist(true);
        toast.success("Added to wishlist");
      }
    } catch { toast.error("Failed to update wishlist"); }
  };

  const handleRating = async (rating: number, e: React.MouseEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Please sign in to rate products"); return; }

    try {
      const { data: existingRating } = await supabase
        .from("product_ratings")
        .select("id, points_awarded")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .single();

      const isFirstRating = !existingRating;

      const { error } = await supabase
        .from("product_ratings")
        .upsert({ user_id: user.id, product_id: product.id, rating, points_awarded: false }, { onConflict: "user_id,product_id" });

      if (error) throw error;
      setUserRating(rating);

      if (isFirstRating) {
        toast.success(`Rated ${rating} stars! +${REVIEW_BONUS_POINTS} bonus points earned`);
      } else {
        toast.success(`Rating updated to ${rating} stars`);
      }
      checkAuthAndLoadData();
    } catch (error: any) {
      if (error?.code === "42501") {
        toast.error("Too many ratings. Please try again later.");
      } else {
        toast.error("Failed to submit rating");
      }
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const firstVariant = product.variants?.[0];
    const price = firstVariant?.price || product.price;
    const variantId = firstVariant?.id || product.id;
    const variantTitle = firstVariant?.title || "Default";

    addItem({
      productId: product.id,
      title: product.title,
      handle: product.handle,
      imageUrl: product.featured_image_url || "/placeholder.svg",
      variantId,
      variantTitle,
      price,
      quantity: 1,
      selectedOptions: firstVariant?.options 
        ? Object.entries(firstVariant.options).map(([name, value]) => ({ name, value }))
        : [],
    });
    toast.success("Added to cart", { description: product.title, position: "top-center" });
  };

  const imageUrl = product.featured_image_url || "/placeholder.svg";
  const displayPrice = formatPrice(product.price);
  const hasRatings = averageRating > 0;

  return (
    <Link to={`/product/${product.handle}`} className="group focus:outline-none">
      <div className="bg-card/95 rounded-2xl overflow-hidden transition-all duration-300 hover-lift border border-border/60 shadow-sm hover:shadow-lg hover:shadow-primary/20">
        <div className="aspect-[3/4] overflow-hidden relative">
          <OptimizedImage
            src={imageUrl}
            alt={product.title}
            containerClassName="w-full h-full"
            className="group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          {isAuthenticated && (
            <button onClick={toggleWishlist} className="absolute top-3 right-3 p-2.5 glass rounded-full hover:scale-110 transition-all duration-300 z-10">
              <Heart className={`h-5 w-5 transition-colors duration-300 ${isInWishlist ? "fill-primary text-primary" : "text-foreground"}`} />
            </button>
          )}
        </div>
        
        <div className="p-5 space-y-3">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
            {product.title}
          </h3>
          
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = isAuthenticated ? star <= userRating : star <= Math.round(averageRating);
              const baseClass = isActive ? "fill-gold text-gold" : "text-muted-foreground/70";
              return isAuthenticated ? (
                <button key={star} onClick={(e) => handleRating(star, e)} className="p-0.5 hover:scale-125 transition-transform duration-200">
                  <Star className={`h-4 w-4 transition-all duration-200 ${baseClass}`} />
                </button>
              ) : (
                <Star key={star} className={`h-4 w-4 ${baseClass}`} />
              );
            })}
            {hasRatings && (
              <span className="text-xs text-muted-foreground ml-2">
                ({averageRating.toFixed(1)})
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold gradient-text">{displayPrice}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-sm text-muted-foreground line-through">{formatPrice(product.compare_at_price)}</span>
            )}
          </div>

          <Button onClick={handleAddToCart} className="w-full btn-glow bg-primary hover:bg-primary/90 transition-all duration-300" size="sm">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </Link>
  );
};

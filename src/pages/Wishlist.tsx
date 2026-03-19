import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { PageLoadingSkeleton } from "@/components/PageLoadingSkeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fetchCmsProducts, CmsProduct } from "@/lib/cms-products";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Heart, ShoppingCart, Trash2, LogIn } from "lucide-react";

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
}

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [products, setProducts] = useState<CmsProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { formatPrice } = useCurrency();
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();

  useEffect(() => { checkAuthAndLoadWishlist(); }, []);

  const checkAuthAndLoadWishlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsAuthenticated(false); setLoading(false); return; }
      setIsAuthenticated(true);

      const { data: wishlistData, error } = await supabase
        .from("wishlists").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      setWishlistItems(wishlistData || []);

      if (wishlistData && wishlistData.length > 0) {
        const allProducts = await fetchCmsProducts(100);
        setProducts(allProducts);
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const getProductForWishlistItem = (productId: string) => products.find((p) => p.id === productId);

  const handleRemoveFromWishlist = async (wishlistId: string) => {
    try {
      const { error } = await supabase.from("wishlists").delete().eq("id", wishlistId);
      if (error) throw error;
      setWishlistItems((prev) => prev.filter((item) => item.id !== wishlistId));
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  };

  const handleAddToCart = (product: CmsProduct) => {
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
    toast.success("Added to cart", { description: product.title, position: "top-center" });
  };

  if (loading) return <PageLayout><PageLoadingSkeleton variant="grid" /></PageLayout>;

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center"><Heart className="h-10 w-10 text-muted-foreground" /></div>
            <h1 className="text-3xl font-serif mb-4">Your Wishlist</h1>
            <p className="text-muted-foreground mb-8">Sign in to view and manage your wishlist.</p>
            <Button onClick={() => navigate("/auth")} size="lg" className="gap-2"><LogIn className="h-4 w-4" />Sign In to View Wishlist</Button>
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <section className="relative py-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 pt-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Heart className="h-4 w-4 fill-primary" /><span className="text-sm font-medium">Your Favorites</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif mb-4">My Wishlist</h1>
            <p className="text-muted-foreground">
              {wishlistItems.length === 0 ? "Your wishlist is empty." : `You have ${wishlistItems.length} item${wishlistItems.length !== 1 ? "s" : ""} in your wishlist`}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 pb-20">
        <div className="container mx-auto px-4">
          {wishlistItems.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center"><Heart className="h-12 w-12 text-muted-foreground" /></div>
              <h2 className="text-2xl font-serif mb-4">No items yet</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">Browse our collections and click the heart icon to add products to your wishlist.</p>
              <Button asChild size="lg"><Link to="/explore">Start Shopping</Link></Button>
            </motion.div>
          ) : (
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}>
              {wishlistItems.map((item) => {
                const product = getProductForWishlistItem(item.product_id);
                if (!product) {
                  return (
                    <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-card rounded-lg p-6 border border-border">
                      <p className="text-muted-foreground text-center">Product no longer available</p>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveFromWishlist(item.id)} className="w-full mt-4"><Trash2 className="h-4 w-4 mr-2" />Remove</Button>
                    </motion.div>
                  );
                }
                const imageUrl = product.featured_image_url || "/placeholder.svg";
                return (
                  <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-background rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300">
                    <Link to={`/product/${product.handle}`}>
                      <div className="aspect-[3/4] bg-muted overflow-hidden relative">
                        <img src={imageUrl} alt={product.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                    </Link>
                    <div className="p-4 space-y-3">
                      <Link to={`/product/${product.handle}`}><h3 className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2">{product.title}</h3></Link>
                      <p className="text-lg font-semibold text-primary">{formatPrice(product.price)}</p>
                      <div className="flex gap-2">
                        <Button onClick={() => handleAddToCart(product)} className="flex-1" size="sm"><ShoppingCart className="h-4 w-4 mr-2" />Add to Cart</Button>
                        <Button variant="outline" size="sm" onClick={() => handleRemoveFromWishlist(item.id)} className="px-3"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default Wishlist;

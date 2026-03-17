import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Sparkles, Check, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";

interface BundleItem {
  product: ShopifyProduct;
  quantity: number;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  items: BundleItem[];
  popular?: boolean;
}

// Configuration for product categorization
const PRODUCT_CATEGORIES = {
  bundle: ['bundle', 'wave', 'straight', 'curly', 'body wave'],
  closure: ['closure'],
  frontal: ['frontal'],
  wig: ['wig'],
  accessory: ['cap', 'glue', 'band', 'brush', 'stand'],
  care: ['spray', 'oil', 'shampoo', 'conditioner', 'serum']
} as const;

// Maximum number of products to fetch for bundle creation
const MAX_PRODUCTS_TO_FETCH = 50;

// Helper function to categorize products based on title/description
const categorizeProduct = (product: ShopifyProduct): string => {
  const title = product.node.title.toLowerCase();
  const description = product.node.description.toLowerCase();
  const searchText = `${title} ${description}`;
  
  // Check each category's keywords
  for (const [category, keywords] of Object.entries(PRODUCT_CATEGORIES)) {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return category;
    }
  }
  
  return 'other';
};

// Create complementary bundles from Shopify products
const createBundlesFromProducts = (products: ShopifyProduct[]): Bundle[] => {
  const bundles: Bundle[] = [];
  
  // Categorize all products
  const categorized: Record<string, ShopifyProduct[]> = {
    bundle: [],
    closure: [],
    frontal: [],
    wig: [],
    accessory: [],
    care: []
  };
  
  products.forEach(product => {
    const category = categorizeProduct(product);
    if (categorized[category]) {
      categorized[category].push(product);
    }
  });
  
  // Bundle 1: Starter Bundle (2 bundles + 1 closure)
  if (categorized.bundle.length >= 1 && categorized.closure.length >= 1) {
    const bundleProduct = categorized.bundle[0];
    const closureProduct = categorized.closure[0];
    const bundlePrice = parseFloat(bundleProduct.node.priceRange.minVariantPrice.amount) * 2;
    const closurePrice = parseFloat(closureProduct.node.priceRange.minVariantPrice.amount);
    const originalPrice = bundlePrice + closurePrice;
    const savings = 20;
    
    bundles.push({
      id: "starter-bundle",
      name: "Starter Bundle",
      description: "Perfect for first-time buyers",
      originalPrice: Math.round(originalPrice),
      bundlePrice: Math.round(originalPrice * (1 - savings / 100)),
      savings,
      items: [
        { product: bundleProduct, quantity: 2 },
        { product: closureProduct, quantity: 1 }
      ]
    });
  }
  
  // Bundle 2: Complete Look (3 bundles + frontal + care product)
  if (categorized.bundle.length >= 1 && categorized.frontal.length >= 1 && categorized.care.length >= 1) {
    const bundleProduct = categorized.bundle[0];
    const frontalProduct = categorized.frontal[0];
    const careProduct = categorized.care[0];
    const bundlePrice = parseFloat(bundleProduct.node.priceRange.minVariantPrice.amount) * 3;
    const frontalPrice = parseFloat(frontalProduct.node.priceRange.minVariantPrice.amount);
    const carePrice = parseFloat(careProduct.node.priceRange.minVariantPrice.amount);
    const originalPrice = bundlePrice + frontalPrice + carePrice;
    const savings = 25;
    
    bundles.push({
      id: "complete-look",
      name: "Complete Look Bundle",
      description: "Everything for a full head install",
      originalPrice: Math.round(originalPrice),
      bundlePrice: Math.round(originalPrice * (1 - savings / 100)),
      savings,
      popular: true,
      items: [
        { product: bundleProduct, quantity: 3 },
        { product: frontalProduct, quantity: 1 },
        { product: careProduct, quantity: 1 }
      ]
    });
  }
  
  // Bundle 3: Luxury Collection (premium bundles + frontal + care products)
  if (categorized.bundle.length >= 2 && categorized.frontal.length >= 1 && categorized.care.length >= 2) {
    const bundleProduct = categorized.bundle[1];
    const frontalProduct = categorized.frontal[0];
    const careProduct1 = categorized.care[0];
    const careProduct2 = categorized.care[1]; // Guaranteed to exist due to condition check
    const bundlePrice = parseFloat(bundleProduct.node.priceRange.minVariantPrice.amount) * 3;
    const frontalPrice = parseFloat(frontalProduct.node.priceRange.minVariantPrice.amount);
    const carePrice = parseFloat(careProduct1.node.priceRange.minVariantPrice.amount) + 
                     parseFloat(careProduct2.node.priceRange.minVariantPrice.amount);
    const originalPrice = bundlePrice + frontalPrice + carePrice;
    const savings = 30;
    
    bundles.push({
      id: "luxury-collection",
      name: "Luxury Collection",
      description: "Premium quality for the discerning client",
      originalPrice: Math.round(originalPrice),
      bundlePrice: Math.round(originalPrice * (1 - savings / 100)),
      savings,
      items: [
        { product: bundleProduct, quantity: 3 },
        { product: frontalProduct, quantity: 1 },
        { product: careProduct1, quantity: 1 },
        { product: careProduct2, quantity: 1 }
      ]
    });
  }
  
  // Bundle 4: Wig Essentials (accessories for wig wearers)
  if (categorized.accessory.length >= 3) {
    const accessories = categorized.accessory.slice(0, 5);
    const totalPrice = accessories.reduce((sum, acc) => 
      sum + parseFloat(acc.node.priceRange.minVariantPrice.amount), 0
    );
    const savings = 25;
    
    bundles.push({
      id: "wig-essentials",
      name: "Wig Essentials Kit",
      description: "Complete wig care package",
      originalPrice: Math.round(totalPrice),
      bundlePrice: Math.round(totalPrice * (1 - savings / 100)),
      savings,
      items: accessories.map(acc => ({ product: acc, quantity: 1 }))
    });
  }
  
  return bundles;
};

interface BundleSavePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BundleSavePopup = ({ isOpen, onClose }: BundleSavePopupProps) => {
  const { addItem } = useCartStore();
  const [addedBundles, setAddedBundles] = useState<string[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBundles = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch products from Shopify
        const products = await fetchProducts(MAX_PRODUCTS_TO_FETCH);
        
        if (products.length === 0) {
          setError("No products available to create bundles");
          return;
        }
        
        // Create bundles from fetched products
        const createdBundles = createBundlesFromProducts(products);
        
        if (createdBundles.length === 0) {
          setError("Unable to create bundles from available products");
          return;
        }
        
        setBundles(createdBundles);
      } catch (err) {
        console.error("Error loading bundles:", err);
        setError("Failed to load bundles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadBundles();
    }
  }, [isOpen]);

  const handleAddBundle = (bundle: Bundle) => {
    // Add each product in the bundle to cart with proper quantity
    let addedCount = 0;
    let skippedCount = 0;
    
    bundle.items.forEach(item => {
      const defaultVariant = item.product.node.variants.edges[0]?.node;
      if (defaultVariant) {
        addItem({
          product: item.product,
          variantId: defaultVariant.id,
          variantTitle: defaultVariant.title,
          price: defaultVariant.price,
          quantity: item.quantity, // Use the actual quantity from the bundle
          selectedOptions: defaultVariant.selectedOptions || []
        });
        addedCount++;
      } else {
        // Product has no variants, skip it
        console.warn(`Skipping product without variants: ${item.product.node.title}`);
        skippedCount++;
      }
    });
    
    setAddedBundles(prev => [...prev, bundle.id]);
    
    if (skippedCount > 0) {
      toast.success(`${bundle.name} added to cart!`, {
        description: `${addedCount} items added. ${skippedCount} item(s) unavailable.`
      });
    } else {
      toast.success(`${bundle.name} added to cart!`, {
        description: `${addedCount} items added with ${bundle.savings}% savings`
      });
    }
  };

  const formatPrice = (price: number) => {
    return `R${price.toLocaleString()}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Package className="h-6 w-6 text-primary" />
            Bundle & Save
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            Get more value with our curated bundles from complementary products. Save up to 30%!
          </p>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading bundles...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={onClose} variant="outline">Close</Button>
          </div>
        )}

        {!loading && !error && bundles.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No bundles available at this time.</p>
            <Button onClick={onClose} variant="outline" className="mt-4">Close</Button>
          </div>
        )}

        {!loading && !error && bundles.length > 0 && (
          <>
            <div className="grid gap-4 mt-4">
              {bundles.map((bundle) => (
                <div
                  key={bundle.id}
                  className={`relative border rounded-lg p-4 transition-all hover:border-primary/50 ${
                    bundle.popular ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  {bundle.popular && (
                    <Badge className="absolute -top-2 right-4 bg-primary">
                      Most Popular
                    </Badge>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{bundle.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{bundle.description}</p>
                      
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {bundle.items.map((item, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {item.quantity}x {item.product.node.title}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground line-through">
                          {formatPrice(bundle.originalPrice)}
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {formatPrice(bundle.bundlePrice)}
                        </p>
                        <Badge variant="destructive" className="mt-1">
                          Save {bundle.savings}%
                        </Badge>
                      </div>

                      <Button
                        onClick={() => handleAddBundle(bundle)}
                        disabled={addedBundles.includes(bundle.id)}
                        className="w-full md:w-auto"
                      >
                        {addedBundles.includes(bundle.id) ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Added
                          </>
                        ) : (
                          "Add to Cart"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Bundle prices are calculated based on current product prices. Individual items subject to availability.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

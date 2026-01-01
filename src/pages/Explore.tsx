import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CurrencyProvider, useCurrency } from "@/contexts/CurrencyContext";
import { motion } from "framer-motion";
import { Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";

const categories = [
  { id: "all", name: "All Products" },
  { id: "wigs", name: "Wigs & Units" },
  { id: "bundles", name: "Bundles & Deals" },
  { id: "frontals", name: "Frontals & Closures" },
  { id: "accessories", name: "Accessories" },
  { id: "services", name: "Services" },
];

const ExploreContent = () => {
  const { t, formatPrice } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts(100); // Fetch all products
        setProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filter products based on selected category
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Category filtering based on product title/type
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => {
        const title = product.node.title.toLowerCase();
        const handle = product.node.handle.toLowerCase();
        
        switch (selectedCategory) {
          case "wigs":
            return title.includes("unit") || title.includes("wig") || title.includes("bob") || title.includes("fringe");
          case "bundles":
            return title.includes("bundle") || title.includes("combo") || title.includes("deal") || title.includes("strands");
          case "frontals":
            return title.includes("frontal") || title.includes("closure") || title.includes("13x4") || title.includes("4x4");
          case "accessories":
            return title.includes("lash") || title.includes("brush") || title.includes("bonnet") || title.includes("cap") || title.includes("waver") || title.includes("voucher");
          case "services":
            return title.includes("installation") || title.includes("service");
          default:
            return true;
        }
      });
    }

    // Sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => 
          parseFloat(a.node.priceRange.minVariantPrice.amount) - 
          parseFloat(b.node.priceRange.minVariantPrice.amount)
        );
        break;
      case "price-high":
        filtered.sort((a, b) => 
          parseFloat(b.node.priceRange.minVariantPrice.amount) - 
          parseFloat(a.node.priceRange.minVariantPrice.amount)
        );
        break;
      case "name-az":
        filtered.sort((a, b) => a.node.title.localeCompare(b.node.title));
        break;
      case "name-za":
        filtered.sort((a, b) => b.node.title.localeCompare(a.node.title));
        break;
      default:
        // Featured - keep original order
        break;
    }

    return filtered;
  }, [products, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSelectedCategory("all");
    setSortBy("featured");
  };

  const activeFiltersCount = [
    selectedCategory !== "all",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-40 md:pt-44 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="font-heading text-4xl md:text-5xl mb-4">
              Explore Our <span className="text-primary">Collection</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our curated selection of {products.length} premium hair products. Filter by category to find your perfect match.
            </p>
          </motion.div>

          {/* Category Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-full"
              >
                {category.name}
              </Button>
            ))}
          </motion.div>

          {/* Filters Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-card rounded-lg border border-border"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Showing {filteredProducts.length} of {products.length} products
                </span>
              </div>

              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary">
                  Clear filters
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name-az">Name: A to Z</SelectItem>
                  <SelectItem value="name-za">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {categories.find(c => c.id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory("all")} className="ml-1 hover:text-primary">×</button>
                </Badge>
              )}
            </motion.div>
          )}

          {/* Product Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">No products found in this category.</p>
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  View all products
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.node.id} product={product} />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const Explore = () => {
  return (
    <CurrencyProvider>
      <ExploreContent />
    </CurrencyProvider>
  );
};

export default Explore;

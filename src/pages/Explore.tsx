import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { PageLoadingSkeleton } from "@/components/PageLoadingSkeleton";
import { CurrencyProvider, useCurrency } from "@/contexts/CurrencyContext";
import { motion } from "framer-motion";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/ProductCard";
import { fetchCmsProducts, CmsProduct } from "@/lib/cms-products";

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
  const [products, setProducts] = useState<CmsProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchCmsProducts(100);
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

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => {
        const title = product.title.toLowerCase();
        switch (selectedCategory) {
          case "wigs": return title.includes("unit") || title.includes("wig") || title.includes("bob") || title.includes("fringe");
          case "bundles": return title.includes("bundle") || title.includes("combo") || title.includes("deal") || title.includes("strands");
          case "frontals": return title.includes("frontal") || title.includes("closure") || title.includes("13x4") || title.includes("4x4");
          case "accessories": return title.includes("lash") || title.includes("brush") || title.includes("bonnet") || title.includes("cap") || title.includes("waver") || title.includes("voucher");
          case "services": return title.includes("installation") || title.includes("service");
          default: return true;
        }
      });
    }
    switch (sortBy) {
      case "price-low": filtered.sort((a, b) => a.price - b.price); break;
      case "price-high": filtered.sort((a, b) => b.price - a.price); break;
      case "name-az": filtered.sort((a, b) => a.title.localeCompare(b.title)); break;
      case "name-za": filtered.sort((a, b) => b.title.localeCompare(a.title)); break;
    }
    return filtered;
  }, [products, selectedCategory, sortBy]);

  const clearFilters = () => { setSelectedCategory("all"); setSortBy("featured"); };
  const activeFiltersCount = [selectedCategory !== "all"].filter(Boolean).length;

  if (loading) {
    return (<div className="min-h-screen bg-background"><Header /><main className="pt-36 md:pt-40 pb-16"><PageLoadingSkeleton variant="grid" /></main><Footer /></div>);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageTransition>
        <main className="pt-36 md:pt-40 pb-16">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
              <h1 className="font-heading text-4xl md:text-5xl mb-4">Explore Our <span className="text-primary">Collection</span></h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">Discover our curated selection of {products.length} premium hair products.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="flex flex-wrap justify-center gap-3 mb-8">
              {categories.map((category) => (
                <Button key={category.id} variant={selectedCategory === category.id ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(category.id)} className="rounded-full">{category.name}</Button>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-card rounded-lg border border-border">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Showing {filteredProducts.length} of {products.length} products</span>
                </div>
                {activeFiltersCount > 0 && (<Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary">Clear filters</Button>)}
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name-az">Name: A to Z</SelectItem>
                  <SelectItem value="name-za">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {activeFiltersCount > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2 mb-6">
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    {categories.find(c => c.id === selectedCategory)?.name}
                    <button onClick={() => setSelectedCategory("all")} className="ml-1 hover:text-primary">×</button>
                  </Badge>
                )}
              </motion.div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">No products found in this category.</p>
                <Button variant="link" onClick={clearFilters} className="mt-2">View all products</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (<ProductCard key={product.id} product={product} />))}
              </div>
            )}
          </div>
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
};

const Explore = () => (<CurrencyProvider><ExploreContent /></CurrencyProvider>);
export default Explore;

import { useState } from "react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { PageLoadingSkeleton } from "@/components/PageLoadingSkeleton";
import { ProductCard } from "@/components/ProductCard";
import { useCmsProducts } from "@/hooks/useCmsProducts";
import { Filter, ArrowUpDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/contexts/CurrencyContext";

const Bestsellers = () => {
  const [sortBy, setSortBy] = useState("default");
  const [filterBy, setFilterBy] = useState("all");
  const { t } = useCurrency();
  const { products, loading } = useCmsProducts({ limit: 50 });

  const productTypes = [...new Set(products.map(p => {
    const title = p.title.toLowerCase();
    if (title.includes("wig")) return "Wigs";
    if (title.includes("bundle")) return "Bundles";
    if (title.includes("frontal") || title.includes("closure")) return "Frontals & Closures";
    return "Other";
  }))].filter(type => type !== "Other");

  const filteredProducts = filterBy === "all" 
    ? products 
    : products.filter(p => {
        const title = p.title.toLowerCase();
        if (filterBy === "Wigs") return title.includes("wig");
        if (filterBy === "Bundles") return title.includes("bundle");
        if (filterBy === "Frontals & Closures") return title.includes("frontal") || title.includes("closure");
        return true;
      });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low": return a.price - b.price;
      case "price-high": return b.price - a.price;
      case "name-asc": return a.title.localeCompare(b.title);
      case "name-desc": return b.title.localeCompare(a.title);
      default: return 0;
    }
  });

  return (
    <PageLayout>
      <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 pt-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Star className="h-4 w-4 fill-primary" />
              <span className="text-sm font-medium">Customer Favorites</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">Our Bestsellers</h1>
            <p className="text-muted-foreground text-lg">Discover our most loved products, hand-picked by our community.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {productTypes.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <PageLoadingSkeleton variant="grid" />
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-20"><p className="text-muted-foreground">No products found.</p></div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">Showing {sortedProducts.length} products</p>
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}>
                {sortedProducts.map((product) => (
                  <motion.div key={product.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default Bestsellers;

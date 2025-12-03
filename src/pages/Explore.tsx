import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CurrencyProvider, useCurrency } from "@/contexts/CurrencyContext";
import { motion } from "framer-motion";
import { Filter, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductGrid } from "@/components/ProductGrid";

const categories = [
  { id: "all", name: "All Products" },
  { id: "bundles", name: "Hair Bundles" },
  { id: "wigs", name: "Wigs" },
  { id: "frontals", name: "Frontals & Closures" },
  { id: "clip-ins", name: "Clip-ins" },
  { id: "ponytails", name: "Ponytails" },
  { id: "accessories", name: "Accessories" },
];

const hairTypes = [
  { id: "all", name: "All Types" },
  { id: "brazilian", name: "Brazilian" },
  { id: "peruvian", name: "Peruvian" },
  { id: "indian", name: "Indian" },
  { id: "malaysian", name: "Malaysian" },
];

const textures = [
  { id: "all", name: "All Textures" },
  { id: "straight", name: "Straight" },
  { id: "body-wave", name: "Body Wave" },
  { id: "deep-wave", name: "Deep Wave" },
  { id: "curly", name: "Curly" },
  { id: "kinky", name: "Kinky" },
];

const lengths = [
  { id: "all", name: "All Lengths" },
  { id: "10-14", name: "10\" - 14\"" },
  { id: "16-20", name: "16\" - 20\"" },
  { id: "22-26", name: "22\" - 26\"" },
  { id: "28+", name: "28\" +" },
];

const ExploreContent = () => {
  const { t } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedHairType, setSelectedHairType] = useState("all");
  const [selectedTexture, setSelectedTexture] = useState("all");
  const [selectedLength, setSelectedLength] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedHairType("all");
    setSelectedTexture("all");
    setSelectedLength("all");
  };

  const activeFiltersCount = [
    selectedCategory !== "all",
    selectedHairType !== "all",
    selectedTexture !== "all",
    selectedLength !== "all",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-16">
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
              Discover our curated selection of premium hair products. Filter by category, type, texture, and length to find your perfect match.
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
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <Select value={selectedHairType} onValueChange={setSelectedHairType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Hair Type" />
                </SelectTrigger>
                <SelectContent>
                  {hairTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTexture} onValueChange={setSelectedTexture}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Texture" />
                </SelectTrigger>
                <SelectContent>
                  {textures.map((texture) => (
                    <SelectItem key={texture.id} value={texture.id}>
                      {texture.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLength} onValueChange={setSelectedLength}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Length" />
                </SelectTrigger>
                <SelectContent>
                  {lengths.map((length) => (
                    <SelectItem key={length.id} value={length.id}>
                      {length.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary">
                  Clear all ({activeFiltersCount})
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="bestselling">Best Selling</SelectItem>
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
              {selectedHairType !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {hairTypes.find(t => t.id === selectedHairType)?.name}
                  <button onClick={() => setSelectedHairType("all")} className="ml-1 hover:text-primary">×</button>
                </Badge>
              )}
              {selectedTexture !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {textures.find(t => t.id === selectedTexture)?.name}
                  <button onClick={() => setSelectedTexture("all")} className="ml-1 hover:text-primary">×</button>
                </Badge>
              )}
              {selectedLength !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {lengths.find(l => l.id === selectedLength)?.name}
                  <button onClick={() => setSelectedLength("all")} className="ml-1 hover:text-primary">×</button>
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
            <ProductGrid />
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

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown } from "lucide-react";

interface ProductItem {
  name: string;
  path: string;
}

interface CategoryItem {
  name: string;
  path: string;
  productHandle?: string;
  isSubmenu?: boolean;
  products?: ProductItem[];
}

interface CollectionCardProps {
  title: string;
  image: string;
  slug: string;
}

// Category configurations per collection with specific product links
const collectionCategories: Record<string, CategoryItem[]> = {
  "vietnamese-virgin": [
    { name: "View All Products", path: "/collections/vietnamese-virgin" },
    { name: "Custom Wigs", path: "/customize" },
    { name: "Bundles", path: "/product/virgin-vietnamese-bundles", productHandle: "virgin-vietnamese-bundles" },
    { name: "Frontals", path: "https://lunaluxhair.com/product/4x4-frontal" },
    { name: "Closures", path: "https://lunaluxhair.com/product/vietnamese-closures" },
  ],
  "brazilian-virgin": [
    { name: "View All Products", path: "/collections/brazilian-virgin" },
    { name: "Custom Wigs", path: "/customize" },
    { name: "Frontals", path: "/collections/brazilian-virgin", isSubmenu: true, products: [
      { name: "13x4 Frontals", path: "/product/13x4-frontals" },
      { name: "The Jade Unit", path: "/product/the-jade-unit" },
      { name: "The Armani Unit", path: "/product/the-armani-unit" },
      { name: "The Ferina Unit", path: "/product/the-ferina-unit" },
    ]},
    { name: "Closures", path: "/collections/brazilian-virgin", isSubmenu: true, products: [
      { name: "4x4 Closures", path: "/product/4x4-closures" },
      { name: "The Jade Unit", path: "/product/the-jade-unit" },
      { name: "The Armani Unit", path: "/product/the-armani-unit" },
      { name: "The Ferina Unit", path: "/product/the-ferina-unit" },
    ]},
  ],
  "raw-vietnamese": [
    { name: "View All Products", path: "/collections/raw-vietnamese" },
    { name: "Custom Wigs", path: "/customize" },
    { name: "Bundles", path: "/product/raw-vietnamese-bundles", productHandle: "raw-vietnamese-bundles" },
    { name: "Frontals", path: "https://lunaluxhair.com/product/4x4-frontal" },
    { name: "Closures", path: "https://lunaluxhair.com/product/vietnamese-closures" },
  ],
  "premium-accessories": [
    { name: "View All Products", path: "https://lunaluxhair.com/collections/premium-accessories" },
    { name: "Hair Storage Bags", path: "/product/luna-hair-storage-bag" },
    { name: "Premium Brushes", path: "/product/luna-premium-brushes" },
  ],
};

// Default categories for collections not specifically configured
const defaultCategories: CategoryItem[] = [
  { name: "Custom Wigs", path: "custom-wigs" },
  { name: "Bundles", path: "bundles" },
  { name: "Frontals", path: "frontals" },
  { name: "Closures", path: "closures" },
];

export const CollectionCard = ({ title, image, slug }: CollectionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);

  const handleClick = () => {
    // Only toggle on click for touch devices (mobile)
    if ('ontouchstart' in window) {
      setIsExpanded(!isExpanded);
    }
  };

  // Get categories specific to this collection, or use defaults
  const categories = collectionCategories[slug] || defaultCategories;

  // Determine if the path is a direct link or a collection category path
  const getCategoryLink = (category: CategoryItem) => {
    // If path starts with "/", it's a direct link to a page or product
    if (category.path.startsWith("/")) {
      return category.path;
    }
    if (category.path.startsWith("http")) {
      return category.path;
    }
    // Otherwise, it's a relative collection category path
    return `/collection/${slug}/${category.path}`;
  };

  const toggleSubmenu = (categoryName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedSubmenu(expandedSubmenu === categoryName ? null : categoryName);
  };

  return (
    <motion.div
      className="relative h-[500px] rounded-2xl overflow-hidden group cursor-pointer border-gradient"
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => {
        setIsExpanded(false);
        setExpandedSubmenu(null);
      }}
      onClick={handleClick}
      whileHover={{ scale: 1.02, y: -8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Background Image with enhanced zoom and blur placeholder */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-115"
          style={{ 
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
          }}
        />
      </div>
      
      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/80 transition-colors duration-500" />
      
      {/* Decorative glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/20 blur-3xl" />
      </div>
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-8">
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <h3 className="text-3xl md:text-4xl font-serif text-white mb-2 tracking-wide">
                {title}
              </h3>
              <p className="text-white/80 text-sm uppercase tracking-widest">
                Explore Collection
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 max-h-[400px] overflow-y-auto"
            >
              <h3 className="text-2xl font-serif text-white mb-6 text-center">
                {title}
              </h3>
              <nav className="space-y-2">
                {categories.map((category, index) => {
                  const isExternalLink = category.path.startsWith("http");

                  return (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {category.isSubmenu && category.products ? (
                        <div>
                          <button
                            onClick={(e) => toggleSubmenu(category.name, e)}
                            className="w-full flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all"
                          >
                            <span className="text-white font-medium">
                              {category.name}
                            </span>
                            <ChevronDown 
                              className={`w-5 h-5 text-white/70 transition-transform ${
                                expandedSubmenu === category.name ? 'rotate-180' : ''
                              }`} 
                            />
                          </button>
                          <AnimatePresence>
                            {expandedSubmenu === category.name && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="ml-4 mt-1 space-y-1 overflow-hidden"
                              >
                                {category.products.map((product) => (
                                  <Link
                                    key={product.path}
                                    to={product.path}
                                    className="flex items-center justify-between p-2 bg-white/5 backdrop-blur-sm rounded-lg hover:bg-white/15 transition-all"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <span className="text-white/90 text-sm">
                                      {product.name}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-white/50" />
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        isExternalLink ? (
                          <a
                            href={getCategoryLink(category)}
                            className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all group/link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-white font-medium">
                              {category.name}
                            </span>
                            <ChevronRight className="w-5 h-5 text-white/70 group-hover/link:text-white group-hover/link:translate-x-1 transition-all" />
                          </a>
                        ) : (
                          <Link
                            to={getCategoryLink(category)}
                            className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all group/link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-white font-medium">
                              {category.name}
                            </span>
                            <ChevronRight className="w-5 h-5 text-white/70 group-hover/link:text-white group-hover/link:translate-x-1 transition-all" />
                          </Link>
                        )
                      )}
                    </motion.div>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

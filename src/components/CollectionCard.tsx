import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface CollectionCardProps {
  title: string;
  image: string;
  slug: string;
}

const categories = [
  { name: "Custom Wigs", path: "custom-wigs" },
  { name: "Bundles", path: "bundles" },
  { name: "Frontals", path: "frontals" },
  { name: "Closures", path: "closures" },
];

export const CollectionCard = ({ title, image, slug }: CollectionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="relative h-[500px] rounded-lg overflow-hidden group cursor-pointer"
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url(${image})` }}
      />
      
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
      
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
              className="space-y-4"
            >
              <h3 className="text-2xl font-serif text-white mb-6 text-center">
                {title}
              </h3>
              <nav className="space-y-3">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={`/collection/${slug}/${category.path}`}
                      className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all group/link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-white font-medium text-lg">
                        {category.name}
                      </span>
                      <ChevronRight className="w-5 h-5 text-white/70 group-hover/link:text-white group-hover/link:translate-x-1 transition-all" />
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

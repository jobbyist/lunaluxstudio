import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Play, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  cover_image_url: string | null;
  topic: string | null;
  link: string;
  isExternal: boolean;
}

export const FeaturedStories = () => {
  const { t } = useCurrency();
  
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  // Real article content
  const articles: ContentItem[] = [
    {
      id: '1',
      title: "Introducing the New LunaLuxHair",
      description: "We're thrilled to announce the official launch of our rebranded platform",
      content_type: "video",
      cover_image_url: "/lunahero.gif",
      topic: "Announcement",
      link: "/article/lunaluxhair-rebrand-launch",
      isExternal: false
    },
    {
      id: '2',
      title: "The Ultimate Guide to Wig Care",
      description: "Keep your investment looking flawless with professional tips",
      content_type: "blog",
      cover_image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
      topic: "Hair Care",
      link: "/article/ultimate-wig-care-guide",
      isExternal: false
    },
    {
      id: '3',
      title: "Choosing the Perfect Hair Texture",
      description: "Discover which texture complements your lifestyle",
      content_type: "blog",
      cover_image_url: "https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=800",
      topic: "Style Guide",
      link: "/article/choosing-perfect-hair-texture",
      isExternal: false
    },
    {
      id: '4',
      title: "Frontal vs. Closure: Which One?",
      description: "Understand the key differences to make the best choice",
      content_type: "blog",
      cover_image_url: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800",
      topic: "Education",
      link: "/article/frontal-vs-closure",
      isExternal: false
    },
    {
      id: '5',
      title: "Benefits of Protective Styling",
      description: "How extensions promote natural hair growth and health",
      content_type: "blog",
      cover_image_url: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800",
      topic: "Hair Health",
      link: "/article/protective-styling-benefits",
      isExternal: false
    }
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, articles.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  };

  const visibleContent = [
    articles[(currentIndex - 1 + articles.length) % articles.length],
    articles[currentIndex],
    articles[(currentIndex + 1) % articles.length],
  ];

  const getContentIcon = (type: string) => {
    if (type === 'video') {
      return <Play className="h-6 w-6 text-primary-foreground" />;
    }
    return <FileText className="h-4 w-4 text-primary-foreground" />;
  };

  const renderContentCard = (item: ContentItem, idx: number) => {
    const cardContent = (
      <>
        <img
          src={item.cover_image_url || ""}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <motion.div 
          className="absolute top-4 right-4"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-primary/90 rounded-full p-2">
            {getContentIcon(item.content_type)}
          </div>
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="text-xs text-primary mb-1">{item.topic}</p>
          <h3 className="font-semibold">{item.title}</h3>
          {item.description && (
            <p className="text-xs text-white/70 mt-1 line-clamp-2">{item.description}</p>
          )}
        </div>
      </>
    );

    const cardClasses = `group relative aspect-[9/16] rounded-lg overflow-hidden cursor-pointer ${
      idx === 1 
        ? 'z-10 shadow-2xl shadow-primary/20' 
        : 'opacity-50 md:opacity-70'
    }`;

    if (item.isExternal) {
      return (
        <motion.a
          key={`${item.id}-${idx}`}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className={cardClasses}
          initial={{ scale: idx === 1 ? 1 : 0.9 }}
          animate={{ 
            scale: idx === 1 ? 1.1 : 0.9,
            opacity: idx === 1 ? 1 : 0.7
          }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: idx === 1 ? 1.12 : 0.95 }}
        >
          {cardContent}
        </motion.a>
      );
    }

    return (
      <motion.div
        key={`${item.id}-${idx}`}
        className={cardClasses}
        initial={{ scale: idx === 1 ? 1 : 0.9 }}
        animate={{ 
          scale: idx === 1 ? 1.1 : 0.9,
          opacity: idx === 1 ? 1 : 0.7
        }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: idx === 1 ? 1.12 : 0.95 }}
      >
        <Link to={item.link} className="block w-full h-full">
          {cardContent}
        </Link>
      </motion.div>
    );
  };

  return (
    <motion.section
      className="py-20 bg-background overflow-hidden"
      style={{ scale }}
    >
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-serif text-center mb-12 tracking-wider"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          {t('featuredStories').toUpperCase()}
        </motion.h2>

        <motion.div 
          className="relative max-w-6xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-4 md:gap-8">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="flex-shrink-0 hover:bg-primary/10"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 max-w-5xl">
              {visibleContent.map((item, idx) => renderContentCard(item, idx))}
            </div>

            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="flex-shrink-0 hover:bg-primary/10"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </motion.div>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center mt-8 gap-2">
            {articles.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1 rounded-full transition-all ${
                  idx === currentIndex 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Go to story ${idx + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};
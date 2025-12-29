import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import tutorialBundles from "@/assets/tutorial-bundles.jpg";
import tutorialWigs from "@/assets/tutorial-wigs.jpg";
import tutorialFrontals from "@/assets/tutorial-frontals.jpg";

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  cover_image_url: string | null;
  topic: string | null;
  external_link: string | null;
  content_url: string | null;
}

const fallbackImages = [tutorialBundles, tutorialWigs, tutorialFrontals];

export const FeaturedStories = () => {
  const { t } = useCurrency();
  const sectionRef = useRef<HTMLElement>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  // Static fallback content
  const staticContent: ContentItem[] = [
    {
      id: '1',
      title: "Hair Bundle Unboxing",
      description: "See our premium hair bundles",
      content_type: "video",
      cover_image_url: tutorialBundles,
      topic: "Bundles Collection",
      external_link: "https://www.instagram.com/reel/",
      content_url: null
    },
    {
      id: '2',
      title: "Wig Installation Tutorial",
      description: "Step-by-step installation guide",
      content_type: "video",
      cover_image_url: tutorialWigs,
      topic: "Installation Guide",
      external_link: "https://www.instagram.com/reel/",
      content_url: null
    },
    {
      id: '3',
      title: "Frontal Lace Styling",
      description: "Master the perfect frontal style",
      content_type: "blog",
      cover_image_url: tutorialFrontals,
      topic: "Styling Tips",
      external_link: "https://www.instagram.com/reel/",
      content_url: null
    },
    {
      id: '4',
      title: "Customer Transformation",
      description: "Amazing before and after results",
      content_type: "image",
      cover_image_url: tutorialBundles,
      topic: "Before & After",
      external_link: "https://www.instagram.com/reel/",
      content_url: null
    },
    {
      id: '5',
      title: "Hair Care Routine",
      description: "Keep your hair looking fresh",
      content_type: "blog",
      cover_image_url: tutorialWigs,
      topic: "Maintenance Tips",
      external_link: "https://www.instagram.com/reel/",
      content_url: null
    },
    {
      id: '6',
      title: "Color Matching Guide",
      description: "Find your perfect shade",
      content_type: "blog",
      cover_image_url: tutorialFrontals,
      topic: "How To",
      external_link: "https://www.instagram.com/reel/",
      content_url: null
    },
    {
      id: '7',
      title: "Custom Wig Making",
      description: "Behind the scenes of wig creation",
      content_type: "video",
      cover_image_url: tutorialBundles,
      topic: "Behind the Scenes",
      external_link: "https://www.instagram.com/reel/",
      content_url: null
    },
    {
      id: '8',
      title: "Ponytail Install",
      description: "Quick and easy ponytail styles",
      content_type: "video",
      cover_image_url: tutorialWigs,
      topic: "Quick Style",
      external_link: "https://www.instagram.com/reel/",
      content_url: null
    },
    {
      id: '9',
      title: "Virgin Hair Quality",
      description: "Premium quality hair showcase",
      content_type: "image",
      cover_image_url: tutorialFrontals,
      topic: "Product Showcase",
      external_link: "https://www.instagram.com/reel/",
      content_url: null
    },
    {
      id: '10',
      title: "Curling Techniques",
      description: "Perfect curls every time",
      content_type: "blog",
      cover_image_url: tutorialBundles,
      topic: "Styling Tutorial",
      external_link: "https://www.instagram.com/reel/",
      content_url: null
    }
  ];

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('published_content')
          .select('id, title, description, content_type, cover_image_url, topic, external_link, content_url')
          .eq('status', 'published')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        
        // Use fetched content if available, otherwise fall back to static
        if (data && data.length > 0) {
          // Ensure each item has a cover image
          const contentWithImages = data.map((item, index) => ({
            ...item,
            cover_image_url: item.cover_image_url || fallbackImages[index % fallbackImages.length]
          }));
          setContent(contentWithImages);
        } else {
          setContent(staticContent);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        setContent(staticContent);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const displayContent = content.length > 0 ? content : staticContent;

  useEffect(() => {
    if (isPaused || displayContent.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayContent.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, displayContent.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + displayContent.length) % displayContent.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayContent.length);
  };

  const visibleContent = [
    displayContent[(currentIndex - 1 + displayContent.length) % displayContent.length],
    displayContent[currentIndex],
    displayContent[(currentIndex + 1) % displayContent.length],
  ];

  const getContentLink = (item: ContentItem) => {
    return item.external_link || item.content_url || '#';
  };

  const getContentIcon = (type: string) => {
    if (type === 'video') {
      return <Play className="h-6 w-6 text-primary-foreground" />;
    }
    return <ExternalLink className="h-4 w-4 text-primary-foreground" />;
  };

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="animate-pulse w-full max-w-6xl">
              <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-12"></div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-[9/16] bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section 
      ref={sectionRef} 
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
              {visibleContent.map((item, idx) => (
                <motion.a
                  key={`${item.id}-${idx}`}
                  href={getContentLink(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative aspect-[9/16] rounded-lg overflow-hidden cursor-pointer ${
                    idx === 1 
                      ? 'z-10 shadow-2xl shadow-primary/20' 
                      : 'opacity-50 md:opacity-70'
                  }`}
                  initial={{ scale: idx === 1 ? 1 : 0.9 }}
                  animate={{ 
                    scale: idx === 1 ? 1.1 : 0.9,
                    opacity: idx === 1 ? 1 : 0.7
                  }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: idx === 1 ? 1.12 : 0.95 }}
                >
                  <img
                    src={item.cover_image_url || fallbackImages[0]}
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
                </motion.a>
              ))}
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
            {displayContent.map((_, idx) => (
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
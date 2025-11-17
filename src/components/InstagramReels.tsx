import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import tutorialBundles from "@/assets/tutorial-bundles.jpg";
import tutorialWigs from "@/assets/tutorial-wigs.jpg";
import tutorialFrontals from "@/assets/tutorial-frontals.jpg";

export const InstagramReels = () => {
  const { t } = useCurrency();
  
  const reels = [
    {
      id: 1,
      title: "Hair Bundle Unboxing",
      image: tutorialBundles,
      topic: "Bundles Collection",
      link: "https://www.instagram.com/reel/"
    },
    {
      id: 2,
      title: "Wig Installation Tutorial",
      image: tutorialWigs,
      topic: "Installation Guide",
      link: "https://www.instagram.com/reel/"
    },
    {
      id: 3,
      title: "Frontal Lace Styling",
      image: tutorialFrontals,
      topic: "Styling Tips",
      link: "https://www.instagram.com/reel/"
    },
    {
      id: 4,
      title: "Customer Transformation",
      image: tutorialBundles,
      topic: "Before & After",
      link: "https://www.instagram.com/reel/"
    },
    {
      id: 5,
      title: "Hair Care Routine",
      image: tutorialWigs,
      topic: "Maintenance Tips",
      link: "https://www.instagram.com/reel/"
    },
    {
      id: 6,
      title: "Color Matching Guide",
      image: tutorialFrontals,
      topic: "How To",
      link: "https://www.instagram.com/reel/"
    },
    {
      id: 7,
      title: "Custom Wig Making",
      image: tutorialBundles,
      topic: "Behind the Scenes",
      link: "https://www.instagram.com/reel/"
    },
    {
      id: 8,
      title: "Ponytail Install",
      image: tutorialWigs,
      topic: "Quick Style",
      link: "https://www.instagram.com/reel/"
    },
    {
      id: 9,
      title: "Virgin Hair Quality",
      image: tutorialFrontals,
      topic: "Product Showcase",
      link: "https://www.instagram.com/reel/"
    },
    {
      id: 10,
      title: "Curling Techniques",
      image: tutorialBundles,
      topic: "Styling Tutorial",
      link: "https://www.instagram.com/reel/"
    }
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reels.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + reels.length) % reels.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reels.length);
  };

  const visibleReels = [
    reels[(currentIndex - 1 + reels.length) % reels.length],
    reels[currentIndex],
    reels[(currentIndex + 1) % reels.length],
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-serif text-center mb-12 tracking-wider">
          {t('featuredStories').toUpperCase()}
        </h2>

        <div 
          className="relative max-w-6xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex items-center justify-center gap-4 md:gap-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="flex-shrink-0 hover:bg-primary/10"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 max-w-5xl">
              {visibleReels.map((reel, idx) => (
                <a
                  key={reel.id}
                  href={reel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative aspect-[9/16] rounded-lg overflow-hidden transition-all duration-500 cursor-pointer ${
                    idx === 1 
                      ? 'scale-100 md:scale-110 z-10 shadow-2xl shadow-primary/20' 
                      : 'scale-90 opacity-50 md:opacity-70'
                  }`}
                >
                  <img
                    src={reel.image}
                    alt={reel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-primary/90 rounded-full p-2">
                      <ExternalLink className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p className="text-xs text-primary mb-1">{reel.topic}</p>
                    <h3 className="font-semibold">{reel.title}</h3>
                  </div>
                </a>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="flex-shrink-0 hover:bg-primary/10"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center mt-8 gap-2">
            {reels.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1 rounded-full transition-all ${
                  idx === currentIndex 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to reel ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

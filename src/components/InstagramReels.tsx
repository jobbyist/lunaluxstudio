import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const reels = [
  {
    id: 1,
    title: "Hair Bundle Unboxing",
    image: "/placeholder.svg",
    topic: "Bundles Collection"
  },
  {
    id: 2,
    title: "Wig Installation Tutorial",
    image: "/placeholder.svg",
    topic: "Installation Guide"
  },
  {
    id: 3,
    title: "Frontal Lace Styling",
    image: "/placeholder.svg",
    topic: "Styling Tips"
  },
  {
    id: 4,
    title: "Customer Transformation",
    image: "/placeholder.svg",
    topic: "Before & After"
  },
  {
    id: 5,
    title: "Hair Care Routine",
    image: "/placeholder.svg",
    topic: "Maintenance Tips"
  },
  {
    id: 6,
    title: "Color Matching Guide",
    image: "/placeholder.svg",
    topic: "How To"
  },
  {
    id: 7,
    title: "Custom Wig Making",
    image: "/placeholder.svg",
    topic: "Behind the Scenes"
  },
  {
    id: 8,
    title: "Ponytail Install",
    image: "/placeholder.svg",
    topic: "Quick Style"
  },
  {
    id: 9,
    title: "Virgin Hair Quality",
    image: "/placeholder.svg",
    topic: "Product Showcase"
  },
  {
    id: 10,
    title: "Curling Techniques",
    image: "/placeholder.svg",
    topic: "Styling Tutorial"
  }
];

export const InstagramReels = () => {
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
          FEATURED STORIES & <span className="text-primary">TUTORIALS</span>
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
                <div
                  key={reel.id}
                  className={`relative aspect-[9/16] rounded-lg overflow-hidden transition-all duration-500 ${
                    idx === 1 
                      ? 'scale-100 md:scale-110 z-10 shadow-2xl shadow-primary/20' 
                      : 'scale-90 opacity-50 md:opacity-70'
                  }`}
                >
                  <img
                    src={reel.image}
                    alt={reel.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p className="text-xs text-primary mb-1">{reel.topic}</p>
                    <h3 className="font-semibold">{reel.title}</h3>
                  </div>
                </div>
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

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import heroImage1 from "@/assets/hero-1.jpg";
import heroImage2 from "@/assets/hero-2.jpg";
import heroImage3 from "@/assets/hero-3.jpg";

export const Hero = () => {
  const { t } = useCurrency();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroImages = [heroImage1, heroImage2, heroImage3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images */}
      {heroImages.map((image, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: currentImageIndex === index ? 0.3 : 0,
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background/90" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Small caption */}
          <div className="space-y-4">
            <p className="text-primary text-sm md:text-base tracking-[0.3em] uppercase">
              {t('heroTagline')}
            </p>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight">
              {t('heroTitle')} <span className="text-primary">{t('heroTitleHighlight')}</span>
            </h1>
            <p className="text-2xl md:text-3xl font-serif italic text-muted-foreground">
              {t('heroSubtitle')}
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-8">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
            >
              <Link to="/shop">{t('discoverCatalog')}</Link>
            </Button>
          </div>


          {/* CTA Button */}
          <div className="pt-8">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
            >
              <Link to="/customize">{t('bookExperience')}</Link>
            </Button>
          </div>

          {/* Feature Text */}
          <div className="pt-12">
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {t('heroDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full" />
        </div>
      </div>
    </section>
  );
};

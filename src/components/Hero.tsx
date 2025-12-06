import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

export const Hero = () => {
  const { t } = useCurrency();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, []);

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-50"
        >
          <source src="https://cdn.pixabay.com/video/2023/07/19/172554-847468885_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-background/40 to-background/60" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Small caption */}
          <div className="space-y-4">
            <p className="text-primary text-sm md:text-base tracking-[0.3em] uppercase">
              {t('heroTagline')}
            </p>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-cursive tracking-tight">
              {t('heroTitle')} <span className="text-primary">{t('heroTitleHighlight')}</span>
            </h1>
            <p className="text-xl md:text-2xl font-serif italic text-muted-foreground">
              {t('heroSubtitle')}
            </p>
          </div>

              {/* CTA Buttons */}
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
            >
              <Link to="/customize">{t('bookExperience')}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg"
            >
              <Link to="/shop">{t('shopCollection')}</Link>
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

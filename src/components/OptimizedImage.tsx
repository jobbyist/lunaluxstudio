import { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
  blurHash?: string;
  aspectRatio?: string;
  sizes?: string;
  onLoad?: () => void;
}

// Generate a blurred placeholder from dominant color or use default
const generateBlurPlaceholder = (color: string = 'hsl(var(--muted))') => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/%3E%3CfeFlood flood-color='${encodeURIComponent(color)}' result='c'/%3E%3CfeComposite in='c' in2='s' operator='in'/%3E%3CfeMerge%3E%3CfeMergeNode/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3Crect width='400' height='300' filter='url(%23b)'/%3E%3C/svg%3E`;
};

// Check if WebP is supported
const supportsWebP = (() => {
  if (typeof window === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
})();

// Convert image URL to WebP if possible (for Shopify/CDN images)
const getOptimizedSrc = (src: string, width?: number): string => {
  if (!src) return src;
  
  // Handle Shopify CDN images
  if (src.includes('cdn.shopify.com')) {
    // Shopify supports automatic WebP conversion with format parameter
    const separator = src.includes('?') ? '&' : '?';
    let optimizedSrc = src;
    
    if (supportsWebP) {
      optimizedSrc += `${separator}format=webp`;
    }
    
    if (width) {
      optimizedSrc += `&width=${width}`;
    }
    
    return optimizedSrc;
  }
  
  // Handle Unsplash images
  if (src.includes('unsplash.com')) {
    const separator = src.includes('?') ? '&' : '?';
    let optimizedSrc = src;
    
    if (supportsWebP) {
      optimizedSrc += `${separator}fm=webp`;
    }
    
    if (width) {
      optimizedSrc += `&w=${width}`;
    }
    
    return optimizedSrc;
  }
  
  return src;
};

// Preload critical images
export const preloadImage = (src: string, priority: 'high' | 'low' = 'high') => {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = getOptimizedSrc(src);
  // @ts-ignore - fetchpriority is valid
  link.fetchpriority = priority;
  
  // Check if already preloaded
  const existing = document.querySelector(`link[rel="preload"][href="${link.href}"]`);
  if (!existing) {
    document.head.appendChild(link);
  }
};

export const OptimizedImage = ({
  src,
  alt,
  className,
  containerClassName,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority = 'auto',
  blurHash,
  aspectRatio,
  sizes,
  onLoad,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(loading === 'eager');
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Memoize optimized src
  const optimizedSrc = useMemo(() => getOptimizedSrc(src), [src]);
  
  // Blur placeholder
  const blurPlaceholder = useMemo(() => 
    blurHash || generateBlurPlaceholder(), 
    [blurHash]
  );

  useEffect(() => {
    if (loading === 'eager' || !containerRef.current) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before entering viewport
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [loading]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-muted',
        containerClassName
      )}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Blur placeholder background */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-700 ease-out',
          isLoaded ? 'opacity-0' : 'opacity-100'
        )}
        style={{
          backgroundImage: `url("${blurPlaceholder}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(20px)',
          transform: 'scale(1.1)', // Prevent blur edges from showing
        }}
      />
      
      {/* Shimmer effect while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 shimmer-effect" />
      )}
      
      {/* Actual image */}
      {isInView && !hasError && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          loading={loading}
          decoding={decoding}
          sizes={sizes}
          // @ts-ignore - fetchPriority is a valid HTML attribute
          fetchpriority={fetchPriority}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-all duration-700 ease-out',
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
            className
          )}
        />
      )}
      
      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground text-sm">Image unavailable</span>
        </div>
      )}
    </div>
  );
};

// Hook for preloading multiple critical images
export const useImagePreloader = (imageSrcs: string[]) => {
  useEffect(() => {
    imageSrcs.forEach((src, index) => {
      // Stagger preloads slightly to not overwhelm the browser
      setTimeout(() => {
        preloadImage(src, index === 0 ? 'high' : 'low');
      }, index * 50);
    });
  }, [imageSrcs]);
};

export default OptimizedImage;

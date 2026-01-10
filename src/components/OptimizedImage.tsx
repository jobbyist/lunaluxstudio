import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
}

export const OptimizedImage = ({
  src,
  alt,
  className,
  placeholderClassName,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority = 'auto',
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className={cn('relative overflow-hidden', className)} ref={imgRef}>
      {/* Placeholder skeleton */}
      <div
        className={cn(
          'absolute inset-0 bg-muted animate-pulse transition-opacity duration-300',
          isLoaded ? 'opacity-0' : 'opacity-100',
          placeholderClassName
        )}
      />
      
      {/* Actual image - only render src when in view for true lazy loading */}
      <img
        src={isInView ? src : undefined}
        data-src={src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        // @ts-ignore - fetchPriority is a valid HTML attribute
        fetchpriority={fetchPriority}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
};

export default OptimizedImage;

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface PageLoadingSkeletonProps {
  variant?: "default" | "product" | "grid" | "article";
}

export const PageLoadingSkeleton = ({ variant = "default" }: PageLoadingSkeletonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-[60vh] py-8"
    >
      {variant === "default" && (
        <div className="container mx-auto px-4 space-y-8">
          {/* Hero skeleton */}
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto max-w-full" />
          </div>
          
          {/* Content skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="space-y-4"
              >
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {variant === "product" && (
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image skeleton */}
            <div className="space-y-4">
              <Skeleton className="aspect-[3/4] w-full rounded-lg" />
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            </div>
            
            {/* Info skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-24 w-full" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-16 rounded-lg" />
                  ))}
                </div>
              </div>
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {variant === "grid" && (
        <div className="container mx-auto px-4 space-y-8">
          {/* Filter bar skeleton */}
          <div className="flex flex-wrap gap-4 justify-center">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-full" />
            ))}
          </div>
          
          {/* Grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="space-y-4"
              >
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {variant === "article" && (
        <div className="container mx-auto px-4 max-w-4xl space-y-8">
          {/* Article header skeleton */}
          <div className="text-center space-y-4">
            <Skeleton className="h-6 w-24 mx-auto rounded-full" />
            <Skeleton className="h-12 w-full max-w-2xl mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          
          {/* Featured image skeleton */}
          <Skeleton className="aspect-video w-full rounded-2xl" />
          
          {/* Content skeleton */}
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

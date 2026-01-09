import { useVisitorTracking } from '@/hooks/useVisitorTracking';

/**
 * Component that tracks visitor presence for real-time analytics.
 * This component renders nothing but manages visitor session tracking.
 */
export const VisitorTracker = () => {
  useVisitorTracking();
  return null;
};

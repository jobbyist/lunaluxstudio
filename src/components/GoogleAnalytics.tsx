import { useEffect } from 'react';
import { initGA, useAnalytics } from '@/hooks/useAnalytics';

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export const GoogleAnalytics = ({ measurementId }: GoogleAnalyticsProps) => {
  // Initialize GA on mount
  useEffect(() => {
    if (measurementId) {
      initGA(measurementId);
    }
  }, [measurementId]);

  // Track page views on route changes
  useAnalytics();

  return null;
};

import { useEffect, useState } from 'react';
import { initGA, useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';

/**
 * GoogleAnalytics component that fetches the Measurement ID from database
 * and initializes GA tracking automatically.
 */
export const GoogleAnalytics = () => {
  const [measurementId, setMeasurementId] = useState<string | null>(null);

  // Fetch GA ID from site settings on mount
  useEffect(() => {
    const fetchGAId = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'google_analytics_id')
          .single();

        if (!error && data?.setting_value) {
          setMeasurementId(data.setting_value);
        }
      } catch (err) {
        // Silently fail - GA is optional
        console.debug('GA ID not configured');
      }
    };

    fetchGAId();
  }, []);

  // Initialize GA when we have a valid measurement ID
  useEffect(() => {
    if (measurementId && measurementId.startsWith('G-')) {
      initGA(measurementId);
    }
  }, [measurementId]);

  // Track page views on route changes
  useAnalytics();

  return null;
};

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
        // Use a safe RPC that only returns whitelisted public settings.
        // The site_settings table itself is no longer publicly readable to avoid
        // leaking secrets that may be stored there in the future.
        const { data, error } = await supabase.rpc('get_public_site_setting', {
          key: 'google_analytics_id',
        });

        if (!error && typeof data === 'string' && data) {
          setMeasurementId(data);
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

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
  description: string | null;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) {
        console.error('Error fetching site settings:', error);
        return;
      }

      const settingsMap: Record<string, string | null> = {};
      (data as SiteSetting[])?.forEach((setting) => {
        settingsMap[setting.setting_key] = setting.setting_value;
      });

      setSettings(settingsMap);
    } catch (err) {
      console.error('Error in fetchSettings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSetting = async (key: string, value: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ setting_value: value })
        .eq('setting_key', key);

      if (error) {
        console.error('Error updating setting:', error);
        toast.error('Failed to update setting');
        return false;
      }

      setSettings((prev) => ({ ...prev, [key]: value }));
      toast.success('Setting saved successfully');
      return true;
    } catch (err) {
      console.error('Error in updateSetting:', err);
      toast.error('Failed to update setting');
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    updateSetting,
    refetch: fetchSettings,
    getGAMeasurementId: () => settings['google_analytics_id'] || '',
  };
};

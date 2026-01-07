import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NavLink {
  label: string;
  path: string;
  translationKey?: string;
  icon?: string;
  external?: boolean;
}

export interface SocialLink {
  platform: string;
  url: string;
  label: string;
}

export interface NavigationSettings {
  id: string;
  location: string;
  section: string | null;
  links: NavLink[];
  social_links: SocialLink[];
}

interface NavigationSettingsState {
  id: string;
  location: 'header' | 'footer' | 'mobile';
  section: string | null;
  links: NavLink[];
  social_links: SocialLink[];
}

export const useNavigation = () => {
  const [navigation, setNavigation] = useState<NavigationSettings[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNavigation();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('navigation-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'navigation_settings'
        },
        () => {
          fetchNavigation();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNavigation = async () => {
    try {
      const { data, error } = await supabase
        .from('navigation_settings')
        .select('*')
        .order('location');

      if (error) throw error;
      
      setNavigation(data?.map(item => ({
        id: item.id,
        location: item.location,
        section: item.section,
        links: (item.links as unknown as NavLink[]) || [],
        social_links: (item.social_links as unknown as SocialLink[]) || []
      })) || []);
    } catch (error) {
      console.error('Error fetching navigation:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHeaderNav = (section: 'main' | 'more') => {
    return navigation.find(n => n.location === 'header' && n.section === section)?.links || [];
  };

  const getFooterNav = (section: string) => {
    return navigation.find(n => n.location === 'footer' && n.section === section)?.links || [];
  };

  const getSocialLinks = () => {
    return navigation.find(n => n.location === 'footer' && n.section === 'social')?.social_links || [];
  };

  const updateNavigation = async (id: string, links: NavLink[], socialLinks?: SocialLink[]) => {
    const updateData: Record<string, unknown> = { links };
    if (socialLinks !== undefined) {
      updateData.social_links = socialLinks;
    }
    
    const { error } = await supabase
      .from('navigation_settings')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    await fetchNavigation();
  };

  return {
    navigation,
    loading,
    getHeaderNav,
    getFooterNav,
    getSocialLinks,
    updateNavigation,
    refetch: fetchNavigation
  };
};

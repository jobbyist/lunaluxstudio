import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HomepageSection {
  id: string;
  section_key: string;
  section_name: string;
  content: Record<string, string>;
  is_visible: boolean;
  display_order: number;
}

let cachedSections: HomepageSection[] | null = null;

export const useHomepageSections = () => {
  const [sections, setSections] = useState<HomepageSection[]>(cachedSections || []);
  const [loading, setLoading] = useState(!cachedSections);

  useEffect(() => {
    if (cachedSections) return;

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('homepage_sections')
          .select('*')
          .order('display_order');

        if (error) throw error;
        const typed = (data || []).map(s => ({
          ...s,
          content: s.content as Record<string, string>,
        }));
        cachedSections = typed;
        setSections(typed);
      } catch (err) {
        console.error('Failed to load homepage sections:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getSection = (key: string) => sections.find(s => s.section_key === key);
  const isVisible = (key: string) => getSection(key)?.is_visible ?? true;
  const getContent = (key: string) => getSection(key)?.content || {};

  return { sections, loading, getSection, isVisible, getContent };
};

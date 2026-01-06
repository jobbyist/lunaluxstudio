import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Define a more specific type for section content
export interface SectionContent {
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  tagline?: string;
  titleHighlight?: string;
  privacyNote?: string;
  limit?: string;
  [key: string]: string | undefined; // Allow additional string properties
}

export interface HomepageSection {
  id: string;
  section_key: string;
  section_name: string;
  content: SectionContent;
  is_visible: boolean;
  display_order: number;
}

export const useHomepageSections = (sectionKey?: string) => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [section, setSection] = useState<HomepageSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from("homepage_sections")
          .select("*")
          .eq("is_visible", true)
          .order("display_order");

        if (sectionKey) {
          query = query.eq("section_key", sectionKey).single();
          const { data, error } = await query;
          if (error) throw error;
          const typedData = data ? {
            ...data,
            content: data.content as SectionContent
          } : null;
          setSection(typedData);
        } else {
          const { data, error } = await query;
          if (error) throw error;
          const typedData = (data || []).map(section => ({
            ...section,
            content: section.content as SectionContent
          }));
          setSections(typedData);
        }
      } catch (err) {
        console.error("Error fetching homepage sections:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, [sectionKey]);

  return { sections, section, loading, error };
};

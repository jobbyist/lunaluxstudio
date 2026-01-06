import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface NavigationMenuItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  display_order: number;
  is_visible: boolean;
  parent_id?: string;
  is_mobile_only: boolean;
  is_desktop_only: boolean;
}

export const useNavigationMenu = () => {
  const [menuItems, setMenuItems] = useState<NavigationMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchNavigationMenu = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("navigation_menu")
          .select("*")
          .eq("is_visible", true)
          .order("display_order");

        if (error) throw error;
        setMenuItems(data || []);
      } catch (err) {
        console.error("Error fetching navigation menu:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchNavigationMenu();

    // Subscribe to changes
    const subscription = supabase
      .channel("navigation_menu_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "navigation_menu",
        },
        () => {
          fetchNavigationMenu();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { menuItems, loading, error };
};

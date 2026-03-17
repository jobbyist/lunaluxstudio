export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      active_visitors: {
        Row: {
          created_at: string
          id: string
          last_seen_at: string
          page_path: string | null
          session_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen_at?: string
          page_path?: string | null
          session_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_seen_at?: string
          page_path?: string | null
          session_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_activity_logs: {
        Row: {
          action_details: Json | null
          action_type: string
          created_at: string
          id: string
          ip_address: string | null
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          created_at?: string
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_emails: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      chat_rate_limits: {
        Row: {
          created_at: string
          id: string
          ip_address: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string
        }
        Relationships: []
      }
      cms_products: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          price: number
          compare_at_price: number | null
          currency: string
          sku: string | null
          inventory_quantity: number | null
          images: string[] | null
          featured_image: string | null
          status: string
          tags: string[] | null
          category: string | null
          created_at: string
          updated_at: string
          meta_title: string | null
          meta_description: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string
          price: number
          compare_at_price?: number | null
          currency?: string
          sku?: string | null
          inventory_quantity?: number | null
          images?: string[] | null
          featured_image?: string | null
          status?: string
          tags?: string[] | null
          category?: string | null
          created_at?: string
          updated_at?: string
          meta_title?: string | null
          meta_description?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string
          price?: number
          compare_at_price?: number | null
          currency?: string
          sku?: string | null
          inventory_quantity?: number | null
          images?: string[] | null
          featured_image?: string | null
          status?: string
          tags?: string[] | null
          category?: string | null
          created_at?: string
          updated_at?: string
          meta_title?: string | null
          meta_description?: string | null
        }
        Relationships: []
      }
      commerce_orders: {
        Row: {
          id: string
          order_reference: string
          customer_email: string
          customer_name: string | null
          customer_phone: string | null
          items: Json
          subtotal: number
          total: number
          currency: string
          status: string
          payment_method: string | null
          payment_reference: string | null
          shipping_address: Json | null
          notes: string | null
          created_at: string
          updated_at: string
          paid_at: string | null
        }
        Insert: {
          id?: string
          order_reference: string
          customer_email: string
          customer_name?: string | null
          customer_phone?: string | null
          items?: Json
          subtotal?: number
          total?: number
          currency?: string
          status?: string
          payment_method?: string | null
          payment_reference?: string | null
          shipping_address?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          paid_at?: string | null
        }
        Update: {
          id?: string
          order_reference?: string
          customer_email?: string
          customer_name?: string | null
          customer_phone?: string | null
          items?: Json
          subtotal?: number
          total?: number
          currency?: string
          status?: string
          payment_method?: string | null
          payment_reference?: string | null
          shipping_address?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          paid_at?: string | null
        }
        Relationships: []
      }
      custom_wig_orders: {
        Row: {
          addon_cost: number
          base_bundle: string
          base_price: number
          configuration: Json
          created_at: string
          custom_sku: string | null
          customer_email: string
          customer_name: string | null
          id: string
          notes: string | null
          order_reference: string | null
          paid_at: string | null
          payment_link_id: string | null
          payment_method: string | null
          payment_status: string | null
          processed_at: string | null
          shopify_order_id: string | null
          shopify_order_number: string | null
          status: string
          total_price: number
          updated_at: string
        }
        Insert: {
          addon_cost?: number
          base_bundle: string
          base_price: number
          configuration?: Json
          created_at?: string
          custom_sku?: string | null
          customer_email: string
          customer_name?: string | null
          id?: string
          notes?: string | null
          order_reference?: string | null
          paid_at?: string | null
          payment_link_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          processed_at?: string | null
          shopify_order_id?: string | null
          shopify_order_number?: string | null
          status?: string
          total_price: number
          updated_at?: string
        }
        Update: {
          addon_cost?: number
          base_bundle?: string
          base_price?: number
          configuration?: Json
          created_at?: string
          custom_sku?: string | null
          customer_email?: string
          customer_name?: string | null
          id?: string
          notes?: string | null
          order_reference?: string | null
          paid_at?: string | null
          payment_link_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          processed_at?: string | null
          shopify_order_id?: string | null
          shopify_order_number?: string | null
          status?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          content: Json
          created_at: string
          display_order: number
          id: string
          is_visible: boolean
          section_key: string
          section_name: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean
          section_key: string
          section_name: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean
          section_key?: string
          section_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          points: number
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points: number
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points?: number
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      navigation_settings: {
        Row: {
          created_at: string
          id: string
          links: Json
          location: string
          section: string | null
          social_links: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          links?: Json
          location: string
          section?: string | null
          social_links?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          links?: Json
          location?: string
          section?: string | null
          social_links?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          email: string
          id: string
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      product_ratings: {
        Row: {
          created_at: string
          id: string
          points_awarded: boolean | null
          product_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_awarded?: boolean | null
          product_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points_awarded?: boolean | null
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      published_content: {
        Row: {
          content_body: string | null
          content_type: string
          content_url: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          display_order: number | null
          external_link: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          seo_score: number | null
          status: string
          tags: string[] | null
          title: string
          topic: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content_body?: string | null
          content_type: string
          content_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          external_link?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          seo_score?: number | null
          status?: string
          tags?: string[] | null
          title: string
          topic?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content_body?: string | null
          content_type?: string
          content_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          external_link?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          seo_score?: number | null
          status?: string
          tags?: string[] | null
          title?: string
          topic?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          user_id: string
          uses: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          user_id: string
          uses?: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          user_id?: string
          uses?: number
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          first_purchase_at: string | null
          first_purchase_completed: boolean
          id: string
          points_awarded: boolean
          referral_code: string
          referred_user_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string
          first_purchase_at?: string | null
          first_purchase_completed?: boolean
          id?: string
          points_awarded?: boolean
          referral_code: string
          referred_user_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string
          first_purchase_at?: string | null
          first_purchase_completed?: boolean
          id?: string
          points_awarded?: boolean
          referral_code?: string
          referred_user_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_type: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          birthday: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          loyalty_points: number
          loyalty_tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          birthday?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          loyalty_points?: number
          loyalty_tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          birthday?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          loyalty_points?: number
          loyalty_tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_birthday_bonus_if_eligible: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      check_and_award_birthday_bonus: { Args: never; Returns: undefined }
      check_rating_rate_limit: {
        Args: { rating_user_id: string }
        Returns: boolean
      }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      cleanup_stale_visitors: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const

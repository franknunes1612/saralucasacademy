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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      academy_items: {
        Row: {
          badge_en: string | null
          badge_pt: string | null
          category: string
          cover_emoji: string | null
          cover_image_url: string | null
          created_at: string
          currency: string
          description_en: string | null
          description_pt: string | null
          difficulty_level: string | null
          display_order: number
          duration_label: string | null
          id: string
          instructor_name: string | null
          is_active: boolean
          is_featured: boolean
          item_type: string
          original_price: number | null
          price: number
          purchase_link: string | null
          subtitle_en: string | null
          subtitle_pt: string | null
          title_en: string
          title_pt: string
          total_duration_minutes: number | null
          total_lessons: number | null
          updated_at: string
          video_preview_url: string | null
          what_you_learn_en: string[] | null
          what_you_learn_pt: string[] | null
        }
        Insert: {
          badge_en?: string | null
          badge_pt?: string | null
          category?: string
          cover_emoji?: string | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          description_en?: string | null
          description_pt?: string | null
          difficulty_level?: string | null
          display_order?: number
          duration_label?: string | null
          id?: string
          instructor_name?: string | null
          is_active?: boolean
          is_featured?: boolean
          item_type: string
          original_price?: number | null
          price?: number
          purchase_link?: string | null
          subtitle_en?: string | null
          subtitle_pt?: string | null
          title_en: string
          title_pt: string
          total_duration_minutes?: number | null
          total_lessons?: number | null
          updated_at?: string
          video_preview_url?: string | null
          what_you_learn_en?: string[] | null
          what_you_learn_pt?: string[] | null
        }
        Update: {
          badge_en?: string | null
          badge_pt?: string | null
          category?: string
          cover_emoji?: string | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          description_en?: string | null
          description_pt?: string | null
          difficulty_level?: string | null
          display_order?: number
          duration_label?: string | null
          id?: string
          instructor_name?: string | null
          is_active?: boolean
          is_featured?: boolean
          item_type?: string
          original_price?: number | null
          price?: number
          purchase_link?: string | null
          subtitle_en?: string | null
          subtitle_pt?: string | null
          title_en?: string
          title_pt?: string
          total_duration_minutes?: number | null
          total_lessons?: number | null
          updated_at?: string
          video_preview_url?: string | null
          what_you_learn_en?: string[] | null
          what_you_learn_pt?: string[] | null
        }
        Relationships: []
      }
      cms_content: {
        Row: {
          category: string
          content_type: string
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value_en: string
          value_pt: string
        }
        Insert: {
          category?: string
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value_en?: string
          value_pt?: string
        }
        Update: {
          category?: string
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value_en?: string
          value_pt?: string
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          course_id: string
          created_at: string
          description_en: string | null
          description_pt: string | null
          display_order: number
          duration_seconds: number | null
          id: string
          is_active: boolean
          is_preview: boolean
          thumbnail_url: string | null
          title_en: string
          title_pt: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          description_en?: string | null
          description_pt?: string | null
          display_order?: number
          duration_seconds?: number | null
          id?: string
          is_active?: boolean
          is_preview?: boolean
          thumbnail_url?: string | null
          title_en: string
          title_pt: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          description_en?: string | null
          description_pt?: string | null
          display_order?: number
          duration_seconds?: number | null
          id?: string
          is_active?: boolean
          is_preview?: boolean
          thumbnail_url?: string | null
          title_en?: string
          title_pt?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_items"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_offers: {
        Row: {
          accent_color: string | null
          badge_en: string | null
          badge_pt: string | null
          billing_type: string
          created_at: string
          currency: string
          display_order: number
          features_en: string[]
          features_pt: string[]
          icon: string | null
          id: string
          is_active: boolean
          price: number
          subtitle_en: string | null
          subtitle_pt: string | null
          title_en: string
          title_pt: string
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          badge_en?: string | null
          badge_pt?: string | null
          billing_type: string
          created_at?: string
          currency?: string
          display_order?: number
          features_en?: string[]
          features_pt?: string[]
          icon?: string | null
          id?: string
          is_active?: boolean
          price: number
          subtitle_en?: string | null
          subtitle_pt?: string | null
          title_en: string
          title_pt: string
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          badge_en?: string | null
          badge_pt?: string | null
          billing_type?: string
          created_at?: string
          currency?: string
          display_order?: number
          features_en?: string[]
          features_pt?: string[]
          icon?: string | null
          id?: string
          is_active?: boolean
          price?: number
          subtitle_en?: string | null
          subtitle_pt?: string | null
          title_en?: string
          title_pt?: string
          updated_at?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          calories: number
          carbs: number
          category: string
          created_at: string
          created_by: string | null
          description_en: string | null
          description_pt: string | null
          fat: number
          id: string
          image_emoji: string | null
          image_url: string | null
          ingredients_en: string[]
          ingredients_pt: string[]
          is_active: boolean
          meal_type: string | null
          name_en: string
          name_pt: string
          portion_en: string | null
          portion_pt: string | null
          prep_time: number | null
          protein: number
          steps_en: string[]
          steps_pt: string[]
          updated_at: string
        }
        Insert: {
          calories: number
          carbs?: number
          category: string
          created_at?: string
          created_by?: string | null
          description_en?: string | null
          description_pt?: string | null
          fat?: number
          id?: string
          image_emoji?: string | null
          image_url?: string | null
          ingredients_en?: string[]
          ingredients_pt?: string[]
          is_active?: boolean
          meal_type?: string | null
          name_en: string
          name_pt: string
          portion_en?: string | null
          portion_pt?: string | null
          prep_time?: number | null
          protein?: number
          steps_en?: string[]
          steps_pt?: string[]
          updated_at?: string
        }
        Update: {
          calories?: number
          carbs?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description_en?: string | null
          description_pt?: string | null
          fat?: number
          id?: string
          image_emoji?: string | null
          image_url?: string | null
          ingredients_en?: string[]
          ingredients_pt?: string[]
          is_active?: boolean
          meal_type?: string | null
          name_en?: string
          name_pt?: string
          portion_en?: string | null
          portion_pt?: string | null
          prep_time?: number | null
          protein?: number
          steps_en?: string[]
          steps_pt?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      recommended_products: {
        Row: {
          brand: string | null
          category: string
          created_at: string
          description_en: string | null
          description_pt: string | null
          display_order: number
          external_link: string | null
          id: string
          image_emoji: string | null
          image_url: string | null
          is_active: boolean
          name_en: string
          name_pt: string
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category: string
          created_at?: string
          description_en?: string | null
          description_pt?: string | null
          display_order?: number
          external_link?: string | null
          id?: string
          image_emoji?: string | null
          image_url?: string | null
          is_active?: boolean
          name_en: string
          name_pt: string
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string
          created_at?: string
          description_en?: string | null
          description_pt?: string | null
          display_order?: number
          external_link?: string | null
          id?: string
          image_emoji?: string | null
          image_url?: string | null
          is_active?: boolean
          name_en?: string
          name_pt?: string
          updated_at?: string
        }
        Relationships: []
      }
      scan_feedback: {
        Row: {
          confidence_score: number | null
          created_at: string
          detected_make: string | null
          detected_model: string | null
          detected_vehicle_type: string | null
          detected_year: string | null
          feedback_type: string
          id: string
          image_hash: string | null
          reviewed: boolean
          scan_id: string
          spot_score: number | null
          user_correct_make: string | null
          user_correct_model: string | null
          user_suggestion: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          detected_make?: string | null
          detected_model?: string | null
          detected_vehicle_type?: string | null
          detected_year?: string | null
          feedback_type: string
          id?: string
          image_hash?: string | null
          reviewed?: boolean
          scan_id: string
          spot_score?: number | null
          user_correct_make?: string | null
          user_correct_model?: string | null
          user_suggestion?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          detected_make?: string | null
          detected_model?: string | null
          detected_vehicle_type?: string | null
          detected_year?: string | null
          feedback_type?: string
          id?: string
          image_hash?: string | null
          reviewed?: boolean
          scan_id?: string
          spot_score?: number | null
          user_correct_make?: string | null
          user_correct_model?: string | null
          user_suggestion?: string | null
        }
        Relationships: []
      }
      store_items: {
        Row: {
          brand: string | null
          category: string
          created_at: string
          currency: string
          description_en: string | null
          description_pt: string | null
          display_order: number
          id: string
          image_emoji: string | null
          image_url: string | null
          is_active: boolean
          name_en: string
          name_pt: string
          price: number
          purchase_link: string | null
          purchase_type: string
          rating: number | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category: string
          created_at?: string
          currency?: string
          description_en?: string | null
          description_pt?: string | null
          display_order?: number
          id?: string
          image_emoji?: string | null
          image_url?: string | null
          is_active?: boolean
          name_en: string
          name_pt: string
          price: number
          purchase_link?: string | null
          purchase_type?: string
          rating?: number | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string
          created_at?: string
          currency?: string
          description_en?: string | null
          description_pt?: string | null
          display_order?: number
          id?: string
          image_emoji?: string | null
          image_url?: string | null
          is_active?: boolean
          name_en?: string
          name_pt?: string
          price?: number
          purchase_link?: string | null
          purchase_type?: string
          rating?: number | null
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_admin_role: {
        Args: { _email: string; _user_id: string }
        Returns: boolean
      }
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

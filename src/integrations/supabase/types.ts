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

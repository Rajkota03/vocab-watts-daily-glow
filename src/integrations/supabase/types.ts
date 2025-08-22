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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          otp_code: string
          phone_number: string
          used: boolean
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          otp_code: string
          phone_number: string
          used?: boolean
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          otp_code?: string
          phone_number?: string
          used?: boolean
        }
        Relationships: []
      }
      outbox_messages: {
        Row: {
          created_at: string
          id: string
          phone: string
          retries: number
          send_at: string
          status: string
          template: string
          updated_at: string
          user_id: string
          variables: Json
        }
        Insert: {
          created_at?: string
          id?: string
          phone: string
          retries?: number
          send_at: string
          status?: string
          template?: string
          updated_at?: string
          user_id: string
          variables?: Json
        }
        Update: {
          created_at?: string
          id?: string
          phone?: string
          retries?: number
          send_at?: string
          status?: string
          template?: string
          updated_at?: string
          user_id?: string
          variables?: Json
        }
        Relationships: []
      }
      preview_word_requests: {
        Row: {
          created_at: string
          id: string
          phone_number: string
          word_sent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          phone_number: string
          word_sent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          phone_number?: string
          word_sent?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          nick_name: string | null
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          nick_name?: string | null
          updated_at?: string
          whatsapp_number: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          nick_name?: string | null
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      scheduled_messages: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_pro: boolean | null
          message: string | null
          phone_number: string
          scheduled_time: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_pro?: boolean | null
          message?: string | null
          phone_number: string
          scheduled_time: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_pro?: boolean | null
          message?: string | null
          phone_number?: string
          scheduled_time?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sent_words: {
        Row: {
          category: string
          id: string
          phone_number: string | null
          sent_at: string
          user_id: string | null
          word_id: string
        }
        Insert: {
          category: string
          id?: string
          phone_number?: string | null
          sent_at?: string
          user_id?: string | null
          word_id: string
        }
        Update: {
          category?: string
          id?: string
          phone_number?: string | null
          sent_at?: string
          user_id?: string | null
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sent_words_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "vocabulary_words"
            referencedColumns: ["id"]
          },
        ]
      }
      starter_words: {
        Row: {
          category: string | null
          created_at: string
          definition: string
          example: string
          id: string
          is_active: boolean | null
          memory_hook: string | null
          part_of_speech: string | null
          pronunciation: string | null
          word: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          definition: string
          example: string
          id?: string
          is_active?: boolean | null
          memory_hook?: string | null
          part_of_speech?: string | null
          pronunciation?: string | null
          word: string
        }
        Update: {
          category?: string | null
          created_at?: string
          definition?: string
          example?: string
          id?: string
          is_active?: boolean | null
          memory_hook?: string | null
          part_of_speech?: string | null
          pronunciation?: string | null
          word?: string
        }
        Relationships: []
      }
      user_custom_times: {
        Row: {
          created_at: string
          position: number
          time: string
          user_id: string
        }
        Insert: {
          created_at?: string
          position: number
          time: string
          user_id: string
        }
        Update: {
          created_at?: string
          position?: number
          time?: string
          user_id?: string
        }
        Relationships: []
      }
      user_delivery_settings: {
        Row: {
          auto_window_end: string
          auto_window_start: string
          created_at: string
          mode: string
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          timezone: string
          updated_at: string
          user_id: string
          words_per_day: number
        }
        Insert: {
          auto_window_end?: string
          auto_window_start?: string
          created_at?: string
          mode?: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string
          updated_at?: string
          user_id: string
          words_per_day?: number
        }
        Update: {
          auto_window_end?: string
          auto_window_start?: string
          created_at?: string
          mode?: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string
          updated_at?: string
          user_id?: string
          words_per_day?: number
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
          role?: Database["public"]["Enums"]["app_role"]
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
      user_subscriptions: {
        Row: {
          category: string | null
          created_at: string
          delivery_time: string | null
          email: string | null
          first_name: string | null
          id: string
          is_pro: boolean
          last_name: string | null
          last_sent_at: string | null
          last_word_sent_id: string | null
          level: string | null
          phone_number: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          subscription_ends_at: string | null
          trial_ends_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          delivery_time?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_pro?: boolean
          last_name?: string | null
          last_sent_at?: string | null
          last_word_sent_id?: string | null
          level?: string | null
          phone_number: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          subscription_ends_at?: string | null
          trial_ends_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          delivery_time?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_pro?: boolean
          last_name?: string | null
          last_sent_at?: string | null
          last_word_sent_id?: string | null
          level?: string | null
          phone_number?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          subscription_ends_at?: string | null
          trial_ends_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_word_history: {
        Row: {
          category: string
          date_sent: string
          id: string
          source: string | null
          user_id: string
          word: string
          word_id: string
        }
        Insert: {
          category: string
          date_sent?: string
          id?: string
          source?: string | null
          user_id: string
          word: string
          word_id: string
        }
        Update: {
          category?: string
          date_sent?: string
          id?: string
          source?: string | null
          user_id?: string
          word?: string
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_word_history_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "vocabulary_words"
            referencedColumns: ["id"]
          },
        ]
      }
      vocab_prompts: {
        Row: {
          category: string
          created_at: string
          difficulty_level: string | null
          id: string
          prompt: string
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          difficulty_level?: string | null
          id?: string
          prompt: string
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          difficulty_level?: string | null
          id?: string
          prompt?: string
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vocabulary_words: {
        Row: {
          category: string
          created_at: string
          definition: string
          example: string
          id: string
          memory_hook: string | null
          part_of_speech: string | null
          pronunciation: string | null
          word: string
        }
        Insert: {
          category: string
          created_at?: string
          definition: string
          example: string
          id?: string
          memory_hook?: string | null
          part_of_speech?: string | null
          pronunciation?: string | null
          word: string
        }
        Update: {
          category?: string
          created_at?: string
          definition?: string
          example?: string
          id?: string
          memory_hook?: string | null
          part_of_speech?: string | null
          pronunciation?: string | null
          word?: string
        }
        Relationships: []
      }
      whatsapp_config: {
        Row: {
          created_at: string
          display_name: string | null
          display_status: string | null
          display_status_reason: string | null
          id: string
          phone_number_id: string | null
          provider: string | null
          token: string | null
          updated_at: string
          verification_token: string | null
          waba_id: string | null
          webhook_url: string | null
          webhook_verified: boolean | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          display_status?: string | null
          display_status_reason?: string | null
          id?: string
          phone_number_id?: string | null
          provider?: string | null
          token?: string | null
          updated_at?: string
          verification_token?: string | null
          waba_id?: string | null
          webhook_url?: string | null
          webhook_verified?: boolean | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          display_status?: string | null
          display_status_reason?: string | null
          id?: string
          phone_number_id?: string | null
          provider?: string | null
          token?: string | null
          updated_at?: string
          verification_token?: string | null
          waba_id?: string | null
          webhook_url?: string | null
          webhook_verified?: boolean | null
        }
        Relationships: []
      }
      whatsapp_message_status: {
        Row: {
          created_at: string
          error_code: string | null
          error_message: string | null
          from_number: string | null
          id: string
          message_sid: string | null
          status: string
          to_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          from_number?: string | null
          id?: string
          message_sid?: string | null
          status: string
          to_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          from_number?: string | null
          id?: string
          message_sid?: string | null
          status?: string
          to_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          created_at: string
          from_number: string
          id: string
          media_url: string | null
          message: string | null
          processed: boolean | null
          provider: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_number: string
          id?: string
          media_url?: string | null
          message?: string | null
          processed?: boolean | null
          provider?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_number?: string
          id?: string
          media_url?: string | null
          message?: string | null
          processed?: boolean | null
          provider?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_otp_codes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_whatsapp_tables: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      current_user_phone_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      delete_all_vocabulary_words: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_whatsapp_message_status: {
        Args: { message_sid_param: string }
        Returns: {
          created_at: string
          error_code: string | null
          error_message: string | null
          from_number: string | null
          id: string
          message_sid: string | null
          status: string
          to_number: string
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_owns_outbox_message: {
        Args: { message_phone: string; message_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const

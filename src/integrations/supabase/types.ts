export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          id: string
          is_pro: boolean
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
          id?: string
          is_pro?: boolean
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
          id?: string
          is_pro?: boolean
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
          word: string
        }
        Insert: {
          category: string
          created_at?: string
          definition: string
          example: string
          id?: string
          word: string
        }
        Update: {
          category?: string
          created_at?: string
          definition?: string
          example?: string
          id?: string
          word?: string
        }
        Relationships: []
      }
      whatsapp_config: {
        Row: {
          created_at: string
          id: string
          provider: string | null
          updated_at: string
          verification_token: string | null
          webhook_url: string | null
          webhook_verified: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          provider?: string | null
          updated_at?: string
          verification_token?: string | null
          webhook_url?: string | null
          webhook_verified?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          provider?: string | null
          updated_at?: string
          verification_token?: string | null
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
      create_whatsapp_tables: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      current_user_phone_number: {
        Args: Record<PropertyKey, never>
        Returns: string
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
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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

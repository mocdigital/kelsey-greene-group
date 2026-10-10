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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ambassador_commissions: {
        Row: {
          amount_ngn: number
          base_ngn: number
          created_at: string
          id: string
          order_id: string
          order_reference: string
          payout_id: string | null
          percent: number
          referral_code: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_ngn?: number
          base_ngn?: number
          created_at?: string
          id?: string
          order_id: string
          order_reference?: string
          payout_id?: string | null
          percent?: number
          referral_code: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_ngn?: number
          base_ngn?: number
          created_at?: string
          id?: string
          order_id?: string
          order_reference?: string
          payout_id?: string | null
          percent?: number
          referral_code?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ambassador_payouts: {
        Row: {
          amount_ngn: number
          created_at: string
          id: string
          note: string
          period_label: string
          referral_code: string
          status: string
          user_id: string
        }
        Insert: {
          amount_ngn?: number
          created_at?: string
          id?: string
          note?: string
          period_label?: string
          referral_code: string
          status?: string
          user_id: string
        }
        Update: {
          amount_ngn?: number
          created_at?: string
          id?: string
          note?: string
          period_label?: string
          referral_code?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          details: Json
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          details?: Json
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          details?: Json
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      campaign_progress: {
        Row: {
          goal: number
          id: string
          milestones: Json
          updated_at: string
          updated_by: string | null
          verified_experiences: number
        }
        Insert: {
          goal?: number
          id: string
          milestones?: Json
          updated_at?: string
          updated_by?: string | null
          verified_experiences?: number
        }
        Update: {
          goal?: number
          id?: string
          milestones?: Json
          updated_at?: string
          updated_by?: string | null
          verified_experiences?: number
        }
        Relationships: []
      }
      campaign_progress_log: {
        Row: {
          actor: string | null
          campaign_id: string
          created_at: string
          delta: number
          id: string
          new_value: number
          note: string
          previous_value: number
        }
        Insert: {
          actor?: string | null
          campaign_id: string
          created_at?: string
          delta: number
          id?: string
          new_value: number
          note?: string
          previous_value: number
        }
        Update: {
          actor?: string | null
          campaign_id?: string
          created_at?: string
          delta?: number
          id?: string
          new_value?: number
          note?: string
          previous_value?: number
        }
        Relationships: []
      }
      cms_records: {
        Row: {
          description: string
          id: string
          kind: string
          payload: Json
          position: number
          seo_description: string
          seo_title: string
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          description?: string
          id?: string
          kind: string
          payload?: Json
          position?: number
          seo_description?: string
          seo_title?: string
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          description?: string
          id?: string
          kind?: string
          payload?: Json
          position?: number
          seo_description?: string
          seo_title?: string
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_versions: {
        Row: {
          actor: string | null
          created_at: string
          id: string
          new_record: Json | null
          old_record: Json | null
          record_id: string
        }
        Insert: {
          actor?: string | null
          created_at?: string
          id?: string
          new_record?: Json | null
          old_record?: Json | null
          record_id: string
        }
        Update: {
          actor?: string | null
          created_at?: string
          id?: string
          new_record?: Json | null
          old_record?: Json | null
          record_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_versions_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "cms_records"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiry_submissions: {
        Row: {
          business_area: string
          created_at: string
          email: string
          enquiry_type: string
          full_name: string
          id: string
          message: string
          organisation: string
          status: string
        }
        Insert: {
          business_area: string
          created_at?: string
          email: string
          enquiry_type: string
          full_name: string
          id?: string
          message: string
          organisation?: string
          status?: string
        }
        Update: {
          business_area?: string
          created_at?: string
          email?: string
          enquiry_type?: string
          full_name?: string
          id?: string
          message?: string
          organisation?: string
          status?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          cover_letter: string
          created_at: string
          email: string
          experience: string
          full_name: string
          id: string
          job_slug: string
          location: string
          phone: string
          portfolio_url: string
          status: string
        }
        Insert: {
          cover_letter?: string
          created_at?: string
          email: string
          experience?: string
          full_name: string
          id?: string
          job_slug: string
          location?: string
          phone?: string
          portfolio_url?: string
          status?: string
        }
        Update: {
          cover_letter?: string
          created_at?: string
          email?: string
          experience?: string
          full_name?: string
          id?: string
          job_slug?: string
          location?: string
          phone?: string
          portfolio_url?: string
          status?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          access_token: string
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_fee_ngn: number
          delivery_zone: string
          discount_ngn: number
          fulfillment_status: string
          id: string
          items: Json
          notes: string
          payment_method: string
          payment_reference: string | null
          payment_status: string
          promo_code: string | null
          reference: string | null
          referral_code: string | null
          shipping_address: Json
          status: string
          subtotal_ngn: number
          total_ngn: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivery_fee_ngn?: number
          delivery_zone?: string
          discount_ngn?: number
          fulfillment_status?: string
          id?: string
          items: Json
          notes?: string
          payment_method?: string
          payment_reference?: string | null
          payment_status?: string
          promo_code?: string | null
          reference?: string | null
          referral_code?: string | null
          shipping_address?: Json
          status?: string
          subtotal_ngn?: number
          total_ngn?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivery_fee_ngn?: number
          delivery_zone?: string
          discount_ngn?: number
          fulfillment_status?: string
          id?: string
          items?: Json
          notes?: string
          payment_method?: string
          payment_reference?: string | null
          payment_status?: string
          promo_code?: string | null
          reference?: string | null
          referral_code?: string | null
          shipping_address?: Json
          status?: string
          subtotal_ngn?: number
          total_ngn?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          organisation: string
          phone: string
          preferences: Json
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          organisation?: string
          phone?: string
          preferences?: Json
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          organisation?: string
          phone?: string
          preferences?: Json
        }
        Relationships: []
      }
      programme_applications: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          location: string
          message: string
          organisation: string
          phone: string
          programme: string
          referral_code: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          location?: string
          message?: string
          organisation?: string
          phone?: string
          programme: string
          referral_code?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          location?: string
          message?: string
          organisation?: string
          phone?: string
          programme?: string
          referral_code?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          active: boolean
          amount_off_ngn: number
          code: string
          created_at: string
          description: string
          expires_at: string | null
          id: string
          min_subtotal_ngn: number
          percent_off: number
        }
        Insert: {
          active?: boolean
          amount_off_ngn?: number
          code: string
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          min_subtotal_ngn?: number
          percent_off?: number
        }
        Update: {
          active?: boolean
          amount_off_ngn?: number
          code?: string
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          min_subtotal_ngn?: number
          percent_off?: number
        }
        Relationships: []
      }
      referral_visits: {
        Row: {
          created_at: string
          id: string
          path: string
          referral_code: string
        }
        Insert: {
          created_at?: string
          id?: string
          path?: string
          referral_code: string
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          referral_code?: string
        }
        Relationships: []
      }
      submission_limits: {
        Row: {
          attempts: number
          id: string
          window_start: string
        }
        Insert: {
          attempts?: number
          id: string
          window_start?: string
        }
        Update: {
          attempts?: number
          id?: string
          window_start?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          frequency: string
          id: string
          next_delivery_at: string | null
          order_id: string | null
          product_slug: string
          quantity: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          frequency: string
          id?: string
          next_delivery_at?: string | null
          order_id?: string | null
          product_slug: string
          quantity?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          frequency?: string
          id?: string
          next_delivery_at?: string | null
          order_id?: string | null
          product_slug?: string
          quantity?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      consume_submission_limit: {
        Args: { limit_key: string }
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
      app_role:
        | "admin"
        | "content_editor"
        | "publisher"
        | "commerce_manager"
        | "community_manager"
        | "super_admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: [
        "admin",
        "content_editor",
        "publisher",
        "commerce_manager",
        "community_manager",
        "super_admin",
      ],
    },
  },
} as const

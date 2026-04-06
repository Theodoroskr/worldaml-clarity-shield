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
      academy_certificates: {
        Row: {
          course_id: string
          holder_name: string
          id: string
          issued_at: string
          score: number
          share_token: string
          user_id: string
        }
        Insert: {
          course_id: string
          holder_name: string
          id?: string
          issued_at?: string
          score: number
          share_token?: string
          user_id: string
        }
        Update: {
          course_id?: string
          holder_name?: string
          id?: string
          issued_at?: string
          score?: number
          share_token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_courses: {
        Row: {
          category: string
          cpd_hours: number
          created_at: string
          description: string
          difficulty: string
          duration_minutes: number
          id: string
          image_url: string | null
          is_published: boolean
          slug: string
          sort_order: number
          title: string
        }
        Insert: {
          category?: string
          cpd_hours?: number
          created_at?: string
          description: string
          difficulty?: string
          duration_minutes?: number
          id?: string
          image_url?: string | null
          is_published?: boolean
          slug: string
          sort_order?: number
          title: string
        }
        Update: {
          category?: string
          cpd_hours?: number
          created_at?: string
          description?: string
          difficulty?: string
          duration_minutes?: number
          id?: string
          image_url?: string | null
          is_published?: boolean
          slug?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      academy_modules: {
        Row: {
          content: string
          course_id: string
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          content: string
          course_id: string
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          content?: string
          course_id?: string
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_progress: {
        Row: {
          completed_at: string | null
          completed_modules: Json
          course_id: string
          created_at: string
          id: string
          quiz_passed: boolean
          quiz_score: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_modules?: Json
          course_id: string
          created_at?: string
          id?: string
          quiz_passed?: boolean
          quiz_score?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_modules?: Json
          course_id?: string
          created_at?: string
          id?: string
          quiz_passed?: boolean
          quiz_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_questions: {
        Row: {
          correct_index: number
          course_id: string
          explanation: string | null
          id: string
          options: Json
          question: string
          sort_order: number
        }
        Insert: {
          correct_index: number
          course_id: string
          explanation?: string | null
          id?: string
          options?: Json
          question: string
          sort_order?: number
        }
        Update: {
          correct_index?: number
          course_id?: string
          explanation?: string | null
          id?: string
          options?: Json
          question?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "academy_questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_approve_domains: {
        Row: {
          created_at: string
          domain: string
          id: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          account_type: string | null
          company: string | null
          country: string | null
          created_at: string
          email: string
          first_name: string
          form_type: string
          id: string
          industry: string | null
          job_title: string | null
          last_name: string
          lead_status: string
          message: string | null
          metadata: Json | null
          phone: string | null
          products: string[] | null
          region: string | null
        }
        Insert: {
          account_type?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email: string
          first_name: string
          form_type: string
          id?: string
          industry?: string | null
          job_title?: string | null
          last_name: string
          lead_status?: string
          message?: string | null
          metadata?: Json | null
          phone?: string | null
          products?: string[] | null
          region?: string | null
        }
        Update: {
          account_type?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string
          first_name?: string
          form_type?: string
          id?: string
          industry?: string | null
          job_title?: string | null
          last_name?: string
          lead_status?: string
          message?: string | null
          metadata?: Json | null
          phone?: string | null
          products?: string[] | null
          region?: string | null
        }
        Relationships: []
      }
      partner_applications: {
        Row: {
          company_name: string
          created_at: string
          description: string | null
          id: string
          partner_type: Database["public"]["Enums"]["partner_type"]
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["partner_status"]
          user_id: string
          website: string | null
        }
        Insert: {
          company_name: string
          created_at?: string
          description?: string | null
          id?: string
          partner_type?: Database["public"]["Enums"]["partner_type"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["partner_status"]
          user_id: string
          website?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          description?: string | null
          id?: string
          partner_type?: Database["public"]["Enums"]["partner_type"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["partner_status"]
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          commission_rate: number
          created_at: string
          id: string
          is_active: boolean
          partner_type: Database["public"]["Enums"]["partner_type"]
          referral_code: string
          user_id: string
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          id?: string
          is_active?: boolean
          partner_type?: Database["public"]["Enums"]["partner_type"]
          referral_code?: string
          user_id: string
        }
        Update: {
          commission_rate?: number
          created_at?: string
          id?: string
          is_active?: boolean
          partner_type?: Database["public"]["Enums"]["partner_type"]
          referral_code?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          commission_earned: number | null
          conversion_value: number | null
          converted_at: string | null
          created_at: string
          id: string
          partner_id: string
          referral_code_used: string
          referred_email: string | null
          status: Database["public"]["Enums"]["referral_status"]
        }
        Insert: {
          commission_earned?: number | null
          conversion_value?: number | null
          converted_at?: string | null
          created_at?: string
          id?: string
          partner_id: string
          referral_code_used: string
          referred_email?: string | null
          status?: Database["public"]["Enums"]["referral_status"]
        }
        Update: {
          commission_earned?: number | null
          conversion_value?: number | null
          converted_at?: string | null
          created_at?: string
          id?: string
          partner_id?: string
          referral_code_used?: string
          referred_email?: string | null
          status?: Database["public"]["Enums"]["referral_status"]
        }
        Relationships: [
          {
            foreignKeyName: "referrals_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      sanctions_searches: {
        Row: {
          created_at: string
          id: string
          query_country: string | null
          query_name: string
          query_type: string | null
          results_count: number | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          query_country?: string | null
          query_name: string
          query_type?: string | null
          results_count?: number | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          query_country?: string | null
          query_name?: string
          query_type?: string | null
          results_count?: number | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      suite_alert_rules: {
        Row: {
          conditions: Json
          created_at: string
          id: string
          is_active: boolean
          name: string
          severity: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conditions?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          severity?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conditions?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          severity?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suite_alerts: {
        Row: {
          alert_type: string
          assigned_to: string | null
          created_at: string
          customer_id: string | null
          description: string | null
          id: string
          resolved_at: string | null
          severity: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type?: string
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          description?: string | null
          id?: string
          resolved_at?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          description?: string | null
          id?: string
          resolved_at?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_alerts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "suite_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string
        }
        Relationships: []
      }
      suite_case_notes: {
        Row: {
          case_id: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          case_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          case_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_case_notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "suite_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_cases: {
        Row: {
          alert_id: string | null
          assigned_to: string | null
          created_at: string
          customer_id: string | null
          id: string
          priority: string
          resolution: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_id?: string | null
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          priority?: string
          resolution?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_id?: string | null
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          priority?: string
          resolution?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_cases_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "suite_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_cases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "suite_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_customers: {
        Row: {
          company_name: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          id: string
          kyc_status: string
          name: string
          registration_number: string | null
          risk_level: string
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          id?: string
          kyc_status?: string
          name: string
          registration_number?: string | null
          risk_level?: string
          status?: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          id?: string
          kyc_status?: string
          name?: string
          registration_number?: string | null
          risk_level?: string
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suite_idv_sessions: {
        Row: {
          created_at: string
          customer_id: string
          document_type: string | null
          id: string
          liveness_result: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          document_type?: string | null
          id?: string
          liveness_result?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          document_type?: string | null
          id?: string
          liveness_result?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_idv_sessions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "suite_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_screenings: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          match_count: number
          result: string
          screened_at: string
          screening_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          match_count?: number
          result?: string
          screened_at?: string
          screening_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          match_count?: number
          result?: string
          screened_at?: string
          screening_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_screenings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "suite_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_transactions: {
        Row: {
          amount: number
          counterparty: string | null
          counterparty_country: string | null
          created_at: string
          currency: string
          customer_id: string
          description: string | null
          direction: string
          id: string
          risk_flag: boolean
          user_id: string
        }
        Insert: {
          amount?: number
          counterparty?: string | null
          counterparty_country?: string | null
          created_at?: string
          currency?: string
          customer_id: string
          description?: string | null
          direction?: string
          id?: string
          risk_flag?: boolean
          user_id: string
        }
        Update: {
          amount?: number
          counterparty?: string | null
          counterparty_country?: string | null
          created_at?: string
          currency?: string
          customer_id?: string
          description?: string | null
          direction?: string
          id?: string
          risk_flag?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "suite_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_ubo: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          is_verified: boolean
          name: string
          nationality: string | null
          ownership_pct: number
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          is_verified?: boolean
          name: string
          nationality?: string | null
          ownership_pct?: number
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          is_verified?: boolean
          name?: string
          nationality?: string | null
          ownership_pct?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_ubo_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "suite_customers"
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
      academy_questions_safe: {
        Row: {
          course_id: string | null
          explanation: string | null
          id: string | null
          options: Json | null
          question: string | null
          sort_order: number | null
        }
        Insert: {
          course_id?: string | null
          explanation?: string | null
          id?: string | null
          options?: Json | null
          question?: string | null
          sort_order?: number | null
        }
        Update: {
          course_id?: string | null
          explanation?: string | null
          id?: string | null
          options?: Json | null
          question?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_certificate_by_token: { Args: { _token: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      submit_quiz_and_issue_certificate: {
        Args: { _answers: Json; _course_id: string; _holder_name: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      partner_status: "pending" | "approved" | "rejected"
      partner_type: "referral" | "affiliate" | "reseller"
      referral_status: "clicked" | "signed_up" | "converted"
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
      partner_status: ["pending", "approved", "rejected"],
      partner_type: ["referral", "affiliate", "reseller"],
      referral_status: ["clicked", "signed_up", "converted"],
    },
  },
} as const

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
      academy_course_purchases: {
        Row: {
          amount_cents: number
          course_slug: string
          created_at: string
          currency: string
          expires_at: string | null
          id: string
          paid_at: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          course_slug: string
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          course_slug?: string
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      academy_courses: {
        Row: {
          category: string
          cpd_hours: number
          created_at: string
          description: string
          difficulty: string
          duration_minutes: number
          estimated_words: number
          id: string
          image_url: string | null
          is_published: boolean
          learning_outcomes: string[]
          price_eur_cents: number
          role_track: string
          slug: string
          sort_order: number
          stripe_price_id: string | null
          stripe_product_id: string | null
          title: string
        }
        Insert: {
          category?: string
          cpd_hours?: number
          created_at?: string
          description: string
          difficulty?: string
          duration_minutes?: number
          estimated_words?: number
          id?: string
          image_url?: string | null
          is_published?: boolean
          learning_outcomes?: string[]
          price_eur_cents?: number
          role_track?: string
          slug: string
          sort_order?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          title: string
        }
        Update: {
          category?: string
          cpd_hours?: number
          created_at?: string
          description?: string
          difficulty?: string
          duration_minutes?: number
          estimated_words?: number
          id?: string
          image_url?: string | null
          is_published?: boolean
          learning_outcomes?: string[]
          price_eur_cents?: number
          role_track?: string
          slug?: string
          sort_order?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
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
      academy_pro_certificates: {
        Row: {
          amount_cents: number
          certificate_id: string
          created_at: string
          currency: string
          id: string
          paid_at: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number
          certificate_id: string
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          certificate_id?: string
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_pro_certificates_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "academy_certificates"
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
      academy_reminders_sent: {
        Row: {
          course_id: string
          id: string
          reminder_number: number
          sent_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          id?: string
          reminder_number?: number
          sent_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          id?: string
          reminder_number?: number
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_reminders_sent_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_templates: {
        Row: {
          category: string
          created_at: string
          description: string
          file_format: string
          file_size_kb: number | null
          file_url: string
          id: string
          is_published: boolean
          jurisdictions: string[]
          preview_url: string | null
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          file_format?: string
          file_size_kb?: number | null
          file_url: string
          id?: string
          is_published?: boolean
          jurisdictions?: string[]
          preview_url?: string | null
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          file_format?: string
          file_size_kb?: number | null
          file_url?: string
          id?: string
          is_published?: boolean
          jurisdictions?: string[]
          preview_url?: string | null
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_form_submissions: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          reviewed_by: string | null
          status: string
          submitted_data: Json
          template_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          reviewed_by?: string | null
          status?: string
          submitted_data?: Json
          template_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          reviewed_by?: string | null
          status?: string
          submitted_data?: Json
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_form_submissions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "suite_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_form_submissions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "admin_form_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_form_templates: {
        Row: {
          created_at: string
          created_by: string
          fields: Json
          form_type: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          fields?: Json
          form_type?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          fields?: Json
          form_type?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_subscription_tiers: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          max_api_requests_per_day: number
          max_customers: number
          max_screenings_per_month: number
          monthly_price_cents: number
          name: string
          sort_order: number
          stripe_price_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_api_requests_per_day?: number
          max_customers?: number
          max_screenings_per_month?: number
          monthly_price_cents?: number
          name: string
          sort_order?: number
          stripe_price_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_api_requests_per_day?: number
          max_customers?: number
          max_screenings_per_month?: number
          monthly_price_cents?: number
          name?: string
          sort_order?: number
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      admin_user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_subscription_id: string | null
          tier_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_subscription_id?: string | null
          tier_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_subscription_id?: string | null
          tier_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_user_subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "admin_subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_workflow_executions: {
        Row: {
          completed_at: string | null
          entity_id: string | null
          entity_type: string
          execution_log: Json
          id: string
          started_at: string
          status: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          entity_id?: string | null
          entity_type: string
          execution_log?: Json
          id?: string
          started_at?: string
          status?: string
          user_id: string
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          entity_id?: string | null
          entity_type?: string
          execution_log?: Json
          id?: string
          started_at?: string
          status?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "admin_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_workflows: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          edges: Json
          id: string
          is_active: boolean
          name: string
          nodes: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          edges?: Json
          id?: string
          is_active?: boolean
          name: string
          nodes?: Json
          trigger_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          edges?: Json
          id?: string
          is_active?: boolean
          name?: string
          nodes?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
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
      fatf_country_risk: {
        Row: {
          country_code: string
          risk_category: string
          updated_at: string
        }
        Insert: {
          country_code: string
          risk_category: string
          updated_at?: string
        }
        Update: {
          country_code?: string
          risk_category?: string
          updated_at?: string
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
      periodic_reports: {
        Row: {
          completed_at: string | null
          content: Json
          created_at: string
          filed_at: string | null
          filing_status: string
          id: string
          notes: string | null
          organisation_id: string | null
          period_year: number
          regulator: string
          report_title: string
          report_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          content?: Json
          created_at?: string
          filed_at?: string | null
          filing_status?: string
          id?: string
          notes?: string | null
          organisation_id?: string | null
          period_year?: number
          regulator: string
          report_title: string
          report_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          content?: Json
          created_at?: string
          filed_at?: string | null
          filing_status?: string
          id?: string
          notes?: string | null
          organisation_id?: string | null
          period_year?: number
          regulator?: string
          report_title?: string
          report_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "periodic_reports_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          regulator: string | null
          status: string
          subscription_tier: string
          suite_access_granted_at: string | null
          suite_access_granted_by: string | null
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
          regulator?: string | null
          status?: string
          subscription_tier?: string
          suite_access_granted_at?: string | null
          suite_access_granted_by?: string | null
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
          regulator?: string | null
          status?: string
          subscription_tier?: string
          suite_access_granted_at?: string | null
          suite_access_granted_by?: string | null
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
      signup_followups_sent: {
        Row: {
          email: string
          error_message: string | null
          id: string
          resend_message_id: string | null
          sent_at: string
          status: string
          user_id: string
        }
        Insert: {
          email: string
          error_message?: string | null
          id?: string
          resend_message_id?: string | null
          sent_at?: string
          status?: string
          user_id: string
        }
        Update: {
          email?: string
          error_message?: string | null
          id?: string
          resend_message_id?: string | null
          sent_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      str_report_transactions: {
        Row: {
          created_at: string
          id: string
          report_id: string
          transaction_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          report_id: string
          transaction_id: string
        }
        Update: {
          created_at?: string
          id?: string
          report_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "str_report_transactions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "str_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "str_report_transactions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "suite_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      str_reports: {
        Row: {
          action_taken: string | null
          camlo_name: string | null
          case_id: string | null
          created_at: string
          customer_id: string | null
          filed_at: string | null
          filing_status: string
          grounds_for_suspicion: string | null
          id: string
          organisation_id: string | null
          report_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_taken?: string | null
          camlo_name?: string | null
          case_id?: string | null
          created_at?: string
          customer_id?: string | null
          filed_at?: string | null
          filing_status?: string
          grounds_for_suspicion?: string | null
          id?: string
          organisation_id?: string | null
          report_number?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_taken?: string | null
          camlo_name?: string | null
          case_id?: string | null
          created_at?: string
          customer_id?: string | null
          filed_at?: string | null
          filing_status?: string
          grounds_for_suspicion?: string | null
          id?: string
          organisation_id?: string | null
          report_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "str_reports_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "suite_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "str_reports_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "suite_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "str_reports_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_alert_rules: {
        Row: {
          conditions: Json
          created_at: string
          id: string
          is_active: boolean
          name: string
          organisation_id: string | null
          severity: string
          source_citation: string | null
          source_regulator: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conditions?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          organisation_id?: string | null
          severity?: string
          source_citation?: string | null
          source_regulator?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conditions?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          organisation_id?: string | null
          severity?: string
          source_citation?: string | null
          source_regulator?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_alert_rules_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_alerts: {
        Row: {
          alert_type: string
          assigned_to: string | null
          created_at: string
          customer_id: string | null
          description: string | null
          id: string
          organisation_id: string | null
          resolved_at: string | null
          rule_id: string | null
          severity: string
          status: string
          title: string
          transaction_id: string | null
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
          organisation_id?: string | null
          resolved_at?: string | null
          rule_id?: string | null
          severity?: string
          status?: string
          title: string
          transaction_id?: string | null
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
          organisation_id?: string | null
          resolved_at?: string | null
          rule_id?: string | null
          severity?: string
          status?: string
          title?: string
          transaction_id?: string | null
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
          {
            foreignKeyName: "suite_alerts_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
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
          organisation_id: string | null
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
          organisation_id?: string | null
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
          organisation_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_audit_log_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_case_notes: {
        Row: {
          case_id: string
          content: string
          created_at: string
          id: string
          organisation_id: string | null
          user_id: string
        }
        Insert: {
          case_id: string
          content: string
          created_at?: string
          id?: string
          organisation_id?: string | null
          user_id: string
        }
        Update: {
          case_id?: string
          content?: string
          created_at?: string
          id?: string
          organisation_id?: string | null
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
          {
            foreignKeyName: "suite_case_notes_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
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
          organisation_id: string | null
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
          organisation_id?: string | null
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
          organisation_id?: string | null
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
          {
            foreignKeyName: "suite_cases_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
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
          organisation_id: string | null
          pep_status: string | null
          registration_number: string | null
          regulator: string | null
          risk_level: string
          risk_score: number
          risk_score_factors: Json
          risk_score_version: number
          risk_scored_at: string | null
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
          organisation_id?: string | null
          pep_status?: string | null
          registration_number?: string | null
          regulator?: string | null
          risk_level?: string
          risk_score?: number
          risk_score_factors?: Json
          risk_score_version?: number
          risk_scored_at?: string | null
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
          organisation_id?: string | null
          pep_status?: string | null
          registration_number?: string | null
          regulator?: string | null
          risk_level?: string
          risk_score?: number
          risk_score_factors?: Json
          risk_score_version?: number
          risk_scored_at?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_customers_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_idv_sessions: {
        Row: {
          created_at: string
          customer_id: string
          document_type: string | null
          id: string
          liveness_result: string | null
          organisation_id: string | null
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
          organisation_id?: string | null
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
          organisation_id?: string | null
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
          {
            foreignKeyName: "suite_idv_sessions_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_org_members: {
        Row: {
          created_at: string
          id: string
          invited_email: string | null
          joined_at: string | null
          organization_id: string
          role: Database["public"]["Enums"]["org_member_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_email?: string | null
          joined_at?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["org_member_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_email?: string | null
          joined_at?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["org_member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_org_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_organizations: {
        Row: {
          address: string | null
          country: string | null
          created_at: string
          created_by: string | null
          id: string
          industry: string | null
          max_api_requests_per_day: number
          max_screenings_per_month: number
          max_users: number
          name: string
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          registration_number: string | null
          regulator: string | null
          status: string
          subscription_tier: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          industry?: string | null
          max_api_requests_per_day?: number
          max_screenings_per_month?: number
          max_users?: number
          name: string
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          registration_number?: string | null
          regulator?: string | null
          status?: string
          subscription_tier?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          industry?: string | null
          max_api_requests_per_day?: number
          max_screenings_per_month?: number
          max_users?: number
          name?: string
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          registration_number?: string | null
          regulator?: string | null
          status?: string
          subscription_tier?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      suite_screenings: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          match_count: number
          organisation_id: string | null
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
          organisation_id?: string | null
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
          organisation_id?: string | null
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
          {
            foreignKeyName: "suite_screenings_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_sof_audit_events: {
        Row: {
          actor_user_id: string | null
          created_at: string
          declaration_id: string
          details: Json
          event_type: string
          id: string
          organisation_id: string | null
          summary: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          declaration_id: string
          details?: Json
          event_type: string
          id?: string
          organisation_id?: string | null
          summary: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          declaration_id?: string
          details?: Json
          event_type?: string
          id?: string
          organisation_id?: string | null
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_sof_audit_events_declaration_id_fkey"
            columns: ["declaration_id"]
            isOneToOne: false
            referencedRelation: "suite_sof_declarations"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_sof_declarations: {
        Row: {
          ai_reconciliation: Json | null
          ai_risk_flag: boolean
          created_at: string
          currency: string
          customer_id: string
          declared_annual_income: number | null
          declared_total_wealth: number | null
          expires_at: string | null
          id: string
          income_sources: Json
          organisation_id: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          reviewer_notes: string | null
          source_country: string | null
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
          wealth_sources: Json
        }
        Insert: {
          ai_reconciliation?: Json | null
          ai_risk_flag?: boolean
          created_at?: string
          currency?: string
          customer_id: string
          declared_annual_income?: number | null
          declared_total_wealth?: number | null
          expires_at?: string | null
          id?: string
          income_sources?: Json
          organisation_id?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          source_country?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
          wealth_sources?: Json
        }
        Update: {
          ai_reconciliation?: Json | null
          ai_risk_flag?: boolean
          created_at?: string
          currency?: string
          customer_id?: string
          declared_annual_income?: number | null
          declared_total_wealth?: number | null
          expires_at?: string | null
          id?: string
          income_sources?: Json
          organisation_id?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          source_country?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
          wealth_sources?: Json
        }
        Relationships: [
          {
            foreignKeyName: "suite_sof_declarations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "suite_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_sof_declarations_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_sof_documents: {
        Row: {
          created_at: string
          declaration_id: string
          document_type: string
          file_name: string
          file_path: string
          file_size_bytes: number | null
          id: string
          metadata: Json | null
          mime_type: string | null
          organisation_id: string | null
          updated_at: string
          user_id: string
          verification_status: string
          verified_at: string | null
          verifier_id: string | null
          verifier_notes: string | null
        }
        Insert: {
          created_at?: string
          declaration_id: string
          document_type: string
          file_name: string
          file_path: string
          file_size_bytes?: number | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          organisation_id?: string | null
          updated_at?: string
          user_id: string
          verification_status?: string
          verified_at?: string | null
          verifier_id?: string | null
          verifier_notes?: string | null
        }
        Update: {
          created_at?: string
          declaration_id?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size_bytes?: number | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          organisation_id?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: string
          verified_at?: string | null
          verifier_id?: string | null
          verifier_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suite_sof_documents_declaration_id_fkey"
            columns: ["declaration_id"]
            isOneToOne: false
            referencedRelation: "suite_sof_declarations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_sof_documents_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_transactions: {
        Row: {
          amount: number
          beneficiary_name: string | null
          conductor_name: string | null
          counterparty: string | null
          counterparty_country: string | null
          created_at: string
          currency: string
          customer_id: string
          description: string | null
          direction: string
          disposition: string | null
          id: string
          method_of_transaction: string | null
          monitoring_status: string
          organisation_id: string | null
          risk_flag: boolean
          source_of_funds: string | null
          third_party_indicator: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          beneficiary_name?: string | null
          conductor_name?: string | null
          counterparty?: string | null
          counterparty_country?: string | null
          created_at?: string
          currency?: string
          customer_id: string
          description?: string | null
          direction?: string
          disposition?: string | null
          id?: string
          method_of_transaction?: string | null
          monitoring_status?: string
          organisation_id?: string | null
          risk_flag?: boolean
          source_of_funds?: string | null
          third_party_indicator?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          beneficiary_name?: string | null
          conductor_name?: string | null
          counterparty?: string | null
          counterparty_country?: string | null
          created_at?: string
          currency?: string
          customer_id?: string
          description?: string | null
          direction?: string
          disposition?: string | null
          id?: string
          method_of_transaction?: string | null
          monitoring_status?: string
          organisation_id?: string | null
          risk_flag?: boolean
          source_of_funds?: string | null
          third_party_indicator?: string | null
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
          {
            foreignKeyName: "suite_transactions_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
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
          organisation_id: string | null
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
          organisation_id?: string | null
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
          organisation_id?: string | null
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
          {
            foreignKeyName: "suite_ubo_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
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
      suite_access: {
        Row: {
          email: string | null
          has_suite_access: boolean | null
          subscription_tier: string | null
          user_id: string | null
        }
        Insert: {
          email?: string | null
          has_suite_access?: never
          subscription_tier?: string | null
          user_id?: string | null
        }
        Update: {
          email?: string | null
          has_suite_access?: never
          subscription_tier?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      academy_course_question_counts: {
        Args: never
        Returns: {
          question_count: number
          slug: string
        }[]
      }
      academy_question_bank_audit: {
        Args: never
        Returns: {
          correct_index: number
          correct_option: string
          options_length: number
          slug: string
          sort_order: number
        }[]
      }
      admin_grant_suite_access:
        | { Args: { target_email: string }; Returns: undefined }
        | {
            Args: { target_email: string; target_regulator?: string }
            Returns: undefined
          }
      admin_revoke_suite_access: {
        Args: { target_email: string }
        Returns: undefined
      }
      calculate_customer_risk_score: {
        Args: { p_customer_id: string }
        Returns: Json
      }
      current_user_has_suite_access: { Args: never; Returns: boolean }
      current_user_org_id: { Args: never; Returns: string }
      get_certificate_by_token: { Args: { _token: string }; Returns: Json }
      get_user_org_ids: { Args: { _user_id: string }; Returns: string[] }
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
      org_member_role:
        | "admin"
        | "mlro"
        | "compliance_officer"
        | "analyst"
        | "viewer"
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
      org_member_role: [
        "admin",
        "mlro",
        "compliance_officer",
        "analyst",
        "viewer",
      ],
      partner_status: ["pending", "approved", "rejected"],
      partner_type: ["referral", "affiliate", "reseller"],
      referral_status: ["clicked", "signed_up", "converted"],
    },
  },
} as const

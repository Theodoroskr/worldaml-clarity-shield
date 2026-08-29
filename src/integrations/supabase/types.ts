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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      academy_badges: {
        Row: {
          category: string | null
          course_slugs: string[]
          created_at: string
          description: string | null
          icon: string
          id: string
          is_active: boolean
          key: string
          name: string
          required_count: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          course_slugs?: string[]
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          key: string
          name: string
          required_count?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          course_slugs?: string[]
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          key?: string
          name?: string
          required_count?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      academy_basket_snapshots: {
        Row: {
          currency: string
          email: string | null
          full_name: string | null
          items: string[]
          reminder_30d_sent_at: string | null
          reminder_3d_sent_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          currency?: string
          email?: string | null
          full_name?: string | null
          items?: string[]
          reminder_30d_sent_at?: string | null
          reminder_3d_sent_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          currency?: string
          email?: string | null
          full_name?: string | null
          items?: string[]
          reminder_30d_sent_at?: string | null
          reminder_3d_sent_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
          recovery_email_24h_sent_at: string | null
          recovery_email_sent_at: string | null
          refund_amount_cents: number
          refunded_at: string | null
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
          recovery_email_24h_sent_at?: string | null
          recovery_email_sent_at?: string | null
          refund_amount_cents?: number
          refunded_at?: string | null
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
          recovery_email_24h_sent_at?: string | null
          recovery_email_sent_at?: string | null
          refund_amount_cents?: number
          refunded_at?: string | null
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
      academy_pending_grants: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          grant_kind: string
          granted_at: string | null
          granted_user_id: string | null
          id: string
          note: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          grant_kind?: string
          granted_at?: string | null
          granted_user_id?: string | null
          id?: string
          note?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          grant_kind?: string
          granted_at?: string | null
          granted_user_id?: string | null
          id?: string
          note?: string | null
          updated_at?: string
        }
        Relationships: []
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
      academy_recognition_levels: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          is_active: boolean
          key: string
          min_advanced_courses: number
          min_categories: number
          min_certificates: number
          min_courses: number
          name: string
          rank: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          key: string
          min_advanced_courses?: number
          min_categories?: number
          min_certificates?: number
          min_courses?: number
          name: string
          rank: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          key?: string
          min_advanced_courses?: number
          min_categories?: number
          min_certificates?: number
          min_courses?: number
          name?: string
          rank?: number
          updated_at?: string
        }
        Relationships: []
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
      admin_access_audit: {
        Row: {
          action: string
          created_at: string
          detail: string | null
          id: string
          new_value: string | null
          performed_by: string | null
          performed_by_email: string | null
          previous_value: string | null
          target_email: string
        }
        Insert: {
          action: string
          created_at?: string
          detail?: string | null
          id?: string
          new_value?: string | null
          performed_by?: string | null
          performed_by_email?: string | null
          previous_value?: string | null
          target_email: string
        }
        Update: {
          action?: string
          created_at?: string
          detail?: string | null
          id?: string
          new_value?: string | null
          performed_by?: string | null
          performed_by_email?: string | null
          previous_value?: string | null
          target_email?: string
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
      admin_invites: {
        Row: {
          accepted_at: string | null
          accepted_user_id: string | null
          access_role: string
          created_at: string
          department: string | null
          email: string
          id: string
          invited_by: string | null
          note: string | null
          revoked_at: string | null
          suspended_at: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_user_id?: string | null
          access_role?: string
          created_at?: string
          department?: string | null
          email: string
          id?: string
          invited_by?: string | null
          note?: string | null
          revoked_at?: string | null
          suspended_at?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_user_id?: string | null
          access_role?: string
          created_at?: string
          department?: string | null
          email?: string
          id?: string
          invited_by?: string | null
          note?: string | null
          revoked_at?: string | null
          suspended_at?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      admin_notification_email_log: {
        Row: {
          created_at: string
          error: string | null
          id: string
          notification_id: string | null
          recipient: string
          status: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          notification_id?: string | null
          recipient: string
          status?: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          notification_id?: string | null
          recipient?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notification_email_log_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "admin_notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notification_prefs: {
        Row: {
          email: boolean
          event_type: string
          in_app: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          email?: boolean
          event_type: string
          in_app?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          email?: boolean
          event_type?: string
          in_app?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_notification_state: {
        Row: {
          admin_id: string
          ignored_at: string | null
          notification_id: string
          read_at: string | null
          snoozed_until: string | null
          updated_at: string
        }
        Insert: {
          admin_id: string
          ignored_at?: string | null
          notification_id: string
          read_at?: string | null
          snoozed_until?: string | null
          updated_at?: string
        }
        Update: {
          admin_id?: string
          ignored_at?: string | null
          notification_id?: string
          read_at?: string | null
          snoozed_until?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notification_state_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "admin_notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notifications: {
        Row: {
          action_url: string | null
          category: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          message: string | null
          metadata: Json
          nav_path: string | null
          priority: string
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          title: string
        }
        Insert: {
          action_url?: string | null
          category: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          message?: string | null
          metadata?: Json
          nav_path?: string | null
          priority?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title: string
        }
        Update: {
          action_url?: string | null
          category?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          message?: string | null
          metadata?: Json
          nav_path?: string | null
          priority?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      admin_report_runs: {
        Row: {
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          period_end: string | null
          period_start: string | null
          recipients: string[]
          report_id: string | null
          report_name: string
          report_type: string
          status: string
          summary: Json | null
          trigger_type: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          recipients?: string[]
          report_id?: string | null
          report_name: string
          report_type: string
          status?: string
          summary?: Json | null
          trigger_type?: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          recipients?: string[]
          report_id?: string | null
          report_name?: string
          report_type?: string
          status?: string
          summary?: Json | null
          trigger_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_report_runs_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "admin_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_reports: {
        Row: {
          created_at: string
          created_by: string | null
          day_of_month: number | null
          day_of_week: number | null
          description: string | null
          format: string
          frequency: string
          id: string
          is_active: boolean
          last_run_at: string | null
          last_test_at: string | null
          name: string
          portal_filter: string
          range_key: string
          recipients: string[]
          report_type: string
          send_hour_utc: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          description?: string | null
          format?: string
          frequency?: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          last_test_at?: string | null
          name: string
          portal_filter?: string
          range_key?: string
          recipients?: string[]
          report_type?: string
          send_hour_utc?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          description?: string | null
          format?: string
          frequency?: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          last_test_at?: string | null
          name?: string
          portal_filter?: string
          range_key?: string
          recipients?: string[]
          report_type?: string
          send_hour_utc?: number
          updated_at?: string
          updated_by?: string | null
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
      admin_upsell_email_log: {
        Row: {
          created_at: string
          id: string
          recipient_email: string
          recipient_user_id: string | null
          sent_by: string | null
          template_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_email: string
          recipient_user_id?: string | null
          sent_by?: string | null
          template_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_email?: string
          recipient_user_id?: string | null
          sent_by?: string | null
          template_id?: string
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
      adverse_media_items: {
        Row: {
          case_id: string | null
          created_at: string
          headline: string
          id: string
          internal_source_url: string | null
          match_id: string | null
          media_category: string | null
          organisation_id: string
          publication: string | null
          published_at: string | null
          relevant_subject: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          snippet: string | null
          status: Database["public"]["Enums"]["adverse_media_status"]
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          headline: string
          id?: string
          internal_source_url?: string | null
          match_id?: string | null
          media_category?: string | null
          organisation_id: string
          publication?: string | null
          published_at?: string | null
          relevant_subject?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          snippet?: string | null
          status?: Database["public"]["Enums"]["adverse_media_status"]
        }
        Update: {
          case_id?: string | null
          created_at?: string
          headline?: string
          id?: string
          internal_source_url?: string | null
          match_id?: string | null
          media_category?: string | null
          organisation_id?: string
          publication?: string | null
          published_at?: string | null
          relevant_subject?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          snippet?: string | null
          status?: Database["public"]["Enums"]["adverse_media_status"]
        }
        Relationships: [
          {
            foreignKeyName: "adverse_media_items_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "screening_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adverse_media_items_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "screening_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      analyst_decisions: {
        Row: {
          case_id: string
          comment: string | null
          decided_at: string
          decided_by: string | null
          decision: Database["public"]["Enums"]["analyst_decision_kind"]
          id: string
          match_id: string | null
          organisation_id: string
          reason_code: string | null
          reason_label: string | null
        }
        Insert: {
          case_id: string
          comment?: string | null
          decided_at?: string
          decided_by?: string | null
          decision: Database["public"]["Enums"]["analyst_decision_kind"]
          id?: string
          match_id?: string | null
          organisation_id: string
          reason_code?: string | null
          reason_label?: string | null
        }
        Update: {
          case_id?: string
          comment?: string | null
          decided_at?: string
          decided_by?: string | null
          decision?: Database["public"]["Enums"]["analyst_decision_kind"]
          id?: string
          match_id?: string | null
          organisation_id?: string
          reason_code?: string | null
          reason_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analyst_decisions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "screening_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analyst_decisions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "screening_matches"
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
      business_accounts: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          company_name: string
          company_size: string | null
          contact_name: string | null
          country: string | null
          created_at: string
          id: string
          industry: string | null
          phone: string | null
          postal_code: string | null
          products_of_interest: string[]
          registration_number: string | null
          status: string
          updated_at: string
          user_id: string
          vat_number: string | null
          website: string | null
          work_email: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company_name: string
          company_size?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          phone?: string | null
          postal_code?: string | null
          products_of_interest?: string[]
          registration_number?: string | null
          status?: string
          updated_at?: string
          user_id: string
          vat_number?: string | null
          website?: string | null
          work_email: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company_name?: string
          company_size?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          phone?: string | null
          postal_code?: string | null
          products_of_interest?: string[]
          registration_number?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          vat_number?: string | null
          website?: string | null
          work_email?: string
        }
        Relationships: []
      }
      business_entitlements: {
        Row: {
          activated_at: string | null
          business_account_id: string
          created_at: string
          id: string
          plan: string | null
          product_key: string
          renews_at: string | null
          seats: number | null
          setup_complete: boolean
          status: string
          stripe_subscription_id: string | null
          updated_at: string
          usage_limit: number | null
          usage_unit: string | null
          usage_used: number | null
        }
        Insert: {
          activated_at?: string | null
          business_account_id: string
          created_at?: string
          id?: string
          plan?: string | null
          product_key: string
          renews_at?: string | null
          seats?: number | null
          setup_complete?: boolean
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          usage_limit?: number | null
          usage_unit?: string | null
          usage_used?: number | null
        }
        Update: {
          activated_at?: string | null
          business_account_id?: string
          created_at?: string
          id?: string
          plan?: string | null
          product_key?: string
          renews_at?: string | null
          seats?: number | null
          setup_complete?: boolean
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          usage_limit?: number | null
          usage_unit?: string | null
          usage_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_entitlements_business_account_id_fkey"
            columns: ["business_account_id"]
            isOneToOne: false
            referencedRelation: "business_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      business_events: {
        Row: {
          business_account_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json
          product_key: string | null
          user_id: string | null
        }
        Insert: {
          business_account_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          product_key?: string | null
          user_id?: string | null
        }
        Update: {
          business_account_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          product_key?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_events_business_account_id_fkey"
            columns: ["business_account_id"]
            isOneToOne: false
            referencedRelation: "business_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      business_members: {
        Row: {
          academy_seat: boolean
          business_account_id: string
          created_at: string
          email: string
          full_name: string | null
          id: string
          invited_by: string | null
          job_title: string | null
          products: string[]
          role: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          academy_seat?: boolean
          business_account_id: string
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          invited_by?: string | null
          job_title?: string | null
          products?: string[]
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          academy_seat?: boolean
          business_account_id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          invited_by?: string | null
          job_title?: string | null
          products?: string[]
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_members_business_account_id_fkey"
            columns: ["business_account_id"]
            isOneToOne: false
            referencedRelation: "business_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      business_quote_requests: {
        Row: {
          admin_notes: string | null
          business_account_id: string | null
          created_at: string
          id: string
          message: string | null
          plan: string | null
          product: string
          seats: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          business_account_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          plan?: string | null
          product: string
          seats?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          business_account_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          plan?: string | null
          product?: string
          seats?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_quote_requests_business_account_id_fkey"
            columns: ["business_account_id"]
            isOneToOne: false
            referencedRelation: "business_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      case_attachments: {
        Row: {
          case_id: string
          created_at: string
          file_name: string
          id: string
          mime_type: string | null
          organisation_id: string
          size_bytes: number | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          file_name: string
          id?: string
          mime_type?: string | null
          organisation_id: string
          size_bytes?: number | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          organisation_id?: string
          size_bytes?: number | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_attachments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "screening_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_comments: {
        Row: {
          author_id: string | null
          body: string
          case_id: string
          created_at: string
          id: string
          match_id: string | null
          organisation_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          case_id: string
          created_at?: string
          id?: string
          match_id?: string | null
          organisation_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          case_id?: string
          created_at?: string
          id?: string
          match_id?: string | null
          organisation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_comments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "screening_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_comments_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "screening_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_registrations: {
        Row: {
          actual_arr_eur: number | null
          admin_notes: string | null
          created_at: string
          estimated_arr_eur: number | null
          id: string
          linked_customer_id: string | null
          notes: string | null
          partner_id: string
          product_interest: string[]
          prospect_company: string
          prospect_contact_name: string | null
          prospect_country: string | null
          prospect_email: string | null
          protection_expires_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["deal_registration_status"]
          submitted_by: string
          updated_at: string
          won_at: string | null
        }
        Insert: {
          actual_arr_eur?: number | null
          admin_notes?: string | null
          created_at?: string
          estimated_arr_eur?: number | null
          id?: string
          linked_customer_id?: string | null
          notes?: string | null
          partner_id: string
          product_interest?: string[]
          prospect_company: string
          prospect_contact_name?: string | null
          prospect_country?: string | null
          prospect_email?: string | null
          protection_expires_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["deal_registration_status"]
          submitted_by: string
          updated_at?: string
          won_at?: string | null
        }
        Update: {
          actual_arr_eur?: number | null
          admin_notes?: string | null
          created_at?: string
          estimated_arr_eur?: number | null
          id?: string
          linked_customer_id?: string | null
          notes?: string | null
          partner_id?: string
          product_interest?: string[]
          prospect_company?: string
          prospect_contact_name?: string | null
          prospect_country?: string | null
          prospect_email?: string | null
          protection_expires_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["deal_registration_status"]
          submitted_by?: string
          updated_at?: string
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_registrations_linked_customer_id_fkey"
            columns: ["linked_customer_id"]
            isOneToOne: false
            referencedRelation: "suite_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_registrations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "featured_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_registrations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      ecosystem_events: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string
          event_type: string
          id: string
          metadata: Json
          occurred_at: string
          organisation_id: string | null
          portal: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type: string
          event_type: string
          id?: string
          metadata?: Json
          occurred_at?: string
          organisation_id?: string | null
          portal: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          event_type?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          organisation_id?: string | null
          portal?: string
          user_id?: string | null
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
      match_attributes: {
        Row: {
          assessment: Database["public"]["Enums"]["attribute_assessment"]
          created_at: string
          field_key: string
          field_label: string
          id: string
          match_id: string
          match_value: string | null
          organisation_id: string
          sort_order: number
          subject_value: string | null
        }
        Insert: {
          assessment?: Database["public"]["Enums"]["attribute_assessment"]
          created_at?: string
          field_key: string
          field_label: string
          id?: string
          match_id: string
          match_value?: string | null
          organisation_id: string
          sort_order?: number
          subject_value?: string | null
        }
        Update: {
          assessment?: Database["public"]["Enums"]["attribute_assessment"]
          created_at?: string
          field_key?: string
          field_label?: string
          id?: string
          match_id?: string
          match_value?: string | null
          organisation_id?: string
          sort_order?: number
          subject_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_attributes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "screening_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          case_id: string | null
          change_description: string
          change_type: string
          created_at: string
          details: Json
          detected_at: string
          id: string
          monitoring_subject_id: string
          organisation_id: string
          status: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          case_id?: string | null
          change_description: string
          change_type: string
          created_at?: string
          details?: Json
          detected_at?: string
          id?: string
          monitoring_subject_id: string
          organisation_id: string
          status?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          case_id?: string | null
          change_description?: string
          change_type?: string
          created_at?: string
          details?: Json
          detected_at?: string
          id?: string
          monitoring_subject_id?: string
          organisation_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_alerts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "screening_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_alerts_monitoring_subject_id_fkey"
            columns: ["monitoring_subject_id"]
            isOneToOne: false
            referencedRelation: "monitoring_subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_subjects: {
        Row: {
          assigned_to: string | null
          case_id: string | null
          categories: Database["public"]["Enums"]["screening_category"][]
          created_at: string
          created_by: string | null
          frequency: string
          id: string
          last_change_at: string | null
          last_checked_at: string | null
          organisation_id: string
          risk_level: string
          risk_level_changed_at: string | null
          started_at: string
          status: Database["public"]["Enums"]["monitoring_status"]
          stopped_at: string | null
          stopped_by: string | null
          subject_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          case_id?: string | null
          categories?: Database["public"]["Enums"]["screening_category"][]
          created_at?: string
          created_by?: string | null
          frequency?: string
          id?: string
          last_change_at?: string | null
          last_checked_at?: string | null
          organisation_id: string
          risk_level?: string
          risk_level_changed_at?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["monitoring_status"]
          stopped_at?: string | null
          stopped_by?: string | null
          subject_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          case_id?: string | null
          categories?: Database["public"]["Enums"]["screening_category"][]
          created_at?: string
          created_by?: string | null
          frequency?: string
          id?: string
          last_change_at?: string | null
          last_checked_at?: string | null
          organisation_id?: string
          risk_level?: string
          risk_level_changed_at?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["monitoring_status"]
          stopped_at?: string | null
          stopped_by?: string | null
          subject_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_subjects_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "screening_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "screening_subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      news_updates: {
        Row: {
          category: string
          created_at: string
          full_summary: string | null
          id: string
          published_at: string
          source: string
          source_url: string
          summary: string
          tags: string[]
          title: string
          trust_tier: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          full_summary?: string | null
          id?: string
          published_at?: string
          source: string
          source_url: string
          summary: string
          tags?: string[]
          title: string
          trust_tier?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          full_summary?: string | null
          id?: string
          published_at?: string
          source?: string
          source_url?: string
          summary?: string
          tags?: string[]
          title?: string
          trust_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      outreach_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json
          path: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          path?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          path?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      outreach_queue: {
        Row: {
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          id: string
          metadata: Json
          promo_code: string | null
          recipient_email: string
          scheduled_at: string
          sent_at: string | null
          skip_reason: string | null
          status: string
          template_id: string
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          promo_code?: string | null
          recipient_email: string
          scheduled_at?: string
          sent_at?: string | null
          skip_reason?: string | null
          status?: string
          template_id: string
          trigger_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          promo_code?: string | null
          recipient_email?: string
          scheduled_at?: string
          sent_at?: string | null
          skip_reason?: string | null
          status?: string
          template_id?: string
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_academy_seats: {
        Row: {
          assigned_at: string | null
          assigned_email: string | null
          assigned_name: string | null
          assigned_user_id: string | null
          created_at: string
          id: string
          partner_id: string
          revoked_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_email?: string | null
          assigned_name?: string | null
          assigned_user_id?: string | null
          created_at?: string
          id?: string
          partner_id: string
          revoked_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string | null
          assigned_email?: string | null
          assigned_name?: string | null
          assigned_user_id?: string | null
          created_at?: string
          id?: string
          partner_id?: string
          revoked_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_academy_seats_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "featured_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_academy_seats_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_admin_audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_user_id: string | null
          changes: Json | null
          created_at: string
          entity_id: string | null
          entity_label: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_user_id?: string | null
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_label?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_user_id?: string | null
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_label?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      partner_applications: {
        Row: {
          approved_partner_type:
            | Database["public"]["Enums"]["partner_type"]
            | null
          company_name: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          description: string | null
          id: string
          internal_notes: string | null
          notes: string | null
          partner_id: string | null
          partner_type: Database["public"]["Enums"]["partner_type"]
          review_message: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["partner_status"]
          user_id: string
          website: string | null
        }
        Insert: {
          approved_partner_type?:
            | Database["public"]["Enums"]["partner_type"]
            | null
          company_name: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          partner_id?: string | null
          partner_type?: Database["public"]["Enums"]["partner_type"]
          review_message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["partner_status"]
          user_id: string
          website?: string | null
        }
        Update: {
          approved_partner_type?:
            | Database["public"]["Enums"]["partner_type"]
            | null
          company_name?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          partner_id?: string | null
          partner_type?: Database["public"]["Enums"]["partner_type"]
          review_message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["partner_status"]
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_applications_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "featured_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_applications_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_asset_events: {
        Row: {
          asset_id: string | null
          asset_title: string | null
          created_at: string
          event_type: string
          id: string
          partner_id: string
          product: string | null
          user_id: string | null
        }
        Insert: {
          asset_id?: string | null
          asset_title?: string | null
          created_at?: string
          event_type?: string
          id?: string
          partner_id: string
          product?: string | null
          user_id?: string | null
        }
        Update: {
          asset_id?: string | null
          asset_title?: string | null
          created_at?: string
          event_type?: string
          id?: string
          partner_id?: string
          product?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_asset_events_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "partner_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_asset_events_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "featured_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_asset_events_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_asset_versions: {
        Row: {
          asset_id: string
          changelog: string | null
          content_type: string | null
          created_at: string
          created_by: string | null
          file_path: string | null
          file_size_bytes: number | null
          file_url: string | null
          id: string
          is_current: boolean
          version_number: number
        }
        Insert: {
          asset_id: string
          changelog?: string | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          is_current?: boolean
          version_number: number
        }
        Update: {
          asset_id?: string
          changelog?: string | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          is_current?: boolean
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "partner_asset_versions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "partner_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_assets: {
        Row: {
          asset_type: string
          category: string
          certification_min: string
          content: Json | null
          content_type: string | null
          created_at: string
          created_by: string | null
          cta_url: string | null
          current_version: number
          description: string | null
          file_path: string | null
          file_size_bytes: number | null
          file_url: string | null
          id: string
          industry: string | null
          is_active: boolean
          is_cobrandable: boolean
          language: string
          preview_url: string | null
          product: string | null
          published_at: string | null
          sort_order: number
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          version_label: string | null
        }
        Insert: {
          asset_type?: string
          category?: string
          certification_min?: string
          content?: Json | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          cta_url?: string | null
          current_version?: number
          description?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean
          is_cobrandable?: boolean
          language?: string
          preview_url?: string | null
          product?: string | null
          published_at?: string | null
          sort_order?: number
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          version_label?: string | null
        }
        Update: {
          asset_type?: string
          category?: string
          certification_min?: string
          content?: Json | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          cta_url?: string | null
          current_version?: number
          description?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean
          is_cobrandable?: boolean
          language?: string
          preview_url?: string | null
          product?: string | null
          published_at?: string | null
          sort_order?: number
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          version_label?: string | null
        }
        Relationships: []
      }
      partner_certification_requirements: {
        Row: {
          benefits: Json
          commission_rate: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          label: string
          level: string
          required_closed_deals: number
          required_courses: number
          required_revenue_cents: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          benefits?: Json
          commission_rate?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          label: string
          level: string
          required_closed_deals?: number
          required_courses?: number
          required_revenue_cents?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          benefits?: Json
          commission_rate?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          label?: string
          level?: string
          required_closed_deals?: number
          required_courses?: number
          required_revenue_cents?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      partner_cobrand_requests: {
        Row: {
          asset_id: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string
          details: string | null
          file_path: string | null
          id: string
          logo_path: string | null
          market: string | null
          partner_id: string
          request_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          asset_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          details?: string | null
          file_path?: string | null
          id?: string
          logo_path?: string | null
          market?: string | null
          partner_id: string
          request_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          asset_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          details?: string | null
          file_path?: string | null
          id?: string
          logo_path?: string | null
          market?: string | null
          partner_id?: string
          request_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_cobrand_requests_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "partner_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_cobrand_requests_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "featured_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_cobrand_requests_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_commissions: {
        Row: {
          amount_cents: number
          approved_at: string | null
          commission_rate: number
          created_at: string
          currency: string
          deal_id: string | null
          deal_value_cents: number
          description: string | null
          earned_on: string
          id: string
          notes: string | null
          paid_at: string | null
          partner_id: string
          payout_id: string | null
          referral_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          approved_at?: string | null
          commission_rate?: number
          created_at?: string
          currency?: string
          deal_id?: string | null
          deal_value_cents?: number
          description?: string | null
          earned_on?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          partner_id: string
          payout_id?: string | null
          referral_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          approved_at?: string | null
          commission_rate?: number
          created_at?: string
          currency?: string
          deal_id?: string | null
          deal_value_cents?: number
          description?: string | null
          earned_on?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          partner_id?: string
          payout_id?: string | null
          referral_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_commissions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_commissions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "featured_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_commissions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_commissions_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "partner_payouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_contacts: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          id: string
          is_primary: boolean
          name: string
          notify_deal_new: boolean
          notify_deal_status_change: boolean
          notify_deal_won: boolean
          notify_monthly_summary: boolean
          notify_payouts: boolean
          notify_referral_converted: boolean
          notify_referral_new: boolean
          partner_id: string
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          is_primary?: boolean
          name: string
          notify_deal_new?: boolean
          notify_deal_status_change?: boolean
          notify_deal_won?: boolean
          notify_monthly_summary?: boolean
          notify_payouts?: boolean
          notify_referral_converted?: boolean
          notify_referral_new?: boolean
          partner_id: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          is_primary?: boolean
          name?: string
          notify_deal_new?: boolean
          notify_deal_status_change?: boolean
          notify_deal_won?: boolean
          notify_monthly_summary?: boolean
          notify_payouts?: boolean
          notify_referral_converted?: boolean
          notify_referral_new?: boolean
          partner_id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_contacts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "featured_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_contacts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_deal_events: {
        Row: {
          actor_id: string | null
          created_at: string
          deal_id: string
          description: string | null
          event_type: string
          id: string
          metadata: Json
          partner_id: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          deal_id: string
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json
          partner_id?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          deal_id?: string
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          partner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_deal_events_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_deal_events_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "featured_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_deal_events_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_managers: {
        Row: {
          avatar_url: string | null
          calendar_url: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          calendar_url?: string | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          calendar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      partner_notification_settings: {
        Row: {
          created_at: string
          email: string
          is_active: boolean
          notify_deal_status_change: boolean
          notify_new_application: boolean
          notify_new_deal: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          is_active?: boolean
          notify_deal_status_change?: boolean
          notify_new_application?: boolean
          notify_new_deal?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          is_active?: boolean
          notify_deal_status_change?: boolean
          notify_new_application?: boolean
          notify_new_deal?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_payouts: {
        Row: {
          amount_eur: number
          created_at: string
          created_by: string | null
          currency: string
          id: string
          method: string | null
          notes: string | null
          paid_at: string | null
          partner_id: string
          period_end: string | null
          period_start: string | null
          reference: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_eur: number
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          method?: string | null
          notes?: string | null
          paid_at?: string | null
          partner_id: string
          period_end?: string | null
          period_start?: string | null
          reference?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_eur?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          method?: string | null
          notes?: string | null
          paid_at?: string | null
          partner_id?: string
          period_end?: string | null
          period_start?: string | null
          reference?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_payouts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "featured_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_payouts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_specialisations: {
        Row: {
          awarded_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          label: string
          partner_id: string
          progress_percent: number
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          awarded_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          label: string
          partner_id: string
          progress_percent?: number
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          awarded_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          label?: string
          partner_id?: string
          progress_percent?: number
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_specialisations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "featured_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_specialisations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          academy_seats_granted: number
          bio: string | null
          certification_level: Database["public"]["Enums"]["partner_certification"]
          commission_lifetime_months: number
          commission_rate: number
          created_at: string
          display_name: string | null
          id: string
          internal_notes: string | null
          is_active: boolean
          is_featured: boolean
          logo_url: string | null
          notification_prefs: Json
          onboarding_completed_at: string | null
          partner_manager_id: string | null
          partner_since: string | null
          partner_type: Database["public"]["Enums"]["partner_type"]
          payout_details_encrypted: string | null
          payout_method: string | null
          portal_access: string
          referral_code: string
          sandbox_key: string | null
          sandbox_key_issued_at: string | null
          tagline: string | null
          user_id: string
          verticals: string[]
          website_url: string | null
        }
        Insert: {
          academy_seats_granted?: number
          bio?: string | null
          certification_level?: Database["public"]["Enums"]["partner_certification"]
          commission_lifetime_months?: number
          commission_rate?: number
          created_at?: string
          display_name?: string | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          is_featured?: boolean
          logo_url?: string | null
          notification_prefs?: Json
          onboarding_completed_at?: string | null
          partner_manager_id?: string | null
          partner_since?: string | null
          partner_type?: Database["public"]["Enums"]["partner_type"]
          payout_details_encrypted?: string | null
          payout_method?: string | null
          portal_access?: string
          referral_code?: string
          sandbox_key?: string | null
          sandbox_key_issued_at?: string | null
          tagline?: string | null
          user_id: string
          verticals?: string[]
          website_url?: string | null
        }
        Update: {
          academy_seats_granted?: number
          bio?: string | null
          certification_level?: Database["public"]["Enums"]["partner_certification"]
          commission_lifetime_months?: number
          commission_rate?: number
          created_at?: string
          display_name?: string | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          is_featured?: boolean
          logo_url?: string | null
          notification_prefs?: Json
          onboarding_completed_at?: string | null
          partner_manager_id?: string | null
          partner_since?: string | null
          partner_type?: Database["public"]["Enums"]["partner_type"]
          payout_details_encrypted?: string | null
          payout_method?: string | null
          portal_access?: string
          referral_code?: string
          sandbox_key?: string | null
          sandbox_key_issued_at?: string | null
          tagline?: string | null
          user_id?: string
          verticals?: string[]
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_partner_manager_id_fkey"
            columns: ["partner_manager_id"]
            isOneToOne: false
            referencedRelation: "partner_managers"
            referencedColumns: ["id"]
          },
        ]
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
      product_access: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          metadata: Json
          organisation_id: string
          plan: string | null
          product: Database["public"]["Enums"]["product_key"]
          seats: number
          seats_used: number
          started_at: string | null
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json
          organisation_id: string
          plan?: string | null
          product: Database["public"]["Enums"]["product_key"]
          seats?: number
          seats_used?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json
          organisation_id?: string
          plan?: string | null
          product?: Database["public"]["Enums"]["product_key"]
          seats?: number
          seats_used?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_access_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_members: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          invite_token: string | null
          invited_email: string | null
          is_invite: boolean
          organisation_id: string
          product: Database["public"]["Enums"]["product_key"]
          role: Database["public"]["Enums"]["product_role"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          invite_token?: string | null
          invited_email?: string | null
          is_invite?: boolean
          organisation_id: string
          product: Database["public"]["Enums"]["product_key"]
          role: Database["public"]["Enums"]["product_role"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          invite_token?: string | null
          invited_email?: string | null
          is_invite?: boolean
          organisation_id?: string
          product?: Database["public"]["Enums"]["product_key"]
          role?: Database["public"]["Enums"]["product_role"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_members_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_purchase_notifications: {
        Row: {
          amount_cents: number | null
          created_at: string
          currency: string | null
          customer_email: string | null
          customer_name: string | null
          email_error: string | null
          emails_sent_at: string | null
          id: string
          mode: string | null
          plan: string | null
          product: string
          stripe_session_id: string
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          email_error?: string | null
          emails_sent_at?: string | null
          id?: string
          mode?: string | null
          plan?: string | null
          product: string
          stripe_session_id: string
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          email_error?: string | null
          emails_sent_at?: string | null
          id?: string
          mode?: string | null
          plan?: string | null
          product?: string
          stripe_session_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          billing_address: string | null
          city: string | null
          company_name: string | null
          company_size: string | null
          country: string | null
          created_at: string
          department: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          gdpr_consent_at: string | null
          id: string
          industry: string | null
          interest_area: string | null
          job_title: string | null
          last_activity_at: string | null
          last_name: string | null
          marketing_consent: boolean
          marketing_consent_at: string | null
          marketing_opt_out_at: string | null
          phone: string | null
          postal_code: string | null
          regulator: string | null
          seniority: string | null
          show_recognition_publicly: boolean
          signup_landing_path: string | null
          signup_referrer: string | null
          signup_source: string | null
          signup_utm: Json | null
          status: string
          subscription_tier: string
          suite_access_granted_at: string | null
          suite_access_granted_by: string | null
          terms_accepted_at: string | null
          updated_at: string
          user_id: string
          vat_number: string | null
        }
        Insert: {
          billing_address?: string | null
          city?: string | null
          company_name?: string | null
          company_size?: string | null
          country?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          gdpr_consent_at?: string | null
          id?: string
          industry?: string | null
          interest_area?: string | null
          job_title?: string | null
          last_activity_at?: string | null
          last_name?: string | null
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          marketing_opt_out_at?: string | null
          phone?: string | null
          postal_code?: string | null
          regulator?: string | null
          seniority?: string | null
          show_recognition_publicly?: boolean
          signup_landing_path?: string | null
          signup_referrer?: string | null
          signup_source?: string | null
          signup_utm?: Json | null
          status?: string
          subscription_tier?: string
          suite_access_granted_at?: string | null
          suite_access_granted_by?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id: string
          vat_number?: string | null
        }
        Update: {
          billing_address?: string | null
          city?: string | null
          company_name?: string | null
          company_size?: string | null
          country?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          gdpr_consent_at?: string | null
          id?: string
          industry?: string | null
          interest_area?: string | null
          job_title?: string | null
          last_activity_at?: string | null
          last_name?: string | null
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          marketing_opt_out_at?: string | null
          phone?: string | null
          postal_code?: string | null
          regulator?: string | null
          seniority?: string | null
          show_recognition_publicly?: boolean
          signup_landing_path?: string | null
          signup_referrer?: string | null
          signup_source?: string | null
          signup_utm?: Json | null
          status?: string
          subscription_tier?: string
          suite_access_granted_at?: string | null
          suite_access_granted_by?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      provider_raw_responses: {
        Row: {
          created_at: string
          duration_ms: number | null
          error_detail: string | null
          http_status: number | null
          id: string
          operation: string
          organisation_id: string
          provider: string
          request_payload: Json | null
          response_payload: Json | null
          search_id: string | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          error_detail?: string | null
          http_status?: number | null
          id?: string
          operation: string
          organisation_id: string
          provider: string
          request_payload?: Json | null
          response_payload?: Json | null
          search_id?: string | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          error_detail?: string | null
          http_status?: number | null
          id?: string
          operation?: string
          organisation_id?: string
          provider?: string
          request_payload?: Json | null
          response_payload?: Json | null
          search_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_raw_responses_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "screening_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_references: {
        Row: {
          created_at: string
          entity_id: string
          entity_kind: string
          id: string
          organisation_id: string
          provider: string
          provider_id: string
          provider_ref: Json
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_kind: string
          id?: string
          organisation_id: string
          provider: string
          provider_id: string
          provider_ref?: Json
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_kind?: string
          id?: string
          organisation_id?: string
          provider?: string
          provider_id?: string
          provider_ref?: Json
        }
        Relationships: []
      }
      quiz_error_reports: {
        Row: {
          course_id: string | null
          course_slug: string | null
          created_at: string
          error_code: string | null
          error_details: string | null
          error_hint: string | null
          error_message: string
          id: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          course_id?: string | null
          course_slug?: string | null
          created_at?: string
          error_code?: string | null
          error_details?: string | null
          error_hint?: string | null
          error_message: string
          id?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          course_id?: string | null
          course_slug?: string | null
          created_at?: string
          error_code?: string | null
          error_details?: string | null
          error_hint?: string | null
          error_message?: string
          id?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rcm_assessment_items: {
        Row: {
          answer_type: string
          assessment_id: string
          created_at: string
          evidence_url: string | null
          id: string
          obligation_id: string | null
          organization_id: string
          question: string
          response: string | null
          risk_rating: string | null
          sort_order: number
        }
        Insert: {
          answer_type?: string
          assessment_id: string
          created_at?: string
          evidence_url?: string | null
          id?: string
          obligation_id?: string | null
          organization_id: string
          question: string
          response?: string | null
          risk_rating?: string | null
          sort_order?: number
        }
        Update: {
          answer_type?: string
          assessment_id?: string
          created_at?: string
          evidence_url?: string | null
          id?: string
          obligation_id?: string | null
          organization_id?: string
          question?: string
          response?: string | null
          risk_rating?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "rcm_assessment_items_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "rcm_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcm_assessment_items_obligation_id_fkey"
            columns: ["obligation_id"]
            isOneToOne: false
            referencedRelation: "rcm_obligations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcm_assessment_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "rcm_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rcm_assessments: {
        Row: {
          created_at: string
          department_id: string | null
          due_date: string | null
          findings: string | null
          framework: string | null
          gaps: string | null
          id: string
          name: string
          organization_id: string
          overall_score: number | null
          owner_id: string | null
          period_end: string | null
          period_start: string | null
          regulation_id: string | null
          required_actions: string | null
          reviewer_comments: string | null
          reviewer_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          due_date?: string | null
          findings?: string | null
          framework?: string | null
          gaps?: string | null
          id?: string
          name: string
          organization_id: string
          overall_score?: number | null
          owner_id?: string | null
          period_end?: string | null
          period_start?: string | null
          regulation_id?: string | null
          required_actions?: string | null
          reviewer_comments?: string | null
          reviewer_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          due_date?: string | null
          findings?: string | null
          framework?: string | null
          gaps?: string | null
          id?: string
          name?: string
          organization_id?: string
          overall_score?: number | null
          owner_id?: string | null
          period_end?: string | null
          period_start?: string | null
          regulation_id?: string | null
          required_actions?: string | null
          reviewer_comments?: string | null
          reviewer_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rcm_assessments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "rcm_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcm_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "rcm_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcm_assessments_regulation_id_fkey"
            columns: ["regulation_id"]
            isOneToOne: false
            referencedRelation: "rcm_regulations"
            referencedColumns: ["id"]
          },
        ]
      }
      rcm_audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          new_value: Json | null
          old_value: Json | null
          organization_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          organization_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          organization_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rcm_audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "rcm_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rcm_comments: {
        Row: {
          body: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          organization_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          organization_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rcm_comments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "rcm_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rcm_controls: {
        Row: {
          control_type: string
          created_at: string
          department_id: string | null
          description: string | null
          effectiveness: string
          evidence_required: string | null
          frequency: string
          id: string
          last_tested_at: string | null
          name: string
          next_review_at: string | null
          obligation_id: string | null
          organization_id: string
          owner_id: string | null
          status: string
          testing_result: string | null
          updated_at: string
        }
        Insert: {
          control_type?: string
          created_at?: string
          department_id?: string | null
          description?: string | null
          effectiveness?: string
          evidence_required?: string | null
          frequency?: string
          id?: string
          last_tested_at?: string | null
          name: string
          next_review_at?: string | null
          obligation_id?: string | null
          organization_id: string
          owner_id?: string | null
          status?: string
          testing_result?: string | null
          updated_at?: string
        }
        Update: {
          control_type?: string
          created_at?: string
          department_id?: string | null
          description?: string | null
          effectiveness?: string
          evidence_required?: string | null
          frequency?: string
          id?: string
          last_tested_at?: string | null
          name?: string
          next_review_at?: string | null
          obligation_id?: string | null
          organization_id?: string
          owner_id?: string | null
          status?: string
          testing_result?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rcm_controls_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "rcm_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcm_controls_obligation_id_fkey"
            columns: ["obligation_id"]
            isOneToOne: false
            referencedRelation: "rcm_obligations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcm_controls_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "rcm_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rcm_departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rcm_departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "rcm_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rcm_evidence_files: {
        Row: {
          approval_status: string
          assessment_id: string | null
          control_id: string | null
          created_at: string
          file_name: string
          file_path: string | null
          file_size_bytes: number | null
          file_type: string | null
          id: string
          notes: string | null
          obligation_id: string | null
          organization_id: string
          task_id: string | null
          uploaded_by: string | null
          version: number
        }
        Insert: {
          approval_status?: string
          assessment_id?: string | null
          control_id?: string | null
          created_at?: string
          file_name: string
          file_path?: string | null
          file_size_bytes?: number | null
          file_type?: string | null
          id?: string
          notes?: string | null
          obligation_id?: string | null
          organization_id: string
          task_id?: string | null
          uploaded_by?: string | null
          version?: number
        }
        Update: {
          approval_status?: string
          assessment_id?: string | null
          control_id?: string | null
          created_at?: string
          file_name?: string
          file_path?: string | null
          file_size_bytes?: number | null
          file_type?: string | null
          id?: string
          notes?: string | null
          obligation_id?: string | null
          organization_id?: string
          task_id?: string | null
          uploaded_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "rcm_evidence_files_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "rcm_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcm_evidence_files_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "rcm_controls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcm_evidence_files_obligation_id_fkey"
            columns: ["obligation_id"]
            isOneToOne: false
            referencedRelation: "rcm_obligations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcm_evidence_files_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "rcm_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcm_evidence_files_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "rcm_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      rcm_jurisdictions: {
        Row: {
          country_code: string
          country_name: string
          created_at: string
          id: string
          organization_id: string
          regulator: string | null
        }
        Insert: {
          country_code: string
          country_name: string
          created_at?: string
          id?: string
          organization_id: string
          regulator?: string | null
        }
        Update: {
          country_code?: string
          country_name?: string
          created_at?: string
          id?: string
          organization_id?: string
          regulator?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rcm_jurisdictions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "rcm_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rcm_notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          organization_id: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          organization_id: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          organization_id?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rcm_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "rcm_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rcm_obligation_translations: {
        Row: {
          created_at: string
          id: string
          language: string
          obligation_id: string
          organization_id: string
          review_status: string
          reviewed_at: string | null
          reviewer_id: string | null
          translated_description: string | null
          translated_title: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          language: string
          obligation_id: string
          organization_id: string
          review_status?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          translated_description?: string | null
          translated_title?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          obligation_id?: string
          organization_id?: string
          review_status?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          translated_description?: string | null
          translated_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rcm_obligation_translations_obligation_id_fkey"
            columns: ["obligation_id"]
            isOneToOne: false
            referencedRelation: "rcm_obligations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcm_obligation_translations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "rcm_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rcm_obligations: {
        Row: {
          comments: string | null
          compliance_status: string
          created_at: string
          created_by: string | null
          deadline: string | null
          department_id: string | null
          description: string | null
          frequency: string
          id: string
          jurisdiction: string | null
          obligation_type: string
          organization_id: string
          regulation_id: string | null
          risk_level: string
          section_id: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          comments?: string | null
          compliance_status?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          department_id?: string | null
          description?: string | null
          frequency?: string
          id?: string
          jurisdiction?: string | null
          obligation_type?: string
          organization_id: string
          regulation_id?: string | null
          risk_level?: string
          section_id?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          comments?: string | null
          compliance_status?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          department_id?: string | null
          description?: string | null
          frequency?: string
          id?: string
          jurisdiction?: string | null
          obligation_type?: string
          organization_id?: string
          regulation_id?: string | null
          risk_level?: string
          section_id?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rcm_obligations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "rcm_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcm_obligations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "rcm_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcm_obligations_regulation_id_fkey"
            columns: ["regulation_id"]
            isOneToOne: false
            referencedRelation: "rcm_regulations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcm_obligations_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "rcm_regulation_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      rcm_org_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["org_member_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_member_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rcm_org_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "rcm_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rcm_organizations: {
        Row: {
          created_at: string
          id: string
          jurisdiction: string | null
          name: string
          primary_language: string
          regulator: string | null
          slug: string
          supported_languages: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jurisdiction?: string | null
          name: string
          primary_language?: string
          regulator?: string | null
          slug: string
          supported_languages?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jurisdiction?: string | null
          name?: string
          primary_language?: string
          regulator?: string | null
          slug?: string
          supported_languages?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      rcm_regulation_sections: {
        Row: {
          ai_summary: string | null
          created_at: string
          human_summary: string | null
          id: string
          obligation_tags: string[] | null
          organization_id: string
          original_text: string | null
          parent_section_id: string | null
          reference: string | null
          regulation_id: string
          risk_category: string | null
          section_type: string
          sort_order: number
          title: string | null
          updated_at: string
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          human_summary?: string | null
          id?: string
          obligation_tags?: string[] | null
          organization_id: string
          original_text?: string | null
          parent_section_id?: string | null
          reference?: string | null
          regulation_id: string
          risk_category?: string | null
          section_type?: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          human_summary?: string | null
          id?: string
          obligation_tags?: string[] | null
          organization_id?: string
          original_text?: string | null
          parent_section_id?: string | null
          reference?: string | null
          regulation_id?: string
          risk_category?: string | null
          section_type?: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rcm_regulation_sections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "rcm_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcm_regulation_sections_parent_section_id_fkey"
            columns: ["parent_section_id"]
            isOneToOne: false
            referencedRelation: "rcm_regulation_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcm_regulation_sections_regulation_id_fkey"
            columns: ["regulation_id"]
            isOneToOne: false
            referencedRelation: "rcm_regulations"
            referencedColumns: ["id"]
          },
        ]
      }
      rcm_regulation_translations: {
        Row: {
          created_at: string
          id: string
          language: string
          organization_id: string
          review_status: string
          reviewed_at: string | null
          reviewer_comments: string | null
          reviewer_id: string | null
          section_id: string
          translated_summary: string | null
          translated_text: string | null
          translated_title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          language: string
          organization_id: string
          review_status?: string
          reviewed_at?: string | null
          reviewer_comments?: string | null
          reviewer_id?: string | null
          section_id: string
          translated_summary?: string | null
          translated_text?: string | null
          translated_title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          organization_id?: string
          review_status?: string
          reviewed_at?: string | null
          reviewer_comments?: string | null
          reviewer_id?: string | null
          section_id?: string
          translated_summary?: string | null
          translated_text?: string | null
          translated_title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rcm_regulation_translations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "rcm_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcm_regulation_translations_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "rcm_regulation_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      rcm_regulations: {
        Row: {
          available_languages: string[]
          created_at: string
          created_by: string | null
          document_name: string | null
          document_url: string | null
          effective_date: string | null
          id: string
          issuing_authority: string | null
          jurisdiction: string | null
          organization_id: string
          original_language: string
          regulation_type: string | null
          sector: string | null
          status: string
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
          updated_by: string | null
          version: string | null
        }
        Insert: {
          available_languages?: string[]
          created_at?: string
          created_by?: string | null
          document_name?: string | null
          document_url?: string | null
          effective_date?: string | null
          id?: string
          issuing_authority?: string | null
          jurisdiction?: string | null
          organization_id: string
          original_language?: string
          regulation_type?: string | null
          sector?: string | null
          status?: string
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          updated_by?: string | null
          version?: string | null
        }
        Update: {
          available_languages?: string[]
          created_at?: string
          created_by?: string | null
          document_name?: string | null
          document_url?: string | null
          effective_date?: string | null
          id?: string
          issuing_authority?: string | null
          jurisdiction?: string | null
          organization_id?: string
          original_language?: string
          regulation_type?: string | null
          sector?: string | null
          status?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          updated_by?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rcm_regulations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "rcm_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rcm_tasks: {
        Row: {
          assessment_id: string | null
          assigned_to: string | null
          comments: string | null
          control_id: string | null
          created_at: string
          created_by: string | null
          department_id: string | null
          description: string | null
          due_date: string | null
          escalation_level: number
          id: string
          obligation_id: string | null
          organization_id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assessment_id?: string | null
          assigned_to?: string | null
          comments?: string | null
          control_id?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          due_date?: string | null
          escalation_level?: number
          id?: string
          obligation_id?: string | null
          organization_id: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assessment_id?: string | null
          assigned_to?: string | null
          comments?: string | null
          control_id?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          due_date?: string | null
          escalation_level?: number
          id?: string
          obligation_id?: string | null
          organization_id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rcm_tasks_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "rcm_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcm_tasks_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "rcm_controls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcm_tasks_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "rcm_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcm_tasks_obligation_id_fkey"
            columns: ["obligation_id"]
            isOneToOne: false
            referencedRelation: "rcm_obligations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcm_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "rcm_organizations"
            referencedColumns: ["id"]
          },
        ]
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
          source: string | null
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
          source?: string | null
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
          source?: string | null
          status?: Database["public"]["Enums"]["referral_status"]
        }
        Relationships: [
          {
            foreignKeyName: "referrals_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "featured_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      rss_feeds: {
        Row: {
          created_at: string
          description: string | null
          feed_url: string
          id: string
          is_active: boolean
          item_count: number
          last_fetch_error: string | null
          last_fetch_status: string | null
          last_fetched_at: string | null
          site_url: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          feed_url: string
          id?: string
          is_active?: boolean
          item_count?: number
          last_fetch_error?: string | null
          last_fetch_status?: string | null
          last_fetched_at?: string | null
          site_url?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          feed_url?: string
          id?: string
          is_active?: boolean
          item_count?: number
          last_fetch_error?: string | null
          last_fetch_status?: string | null
          last_fetched_at?: string | null
          site_url?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rss_items: {
        Row: {
          author: string | null
          content: string | null
          feed_id: string
          fetched_at: string
          guid: string
          id: string
          link: string | null
          published_at: string | null
          summary: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          author?: string | null
          content?: string | null
          feed_id: string
          fetched_at?: string
          guid: string
          id?: string
          link?: string | null
          published_at?: string | null
          summary?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          author?: string | null
          content?: string | null
          feed_id?: string
          fetched_at?: string
          guid?: string
          id?: string
          link?: string | null
          published_at?: string | null
          summary?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rss_items_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "rss_feeds"
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
      screening_audit_events: {
        Row: {
          actor_id: string | null
          case_id: string | null
          created_at: string
          description: string
          event_type: string
          id: string
          match_id: string | null
          metadata: Json
          organisation_id: string
        }
        Insert: {
          actor_id?: string | null
          case_id?: string | null
          created_at?: string
          description: string
          event_type: string
          id?: string
          match_id?: string | null
          metadata?: Json
          organisation_id: string
        }
        Update: {
          actor_id?: string | null
          case_id?: string | null
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          match_id?: string | null
          metadata?: Json
          organisation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "screening_audit_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "screening_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screening_audit_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "screening_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      screening_cases: {
        Row: {
          adverse_media_matches: number
          assigned_to: string | null
          case_reference: string
          closed_at: string | null
          created_at: string
          created_by: string | null
          customer_reference: string | null
          due_date: string | null
          escalated_at: string | null
          escalated_by: string | null
          escalated_to: string | null
          escalation_note: string | null
          id: string
          is_legacy: boolean
          monitoring_status:
            | Database["public"]["Enums"]["monitoring_status"]
            | null
          organisation_id: string
          pep_matches: number
          priority: string
          sanctions_matches: number
          search_id: string | null
          status: Database["public"]["Enums"]["screening_case_status"]
          subject_id: string | null
          updated_at: string
          warning_matches: number
        }
        Insert: {
          adverse_media_matches?: number
          assigned_to?: string | null
          case_reference: string
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_reference?: string | null
          due_date?: string | null
          escalated_at?: string | null
          escalated_by?: string | null
          escalated_to?: string | null
          escalation_note?: string | null
          id?: string
          is_legacy?: boolean
          monitoring_status?:
            | Database["public"]["Enums"]["monitoring_status"]
            | null
          organisation_id: string
          pep_matches?: number
          priority?: string
          sanctions_matches?: number
          search_id?: string | null
          status?: Database["public"]["Enums"]["screening_case_status"]
          subject_id?: string | null
          updated_at?: string
          warning_matches?: number
        }
        Update: {
          adverse_media_matches?: number
          assigned_to?: string | null
          case_reference?: string
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_reference?: string | null
          due_date?: string | null
          escalated_at?: string | null
          escalated_by?: string | null
          escalated_to?: string | null
          escalation_note?: string | null
          id?: string
          is_legacy?: boolean
          monitoring_status?:
            | Database["public"]["Enums"]["monitoring_status"]
            | null
          organisation_id?: string
          pep_matches?: number
          priority?: string
          sanctions_matches?: number
          search_id?: string | null
          status?: Database["public"]["Enums"]["screening_case_status"]
          subject_id?: string | null
          updated_at?: string
          warning_matches?: number
        }
        Relationships: [
          {
            foreignKeyName: "screening_cases_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "screening_searches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screening_cases_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "screening_subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      screening_matches: {
        Row: {
          case_id: string
          categories: Database["public"]["Enums"]["screening_category"][]
          category_labels: string[]
          conflicting_attribute_count: number
          country: string | null
          created_at: string
          entity_type:
            | Database["public"]["Enums"]["screening_subject_type"]
            | null
          id: string
          last_data_update: string | null
          match_basis: string | null
          match_type_labels: string[]
          match_types: string[]
          matched_attribute_count: number
          matched_name: string
          name_similarity: number | null
          organisation_id: string
          profile: Json
          profile_fetched_at: string | null
          provider_relevance: number | null
          search_id: string | null
          status: Database["public"]["Enums"]["screening_match_status"]
          updated_at: string
          year_of_birth: number | null
        }
        Insert: {
          case_id: string
          categories?: Database["public"]["Enums"]["screening_category"][]
          category_labels?: string[]
          conflicting_attribute_count?: number
          country?: string | null
          created_at?: string
          entity_type?:
            | Database["public"]["Enums"]["screening_subject_type"]
            | null
          id?: string
          last_data_update?: string | null
          match_basis?: string | null
          match_type_labels?: string[]
          match_types?: string[]
          matched_attribute_count?: number
          matched_name: string
          name_similarity?: number | null
          organisation_id: string
          profile?: Json
          profile_fetched_at?: string | null
          provider_relevance?: number | null
          search_id?: string | null
          status?: Database["public"]["Enums"]["screening_match_status"]
          updated_at?: string
          year_of_birth?: number | null
        }
        Update: {
          case_id?: string
          categories?: Database["public"]["Enums"]["screening_category"][]
          category_labels?: string[]
          conflicting_attribute_count?: number
          country?: string | null
          created_at?: string
          entity_type?:
            | Database["public"]["Enums"]["screening_subject_type"]
            | null
          id?: string
          last_data_update?: string | null
          match_basis?: string | null
          match_type_labels?: string[]
          match_types?: string[]
          matched_attribute_count?: number
          matched_name?: string
          name_similarity?: number | null
          organisation_id?: string
          profile?: Json
          profile_fetched_at?: string | null
          provider_relevance?: number | null
          search_id?: string | null
          status?: Database["public"]["Enums"]["screening_match_status"]
          updated_at?: string
          year_of_birth?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "screening_matches_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "screening_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screening_matches_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "screening_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      screening_org_modules: {
        Row: {
          activated_at: string | null
          cancelled_at: string | null
          created_at: string
          current_period_end: string | null
          id: string
          module: string
          monthly_price_eur: number | null
          notes: string | null
          organisation_id: string
          requested_at: string
          requested_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          id?: string
          module: string
          monthly_price_eur?: number | null
          notes?: string | null
          organisation_id: string
          requested_at?: string
          requested_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          id?: string
          module?: string
          monthly_price_eur?: number | null
          notes?: string | null
          organisation_id?: string
          requested_at?: string
          requested_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      screening_policies: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          current_version: number
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          organisation_id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          current_version?: number
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          organisation_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          current_version?: number
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          organisation_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      screening_policy_versions: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          id: string
          name: string
          organisation_id: string
          policy_id: string
          version: number
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          organisation_id: string
          policy_id: string
          version: number
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          organisation_id?: string
          policy_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "screening_policy_versions_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "screening_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      screening_risk_alert_rules: {
        Row: {
          assigned_to: string | null
          categories: string[]
          created_at: string
          created_by: string | null
          email_recipients: string[]
          enabled: boolean
          id: string
          last_triggered_at: string | null
          name: string
          notify_email: boolean
          notify_in_app: boolean
          organisation_id: string
          threshold: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          categories?: string[]
          created_at?: string
          created_by?: string | null
          email_recipients?: string[]
          enabled?: boolean
          id?: string
          last_triggered_at?: string | null
          name: string
          notify_email?: boolean
          notify_in_app?: boolean
          organisation_id: string
          threshold: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          categories?: string[]
          created_at?: string
          created_by?: string | null
          email_recipients?: string[]
          enabled?: boolean
          id?: string
          last_triggered_at?: string | null
          name?: string
          notify_email?: boolean
          notify_in_app?: boolean
          organisation_id?: string
          threshold?: string
          updated_at?: string
        }
        Relationships: []
      }
      screening_searches: {
        Row: {
          adverse_media_requested: boolean
          categories_excluded: Database["public"]["Enums"]["screening_category"][]
          categories_screened: Database["public"]["Enums"]["screening_category"][]
          created_at: string
          error_message: string | null
          id: string
          initiated_by: string | null
          is_legacy: boolean
          monitoring_requested: boolean
          organisation_id: string
          policy_id: string | null
          policy_name: string | null
          policy_version_id: string | null
          reference: string
          screened_at: string
          search_parameters: Json
          status: string
          subject_id: string | null
        }
        Insert: {
          adverse_media_requested?: boolean
          categories_excluded?: Database["public"]["Enums"]["screening_category"][]
          categories_screened?: Database["public"]["Enums"]["screening_category"][]
          created_at?: string
          error_message?: string | null
          id?: string
          initiated_by?: string | null
          is_legacy?: boolean
          monitoring_requested?: boolean
          organisation_id: string
          policy_id?: string | null
          policy_name?: string | null
          policy_version_id?: string | null
          reference: string
          screened_at?: string
          search_parameters?: Json
          status?: string
          subject_id?: string | null
        }
        Update: {
          adverse_media_requested?: boolean
          categories_excluded?: Database["public"]["Enums"]["screening_category"][]
          categories_screened?: Database["public"]["Enums"]["screening_category"][]
          created_at?: string
          error_message?: string | null
          id?: string
          initiated_by?: string | null
          is_legacy?: boolean
          monitoring_requested?: boolean
          organisation_id?: string
          policy_id?: string | null
          policy_name?: string | null
          policy_version_id?: string | null
          reference?: string
          screened_at?: string
          search_parameters?: Json
          status?: string
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "screening_searches_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "screening_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screening_searches_policy_version_id_fkey"
            columns: ["policy_version_id"]
            isOneToOne: false
            referencedRelation: "screening_policy_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screening_searches_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "screening_subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      screening_sla_settings: {
        Row: {
          auto_escalate: boolean
          created_at: string
          high_sla_hours: number
          id: string
          low_sla_hours: number
          medium_sla_hours: number
          organisation_id: string
          updated_at: string
        }
        Insert: {
          auto_escalate?: boolean
          created_at?: string
          high_sla_hours?: number
          id?: string
          low_sla_hours?: number
          medium_sla_hours?: number
          organisation_id: string
          updated_at?: string
        }
        Update: {
          auto_escalate?: boolean
          created_at?: string
          high_sla_hours?: number
          id?: string
          low_sla_hours?: number
          medium_sla_hours?: number
          organisation_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "screening_sla_settings_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: true
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      screening_sources: {
        Row: {
          category: Database["public"]["Enums"]["screening_category"] | null
          created_at: string
          description: string | null
          id: string
          internal_source_url: string | null
          jurisdiction: string | null
          last_updated: string | null
          listing_date: string | null
          match_id: string
          organisation_id: string
          reference_number: string | null
          source_name: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["screening_category"] | null
          created_at?: string
          description?: string | null
          id?: string
          internal_source_url?: string | null
          jurisdiction?: string | null
          last_updated?: string | null
          listing_date?: string | null
          match_id: string
          organisation_id: string
          reference_number?: string | null
          source_name: string
        }
        Update: {
          category?: Database["public"]["Enums"]["screening_category"] | null
          created_at?: string
          description?: string | null
          id?: string
          internal_source_url?: string | null
          jurisdiction?: string | null
          last_updated?: string | null
          listing_date?: string | null
          match_id?: string
          organisation_id?: string
          reference_number?: string | null
          source_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "screening_sources_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "screening_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      screening_subjects: {
        Row: {
          country_of_incorporation: string | null
          country_of_residence: string | null
          created_at: string
          created_by: string | null
          customer_reference: string | null
          date_of_birth: string | null
          first_name: string | null
          full_name: string
          id: string
          identification_number: string | null
          incorporation_date: string | null
          last_name: string | null
          middle_name: string | null
          nationality: string | null
          organisation_id: string
          previous_name: string | null
          registered_address: string | null
          registration_number: string | null
          subject_type: Database["public"]["Enums"]["screening_subject_type"]
          suite_customer_id: string | null
          updated_at: string
          year_of_birth: number | null
        }
        Insert: {
          country_of_incorporation?: string | null
          country_of_residence?: string | null
          created_at?: string
          created_by?: string | null
          customer_reference?: string | null
          date_of_birth?: string | null
          first_name?: string | null
          full_name: string
          id?: string
          identification_number?: string | null
          incorporation_date?: string | null
          last_name?: string | null
          middle_name?: string | null
          nationality?: string | null
          organisation_id: string
          previous_name?: string | null
          registered_address?: string | null
          registration_number?: string | null
          subject_type: Database["public"]["Enums"]["screening_subject_type"]
          suite_customer_id?: string | null
          updated_at?: string
          year_of_birth?: number | null
        }
        Update: {
          country_of_incorporation?: string | null
          country_of_residence?: string | null
          created_at?: string
          created_by?: string | null
          customer_reference?: string | null
          date_of_birth?: string | null
          first_name?: string | null
          full_name?: string
          id?: string
          identification_number?: string | null
          incorporation_date?: string | null
          last_name?: string | null
          middle_name?: string | null
          nationality?: string | null
          organisation_id?: string
          previous_name?: string | null
          registered_address?: string | null
          registration_number?: string | null
          subject_type?: Database["public"]["Enums"]["screening_subject_type"]
          suite_customer_id?: string | null
          updated_at?: string
          year_of_birth?: number | null
        }
        Relationships: []
      }
      screening_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          monitor_quota: number | null
          monitored_entity_quota: number
          organisation_id: string
          plan: string
          search_quota_annual: number | null
          seat_quota: number | null
          status: string
          stripe_customer_id: string | null
          stripe_session_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          monitor_quota?: number | null
          monitored_entity_quota?: number
          organisation_id: string
          plan: string
          search_quota_annual?: number | null
          seat_quota?: number | null
          status?: string
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          monitor_quota?: number | null
          monitored_entity_quota?: number
          organisation_id?: string
          plan?: string
          search_quota_annual?: number | null
          seat_quota?: number | null
          status?: string
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "screening_subscriptions_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
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
      str_report_amendments: {
        Row: {
          actor_user_id: string | null
          created_at: string
          details: Json
          event_type: string
          id: string
          notes: string | null
          organisation_id: string
          report_id: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          details?: Json
          event_type: string
          id?: string
          notes?: string | null
          organisation_id: string
          report_id: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          details?: Json
          event_type?: string
          id?: string
          notes?: string | null
          organisation_id?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "str_report_amendments_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "str_report_amendments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "str_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "str_report_amendments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "str_reports_overdue_amendments"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "str_report_transactions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "str_reports_overdue_amendments"
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
          amendment_due_at: string | null
          amendment_explanation: string | null
          camlo_name: string | null
          case_id: string | null
          change_request_reason: string | null
          change_requested_at: string | null
          created_at: string
          customer_id: string | null
          filed_at: string | null
          filing_status: string
          fwr_payload: Json | null
          grounds_for_suspicion: string | null
          id: string
          organisation_id: string | null
          parent_report_id: string | null
          report_number: string
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          action_taken?: string | null
          amendment_due_at?: string | null
          amendment_explanation?: string | null
          camlo_name?: string | null
          case_id?: string | null
          change_request_reason?: string | null
          change_requested_at?: string | null
          created_at?: string
          customer_id?: string | null
          filed_at?: string | null
          filing_status?: string
          fwr_payload?: Json | null
          grounds_for_suspicion?: string | null
          id?: string
          organisation_id?: string | null
          parent_report_id?: string | null
          report_number?: string
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          action_taken?: string | null
          amendment_due_at?: string | null
          amendment_explanation?: string | null
          camlo_name?: string | null
          case_id?: string | null
          change_request_reason?: string | null
          change_requested_at?: string | null
          created_at?: string
          customer_id?: string | null
          filed_at?: string | null
          filing_status?: string
          fwr_payload?: Json | null
          grounds_for_suspicion?: string | null
          id?: string
          organisation_id?: string | null
          parent_report_id?: string | null
          report_number?: string
          updated_at?: string
          user_id?: string
          version?: number
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
          {
            foreignKeyName: "str_reports_parent_report_id_fkey"
            columns: ["parent_report_id"]
            isOneToOne: false
            referencedRelation: "str_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "str_reports_parent_report_id_fkey"
            columns: ["parent_report_id"]
            isOneToOne: false
            referencedRelation: "str_reports_overdue_amendments"
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
          metadata: Json
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
          metadata?: Json
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
          metadata?: Json
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
      suite_aml_ar_batch_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          failed_count: number
          high_risk_count: number
          id: string
          job_name: string
          organisation_id: string
          payload: Json | null
          processed_count: number
          source_file_name: string | null
          started_at: string | null
          status: string
          success_count: number
          total_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          failed_count?: number
          high_risk_count?: number
          id?: string
          job_name: string
          organisation_id: string
          payload?: Json | null
          processed_count?: number
          source_file_name?: string | null
          started_at?: string | null
          status?: string
          success_count?: number
          total_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          failed_count?: number
          high_risk_count?: number
          id?: string
          job_name?: string
          organisation_id?: string
          payload?: Json | null
          processed_count?: number
          source_file_name?: string | null
          started_at?: string | null
          status?: string
          success_count?: number
          total_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suite_aml_ar_lookups: {
        Row: {
          ar_raw_response: Json | null
          ar_request_id: string | null
          ar_risk_indicators: Json | null
          ar_risk_level: string | null
          ar_risk_score: number | null
          batch_job_id: string | null
          created_at: string
          customer_id: string | null
          environment: string
          error_message: string | null
          id: string
          latency_ms: number | null
          organisation_id: string
          pan_bin: string | null
          pan_hash: string
          pan_last4: string | null
          status: string
          user_id: string
        }
        Insert: {
          ar_raw_response?: Json | null
          ar_request_id?: string | null
          ar_risk_indicators?: Json | null
          ar_risk_level?: string | null
          ar_risk_score?: number | null
          batch_job_id?: string | null
          created_at?: string
          customer_id?: string | null
          environment?: string
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          organisation_id: string
          pan_bin?: string | null
          pan_hash: string
          pan_last4?: string | null
          status?: string
          user_id: string
        }
        Update: {
          ar_raw_response?: Json | null
          ar_request_id?: string | null
          ar_risk_indicators?: Json | null
          ar_risk_level?: string | null
          ar_risk_score?: number | null
          batch_job_id?: string | null
          created_at?: string
          customer_id?: string | null
          environment?: string
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          organisation_id?: string
          pan_bin?: string | null
          pan_hash?: string
          pan_last4?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_aml_ar_lookups_customer_id_fkey"
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
      suite_case_activity: {
        Row: {
          action: string
          actor_id: string | null
          case_id: string
          created_at: string
          details: Json
          id: string
          organisation_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          case_id: string
          created_at?: string
          details?: Json
          id?: string
          organisation_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          case_id?: string
          created_at?: string
          details?: Json
          id?: string
          organisation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_case_activity_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "suite_cases"
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
          mentions: string[]
          organisation_id: string | null
          user_id: string
        }
        Insert: {
          case_id: string
          content: string
          created_at?: string
          id?: string
          mentions?: string[]
          organisation_id?: string | null
          user_id: string
        }
        Update: {
          case_id?: string
          content?: string
          created_at?: string
          id?: string
          mentions?: string[]
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
      suite_case_watchers: {
        Row: {
          case_id: string
          created_at: string
          organisation_id: string
          user_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          organisation_id: string
          user_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          organisation_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_case_watchers_case_id_fkey"
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
          assignee_user_id: string | null
          closed_at: string | null
          closed_by: string | null
          closure_notes: string | null
          closure_reason: string | null
          created_at: string
          customer_id: string | null
          due_at: string | null
          id: string
          last_reassignment_note: string | null
          linked_entity_id: string | null
          linked_entity_type: string | null
          opened_at: string | null
          organisation_id: string | null
          priority: string
          resolution: string | null
          sla_hours: number | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_id?: string | null
          assigned_to?: string | null
          assignee_user_id?: string | null
          closed_at?: string | null
          closed_by?: string | null
          closure_notes?: string | null
          closure_reason?: string | null
          created_at?: string
          customer_id?: string | null
          due_at?: string | null
          id?: string
          last_reassignment_note?: string | null
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          opened_at?: string | null
          organisation_id?: string | null
          priority?: string
          resolution?: string | null
          sla_hours?: number | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_id?: string | null
          assigned_to?: string | null
          assignee_user_id?: string | null
          closed_at?: string | null
          closed_by?: string | null
          closure_notes?: string | null
          closure_reason?: string | null
          created_at?: string
          customer_id?: string | null
          due_at?: string | null
          id?: string
          last_reassignment_note?: string | null
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          opened_at?: string | null
          organisation_id?: string | null
          priority?: string
          resolution?: string | null
          sla_hours?: number | null
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
      suite_customer_documents: {
        Row: {
          archived_at: string | null
          created_at: string
          customer_id: string
          document_label: string | null
          document_type: string
          expires_on: string | null
          file_name: string
          file_path: string
          id: string
          issued_on: string | null
          mime_type: string | null
          notes: string | null
          organisation_id: string
          portal_uploaded_by: string | null
          replaced_by_document_id: string | null
          replaces_document_id: string | null
          rerequest_due: string | null
          rerequest_message: string | null
          rerequest_reason: string | null
          rerequested_at: string | null
          rerequested_by: string | null
          size_bytes: number | null
          status: string
          updated_at: string
          uploaded_by: string | null
          uploaded_via_portal: boolean
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          customer_id: string
          document_label?: string | null
          document_type: string
          expires_on?: string | null
          file_name: string
          file_path: string
          id?: string
          issued_on?: string | null
          mime_type?: string | null
          notes?: string | null
          organisation_id: string
          portal_uploaded_by?: string | null
          replaced_by_document_id?: string | null
          replaces_document_id?: string | null
          rerequest_due?: string | null
          rerequest_message?: string | null
          rerequest_reason?: string | null
          rerequested_at?: string | null
          rerequested_by?: string | null
          size_bytes?: number | null
          status?: string
          updated_at?: string
          uploaded_by?: string | null
          uploaded_via_portal?: boolean
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          customer_id?: string
          document_label?: string | null
          document_type?: string
          expires_on?: string | null
          file_name?: string
          file_path?: string
          id?: string
          issued_on?: string | null
          mime_type?: string | null
          notes?: string | null
          organisation_id?: string
          portal_uploaded_by?: string | null
          replaced_by_document_id?: string | null
          replaces_document_id?: string | null
          rerequest_due?: string | null
          rerequest_message?: string | null
          rerequest_reason?: string | null
          rerequested_at?: string | null
          rerequested_by?: string | null
          size_bytes?: number | null
          status?: string
          updated_at?: string
          uploaded_by?: string | null
          uploaded_via_portal?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_customer_documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "suite_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_customer_documents_portal_uploaded_by_fkey"
            columns: ["portal_uploaded_by"]
            isOneToOne: false
            referencedRelation: "suite_customer_portal_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_customer_documents_replaced_by_document_id_fkey"
            columns: ["replaced_by_document_id"]
            isOneToOne: false
            referencedRelation: "suite_customer_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_customer_documents_replaces_document_id_fkey"
            columns: ["replaces_document_id"]
            isOneToOne: false
            referencedRelation: "suite_customer_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_customer_notes: {
        Row: {
          content: string
          created_at: string
          customer_id: string
          id: string
          mentions: string[]
          organisation_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          customer_id: string
          id?: string
          mentions?: string[]
          organisation_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          customer_id?: string
          id?: string
          mentions?: string[]
          organisation_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "suite_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_customer_notes_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_customer_portal_audit: {
        Row: {
          actor_auth_id: string | null
          actor_role: string
          created_at: string
          customer_id: string
          details: Json
          event: string
          id: string
          ip: string | null
          organisation_id: string
          portal_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          actor_auth_id?: string | null
          actor_role: string
          created_at?: string
          customer_id: string
          details?: Json
          event: string
          id?: string
          ip?: string | null
          organisation_id: string
          portal_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          actor_auth_id?: string | null
          actor_role?: string
          created_at?: string
          customer_id?: string
          details?: Json
          event?: string
          id?: string
          ip?: string | null
          organisation_id?: string
          portal_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suite_customer_portal_audit_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "suite_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_customer_portal_audit_portal_user_id_fkey"
            columns: ["portal_user_id"]
            isOneToOne: false
            referencedRelation: "suite_customer_portal_users"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_customer_portal_users: {
        Row: {
          activated_at: string | null
          auth_user_id: string | null
          created_at: string
          customer_id: string
          disabled_at: string | null
          disabled_by: string | null
          email: string
          id: string
          invited_at: string
          invited_by: string | null
          last_login_at: string | null
          organisation_id: string
          status: string
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          auth_user_id?: string | null
          created_at?: string
          customer_id: string
          disabled_at?: string | null
          disabled_by?: string | null
          email: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          last_login_at?: string | null
          organisation_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          auth_user_id?: string | null
          created_at?: string
          customer_id?: string
          disabled_at?: string | null
          disabled_by?: string | null
          email?: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          last_login_at?: string | null
          organisation_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_customer_portal_users_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "suite_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_customers: {
        Row: {
          aml_ar_last_checked_at: string | null
          aml_ar_last_risk_level: string | null
          aml_ar_last_score: number | null
          aml_ar_pan_bin: string | null
          aml_ar_pan_last4: string | null
          aml_ar_payment_account_ref: string | null
          company_name: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          id: string
          kyc_status: string
          name: string
          onboarding_data: Json
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
          aml_ar_last_checked_at?: string | null
          aml_ar_last_risk_level?: string | null
          aml_ar_last_score?: number | null
          aml_ar_pan_bin?: string | null
          aml_ar_pan_last4?: string | null
          aml_ar_payment_account_ref?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          id?: string
          kyc_status?: string
          name: string
          onboarding_data?: Json
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
          aml_ar_last_checked_at?: string | null
          aml_ar_last_risk_level?: string | null
          aml_ar_last_score?: number | null
          aml_ar_pan_bin?: string | null
          aml_ar_pan_last4?: string | null
          aml_ar_payment_account_ref?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          id?: string
          kyc_status?: string
          name?: string
          onboarding_data?: Json
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
      suite_dsar_requests: {
        Row: {
          created_at: string
          description: string | null
          due_by: string
          export_url: string | null
          fulfilled_at: string | null
          fulfilled_by: string | null
          id: string
          identity_verified: boolean
          identity_verified_at: string | null
          identity_verified_by: string | null
          legal_basis: string | null
          organisation_id: string
          received_via: string | null
          redacted_record_count: number
          rejection_reason: string | null
          request_kind: string
          status: string
          subject_customer_id: string | null
          subject_email: string | null
          subject_name: string
          subject_phone: string | null
          updated_at: string
          user_id: string
          verification_notes: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_by?: string
          export_url?: string | null
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          id?: string
          identity_verified?: boolean
          identity_verified_at?: string | null
          identity_verified_by?: string | null
          legal_basis?: string | null
          organisation_id: string
          received_via?: string | null
          redacted_record_count?: number
          rejection_reason?: string | null
          request_kind: string
          status?: string
          subject_customer_id?: string | null
          subject_email?: string | null
          subject_name: string
          subject_phone?: string | null
          updated_at?: string
          user_id: string
          verification_notes?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          due_by?: string
          export_url?: string | null
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          id?: string
          identity_verified?: boolean
          identity_verified_at?: string | null
          identity_verified_by?: string | null
          legal_basis?: string | null
          organisation_id?: string
          received_via?: string | null
          redacted_record_count?: number
          rejection_reason?: string | null
          request_kind?: string
          status?: string
          subject_customer_id?: string | null
          subject_email?: string | null
          subject_name?: string
          subject_phone?: string | null
          updated_at?: string
          user_id?: string
          verification_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suite_dsar_requests_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_dsar_requests_subject_customer_id_fkey"
            columns: ["subject_customer_id"]
            isOneToOne: false
            referencedRelation: "suite_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_edd_audit: {
        Row: {
          action: string
          actor_id: string
          case_id: string
          created_at: string
          details: Json
          id: string
          organisation_id: string
        }
        Insert: {
          action: string
          actor_id: string
          case_id: string
          created_at?: string
          details?: Json
          id?: string
          organisation_id: string
        }
        Update: {
          action?: string
          actor_id?: string
          case_id?: string
          created_at?: string
          details?: Json
          id?: string
          organisation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_edd_audit_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "suite_edd_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_edd_audit_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_edd_cases: {
        Row: {
          assigned_analyst: string | null
          case_reference: string
          created_at: string
          customer_id: string | null
          id: string
          mlro_decision: string | null
          mlro_id: string | null
          mlro_reason: string | null
          mlro_signed_at: string | null
          organisation_id: string
          questionnaire: Json
          requested_by: string
          risk_factors: Json
          status: string
          submitted_for_review_at: string | null
          trigger_reason: string
          updated_at: string
        }
        Insert: {
          assigned_analyst?: string | null
          case_reference: string
          created_at?: string
          customer_id?: string | null
          id?: string
          mlro_decision?: string | null
          mlro_id?: string | null
          mlro_reason?: string | null
          mlro_signed_at?: string | null
          organisation_id: string
          questionnaire?: Json
          requested_by: string
          risk_factors?: Json
          status?: string
          submitted_for_review_at?: string | null
          trigger_reason: string
          updated_at?: string
        }
        Update: {
          assigned_analyst?: string | null
          case_reference?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          mlro_decision?: string | null
          mlro_id?: string | null
          mlro_reason?: string | null
          mlro_signed_at?: string | null
          organisation_id?: string
          questionnaire?: Json
          requested_by?: string
          risk_factors?: Json
          status?: string
          submitted_for_review_at?: string | null
          trigger_reason?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_edd_cases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "suite_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_edd_cases_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_edd_evidence: {
        Row: {
          case_id: string
          created_at: string
          description: string | null
          evidence_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          organisation_id: string
          uploaded_by: string
        }
        Insert: {
          case_id: string
          created_at?: string
          description?: string | null
          evidence_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          organisation_id: string
          uploaded_by: string
        }
        Update: {
          case_id?: string
          created_at?: string
          description?: string | null
          evidence_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          organisation_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_edd_evidence_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "suite_edd_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_edd_evidence_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_erasure_log: {
        Row: {
          actor_id: string | null
          content_hash: string | null
          created_at: string
          disposition: string
          dsar_request_id: string | null
          fields_redacted: string[]
          id: string
          legal_basis: string | null
          organisation_id: string
          policy_id: string | null
          reason: string | null
          record_id: string
          record_type: string
          triggered_by: string
        }
        Insert: {
          actor_id?: string | null
          content_hash?: string | null
          created_at?: string
          disposition: string
          dsar_request_id?: string | null
          fields_redacted?: string[]
          id?: string
          legal_basis?: string | null
          organisation_id: string
          policy_id?: string | null
          reason?: string | null
          record_id: string
          record_type: string
          triggered_by: string
        }
        Update: {
          actor_id?: string | null
          content_hash?: string | null
          created_at?: string
          disposition?: string
          dsar_request_id?: string | null
          fields_redacted?: string[]
          id?: string
          legal_basis?: string | null
          organisation_id?: string
          policy_id?: string | null
          reason?: string | null
          record_id?: string
          record_type?: string
          triggered_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_erasure_log_dsar_request_id_fkey"
            columns: ["dsar_request_id"]
            isOneToOne: false
            referencedRelation: "suite_dsar_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_erasure_log_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "suite_retention_policies"
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
      suite_module_access: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          module: Database["public"]["Enums"]["suite_module_key"]
          organisation_id: string
          seats: number
          seats_used: number
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          module: Database["public"]["Enums"]["suite_module_key"]
          organisation_id: string
          seats?: number
          seats_used?: number
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          module?: Database["public"]["Enums"]["suite_module_key"]
          organisation_id?: string
          seats?: number
          seats_used?: number
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_module_access_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_notification_log: {
        Row: {
          alert_ids: string[]
          created_at: string
          id: string
          kind: string
          organisation_id: string
          recipients: string[]
          reference_id: string
          sent_at: string
        }
        Insert: {
          alert_ids?: string[]
          created_at?: string
          id?: string
          kind: string
          organisation_id: string
          recipients?: string[]
          reference_id: string
          sent_at?: string
        }
        Update: {
          alert_ids?: string[]
          created_at?: string
          id?: string
          kind?: string
          organisation_id?: string
          recipients?: string[]
          reference_id?: string
          sent_at?: string
        }
        Relationships: []
      }
      suite_onboarding_form_versions: {
        Row: {
          archived_at: string | null
          branding: Json
          created_at: string
          description: string | null
          form_id: string
          id: string
          name: string
          notes: string | null
          organisation_id: string
          published_at: string | null
          published_by: string | null
          redirect_url: string | null
          required_checks: Json
          schema: Json
          status: string
          updated_at: string
          user_id: string
          version_number: number
        }
        Insert: {
          archived_at?: string | null
          branding?: Json
          created_at?: string
          description?: string | null
          form_id: string
          id?: string
          name: string
          notes?: string | null
          organisation_id: string
          published_at?: string | null
          published_by?: string | null
          redirect_url?: string | null
          required_checks?: Json
          schema?: Json
          status?: string
          updated_at?: string
          user_id: string
          version_number: number
        }
        Update: {
          archived_at?: string | null
          branding?: Json
          created_at?: string
          description?: string | null
          form_id?: string
          id?: string
          name?: string
          notes?: string | null
          organisation_id?: string
          published_at?: string | null
          published_by?: string | null
          redirect_url?: string | null
          required_checks?: Json
          schema?: Json
          status?: string
          updated_at?: string
          user_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "suite_onboarding_form_versions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "suite_onboarding_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_onboarding_form_versions_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_onboarding_forms: {
        Row: {
          branding: Json
          created_at: string
          current_draft_version_id: string | null
          description: string | null
          id: string
          is_active: boolean
          latest_version_number: number
          name: string
          organisation_id: string
          published_version_id: string | null
          redirect_url: string | null
          required_checks: Json
          schema: Json
          slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          branding?: Json
          created_at?: string
          current_draft_version_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          latest_version_number?: number
          name: string
          organisation_id: string
          published_version_id?: string | null
          redirect_url?: string | null
          required_checks?: Json
          schema?: Json
          slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          branding?: Json
          created_at?: string
          current_draft_version_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          latest_version_number?: number
          name?: string
          organisation_id?: string
          published_version_id?: string | null
          redirect_url?: string | null
          required_checks?: Json
          schema?: Json
          slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_onboarding_forms_current_draft_version_id_fkey"
            columns: ["current_draft_version_id"]
            isOneToOne: false
            referencedRelation: "suite_onboarding_form_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_onboarding_forms_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_onboarding_forms_published_version_id_fkey"
            columns: ["published_version_id"]
            isOneToOne: false
            referencedRelation: "suite_onboarding_form_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_onboarding_submissions: {
        Row: {
          applicant_email: string | null
          applicant_name: string | null
          applicant_type: string
          created_at: string
          data: Json
          documents: Json
          form_id: string
          form_version_id: string | null
          form_version_number: number | null
          id: string
          ip_address: string | null
          linked_customer_id: string | null
          organisation_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: string
          submitted_at: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          applicant_email?: string | null
          applicant_name?: string | null
          applicant_type?: string
          created_at?: string
          data?: Json
          documents?: Json
          form_id: string
          form_version_id?: string | null
          form_version_number?: number | null
          id?: string
          ip_address?: string | null
          linked_customer_id?: string | null
          organisation_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          applicant_email?: string | null
          applicant_name?: string | null
          applicant_type?: string
          created_at?: string
          data?: Json
          documents?: Json
          form_id?: string
          form_version_id?: string | null
          form_version_number?: number | null
          id?: string
          ip_address?: string | null
          linked_customer_id?: string | null
          organisation_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suite_onboarding_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "suite_onboarding_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_onboarding_submissions_form_version_id_fkey"
            columns: ["form_version_id"]
            isOneToOne: false
            referencedRelation: "suite_onboarding_form_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_onboarding_submissions_linked_customer_id_fkey"
            columns: ["linked_customer_id"]
            isOneToOne: false
            referencedRelation: "suite_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_onboarding_submissions_organisation_id_fkey"
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
          default_thresholds: Json
          id: string
          industry: string | null
          max_api_requests_per_day: number
          max_screenings_per_month: number
          max_users: number
          name: string
          onboarding_completed_at: string | null
          onboarding_state: Json
          onboarding_step: string
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          registration_number: string | null
          regulator: string | null
          risk_appetite: string | null
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
          default_thresholds?: Json
          id?: string
          industry?: string | null
          max_api_requests_per_day?: number
          max_screenings_per_month?: number
          max_users?: number
          name: string
          onboarding_completed_at?: string | null
          onboarding_state?: Json
          onboarding_step?: string
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          registration_number?: string | null
          regulator?: string | null
          risk_appetite?: string | null
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
          default_thresholds?: Json
          id?: string
          industry?: string | null
          max_api_requests_per_day?: number
          max_screenings_per_month?: number
          max_users?: number
          name?: string
          onboarding_completed_at?: string | null
          onboarding_state?: Json
          onboarding_step?: string
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          registration_number?: string | null
          regulator?: string | null
          risk_appetite?: string | null
          status?: string
          subscription_tier?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      suite_periodic_reviews: {
        Row: {
          assigned_to: string | null
          auto_generated: boolean
          cadence_months: number
          completed_at: string | null
          completed_by: string | null
          created_at: string
          customer_id: string
          id: string
          notes: string | null
          organisation_id: string
          outcome: string | null
          risk_level_at_scheduling: string
          scheduled_for: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          auto_generated?: boolean
          cadence_months: number
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
          organisation_id: string
          outcome?: string | null
          risk_level_at_scheduling: string
          scheduled_for: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          auto_generated?: boolean
          cadence_months?: number
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
          organisation_id?: string
          outcome?: string | null
          risk_level_at_scheduling?: string
          scheduled_for?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_periodic_reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "suite_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_regulator_adapters: {
        Row: {
          config_schema: Json
          created_at: string
          default_sla_hours: number
          description: string | null
          is_active: boolean
          is_live: boolean
          jurisdiction: string | null
          key: string
          label: string
          regulator: string
          report_kinds: string[]
          transport: string
          updated_at: string
        }
        Insert: {
          config_schema?: Json
          created_at?: string
          default_sla_hours?: number
          description?: string | null
          is_active?: boolean
          is_live?: boolean
          jurisdiction?: string | null
          key: string
          label: string
          regulator: string
          report_kinds?: string[]
          transport: string
          updated_at?: string
        }
        Update: {
          config_schema?: Json
          created_at?: string
          default_sla_hours?: number
          description?: string | null
          is_active?: boolean
          is_live?: boolean
          jurisdiction?: string | null
          key?: string
          label?: string
          regulator?: string
          report_kinds?: string[]
          transport?: string
          updated_at?: string
        }
        Relationships: []
      }
      suite_regulator_submission_events: {
        Row: {
          actor_id: string | null
          created_at: string
          details: Json
          event_type: string
          from_status: string | null
          id: string
          organisation_id: string
          submission_id: string
          to_status: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          details?: Json
          event_type: string
          from_status?: string | null
          id?: string
          organisation_id: string
          submission_id: string
          to_status?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          details?: Json
          event_type?: string
          from_status?: string | null
          id?: string
          organisation_id?: string
          submission_id?: string
          to_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suite_regulator_submission_events_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "suite_regulator_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_regulator_submissions: {
        Row: {
          acknowledged_at: string | null
          adapter: string
          attempt_count: number
          case_id: string | null
          created_at: string
          customer_id: string | null
          external_reference: string | null
          id: string
          jurisdiction: string | null
          last_error: string | null
          organisation_id: string
          regulator: string
          rejected_at: string | null
          rejection_reason: string | null
          report_id: string | null
          report_kind: string
          request_payload: Json
          response_payload: Json
          sla_breached: boolean
          sla_due_at: string | null
          sla_hours: number | null
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          adapter: string
          attempt_count?: number
          case_id?: string | null
          created_at?: string
          customer_id?: string | null
          external_reference?: string | null
          id?: string
          jurisdiction?: string | null
          last_error?: string | null
          organisation_id: string
          regulator: string
          rejected_at?: string | null
          rejection_reason?: string | null
          report_id?: string | null
          report_kind: string
          request_payload?: Json
          response_payload?: Json
          sla_breached?: boolean
          sla_due_at?: string | null
          sla_hours?: number | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          adapter?: string
          attempt_count?: number
          case_id?: string | null
          created_at?: string
          customer_id?: string | null
          external_reference?: string | null
          id?: string
          jurisdiction?: string | null
          last_error?: string | null
          organisation_id?: string
          regulator?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          report_id?: string | null
          report_kind?: string
          request_payload?: Json
          response_payload?: Json
          sla_breached?: boolean
          sla_due_at?: string | null
          sla_hours?: number | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_regulator_submissions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "suite_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_regulator_submissions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "suite_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_regulator_submissions_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_retention_policies: {
        Row: {
          created_at: string
          description: string | null
          disposition: string
          id: string
          is_active: boolean
          legal_basis: string | null
          organisation_id: string | null
          record_type: string
          retention_days: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          disposition?: string
          id?: string
          is_active?: boolean
          legal_basis?: string | null
          organisation_id?: string | null
          record_type: string
          retention_days: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          disposition?: string
          id?: string
          is_active?: boolean
          legal_basis?: string | null
          organisation_id?: string | null
          record_type?: string
          retention_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_retention_policies_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suite_screening_whitelist: {
        Row: {
          created_at: string
          customer_id: string
          expires_at: string | null
          hit_count: number
          id: string
          last_hit_at: string | null
          list_type: string | null
          match_id: string | null
          match_key: string
          match_name: string
          organisation_id: string | null
          reason: string
          reviewed_by: string | null
          revoked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          expires_at?: string | null
          hit_count?: number
          id?: string
          last_hit_at?: string | null
          list_type?: string | null
          match_id?: string | null
          match_key: string
          match_name: string
          organisation_id?: string | null
          reason: string
          reviewed_by?: string | null
          revoked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          expires_at?: string | null
          hit_count?: number
          id?: string
          last_hit_at?: string | null
          list_type?: string | null
          match_id?: string | null
          match_key?: string
          match_name?: string
          organisation_id?: string | null
          reason?: string
          reviewed_by?: string | null
          revoked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suite_screening_whitelist_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "suite_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suite_screening_whitelist_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
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
          organisation_id: string
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
          organisation_id: string
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
          organisation_id?: string
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
      suite_sof_thresholds: {
        Row: {
          created_at: string
          foreign_countries_min: number
          high_severity_variance_pct: number
          inflow_high_multiplier: number
          inflow_low_multiplier: number
          min_confidence_for_auto_clear: number
          organisation_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          foreign_countries_min?: number
          high_severity_variance_pct?: number
          inflow_high_multiplier?: number
          inflow_low_multiplier?: number
          min_confidence_for_auto_clear?: number
          organisation_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          foreign_countries_min?: number
          high_severity_variance_pct?: number
          inflow_high_multiplier?: number
          inflow_low_multiplier?: number
          min_confidence_for_auto_clear?: number
          organisation_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
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
          control_pct: number | null
          control_type: string
          country: string | null
          created_at: string
          customer_id: string
          dob: string | null
          entity_type: string
          id: string
          is_pep: boolean
          is_verified: boolean
          last_screened_at: string | null
          last_screening_id: string | null
          name: string
          nationality: string | null
          notes: string | null
          organisation_id: string | null
          ownership_pct: number
          parent_ubo_id: string | null
          registration_number: string | null
          sanctions_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          control_pct?: number | null
          control_type?: string
          country?: string | null
          created_at?: string
          customer_id: string
          dob?: string | null
          entity_type?: string
          id?: string
          is_pep?: boolean
          is_verified?: boolean
          last_screened_at?: string | null
          last_screening_id?: string | null
          name: string
          nationality?: string | null
          notes?: string | null
          organisation_id?: string | null
          ownership_pct?: number
          parent_ubo_id?: string | null
          registration_number?: string | null
          sanctions_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          control_pct?: number | null
          control_type?: string
          country?: string | null
          created_at?: string
          customer_id?: string
          dob?: string | null
          entity_type?: string
          id?: string
          is_pep?: boolean
          is_verified?: boolean
          last_screened_at?: string | null
          last_screening_id?: string | null
          name?: string
          nationality?: string | null
          notes?: string | null
          organisation_id?: string | null
          ownership_pct?: number
          parent_ubo_id?: string | null
          registration_number?: string | null
          sanctions_status?: string
          updated_at?: string
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
          {
            foreignKeyName: "suite_ubo_parent_ubo_id_fkey"
            columns: ["parent_ubo_id"]
            isOneToOne: false
            referencedRelation: "suite_ubo"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_transactions: {
        Row: {
          created_at: string
          created_by: string | null
          credits: number
          description: string | null
          id: string
          kind: string
          organisation_id: string
          search_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          credits?: number
          description?: string | null
          id?: string
          kind: string
          organisation_id: string
          search_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          credits?: number
          description?: string | null
          id?: string
          kind?: string
          organisation_id?: string
          search_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_transactions_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "screening_searches"
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
      featured_partners: {
        Row: {
          bio: string | null
          certification_level:
            | Database["public"]["Enums"]["partner_certification"]
            | null
          display_name: string | null
          id: string | null
          logo_url: string | null
          partner_type: Database["public"]["Enums"]["partner_type"] | null
          tagline: string | null
          verticals: string[] | null
          website_url: string | null
        }
        Insert: {
          bio?: string | null
          certification_level?:
            | Database["public"]["Enums"]["partner_certification"]
            | null
          display_name?: string | null
          id?: string | null
          logo_url?: string | null
          partner_type?: Database["public"]["Enums"]["partner_type"] | null
          tagline?: string | null
          verticals?: string[] | null
          website_url?: string | null
        }
        Update: {
          bio?: string | null
          certification_level?:
            | Database["public"]["Enums"]["partner_certification"]
            | null
          display_name?: string | null
          id?: string | null
          logo_url?: string | null
          partner_type?: Database["public"]["Enums"]["partner_type"] | null
          tagline?: string | null
          verticals?: string[] | null
          website_url?: string | null
        }
        Relationships: []
      }
      str_reports_overdue_amendments: {
        Row: {
          amendment_due_at: string | null
          change_requested_at: string | null
          days_overdue: number | null
          filing_status: string | null
          id: string | null
          organisation_id: string | null
          parent_report_id: string | null
          report_number: string | null
          version: number | null
        }
        Insert: {
          amendment_due_at?: string | null
          change_requested_at?: string | null
          days_overdue?: never
          filing_status?: string | null
          id?: string | null
          organisation_id?: string | null
          parent_report_id?: string | null
          report_number?: string | null
          version?: number | null
        }
        Update: {
          amendment_due_at?: string | null
          change_requested_at?: string | null
          days_overdue?: never
          filing_status?: string | null
          id?: string | null
          organisation_id?: string | null
          parent_report_id?: string | null
          report_number?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "str_reports_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "suite_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "str_reports_parent_report_id_fkey"
            columns: ["parent_report_id"]
            isOneToOne: false
            referencedRelation: "str_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "str_reports_parent_report_id_fkey"
            columns: ["parent_report_id"]
            isOneToOne: false
            referencedRelation: "str_reports_overdue_amendments"
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
      academy_recognition_status: { Args: never; Returns: Json }
      admin_analytics: { Args: { _from: string; _to: string }; Returns: Json }
      admin_approve_partner_application: {
        Args: {
          _app_id: string
          _certification?: Database["public"]["Enums"]["partner_certification"]
          _commission_rate: number
          _grant_portal?: boolean
          _internal_notes?: string
          _manager_id?: string
          _partner_type: Database["public"]["Enums"]["partner_type"]
          _verticals?: string[]
        }
        Returns: Json
      }
      admin_client_access_overview: { Args: never; Returns: Json }
      admin_company_360: {
        Args: { _business_account_id?: string; _domain?: string }
        Returns: Json
      }
      admin_data_quality: { Args: never; Returns: Json }
      admin_grant_suite_access:
        | { Args: { target_email: string }; Returns: undefined }
        | {
            Args: { target_email: string; target_regulator?: string }
            Returns: undefined
          }
      admin_invite_internal:
        | { Args: { _email: string; _note?: string }; Returns: Json }
        | {
            Args: {
              _access_role: string
              _department: string
              _email: string
              _note: string
            }
            Returns: Json
          }
      admin_list_courses_with_stripe: {
        Args: never
        Returns: {
          category: string
          cpd_hours: number
          description: string
          difficulty: string
          duration_minutes: number
          id: string
          is_published: boolean
          price_eur_cents: number
          slug: string
          sort_order: number
          stripe_price_id: string
          stripe_product_id: string
          title: string
        }[]
      }
      admin_list_internal_access: {
        Args: never
        Returns: {
          accepted_at: string
          access_role: string
          account_created_at: string
          admin_since: string
          company_name: string
          department: string
          email: string
          full_name: string
          granted_by_email: string
          invited_at: string
          is_admin: boolean
          last_sign_in_at: string
          note: string
          phone: string
          status: string
          suspended_at: string
          user_id: string
        }[]
      }
      admin_notification_set_state: {
        Args: {
          _ignore?: boolean
          _notification_id: string
          _read?: boolean
          _snooze_until?: string
        }
        Returns: undefined
      }
      admin_notifications_mark_all_read: { Args: never; Returns: undefined }
      admin_notifications_sync: { Args: never; Returns: undefined }
      admin_notify_resolve: {
        Args: { _entity_id: string; _event_type: string; _note?: string }
        Returns: undefined
      }
      admin_notify_upsert: {
        Args: {
          _action_url: string
          _category: string
          _entity_id: string
          _entity_type: string
          _event_type: string
          _message: string
          _metadata?: Json
          _nav_path: string
          _priority: string
          _title: string
        }
        Returns: string
      }
      admin_review_partner_application: {
        Args: { _app_id: string; _decision: string; _message: string }
        Returns: undefined
      }
      admin_revoke_internal: { Args: { _email: string }; Returns: undefined }
      admin_revoke_suite_access: {
        Args: { target_email: string }
        Returns: undefined
      }
      admin_screening_overview: { Args: never; Returns: Json }
      admin_screening_profile_audit: {
        Args: { _limit?: number; _search?: string }
        Returns: {
          actor_email: string
          actor_id: string
          actor_name: string
          case_id: string
          case_reference: string
          description: string
          event_id: string
          match_id: string
          matched_name: string
          metadata: Json
          occurred_at: string
          organisation_id: string
          organisation_name: string
          profile_cached_at: string
        }[]
      }
      admin_screening_users: { Args: never; Returns: Json }
      admin_set_internal_role: {
        Args: { _access_role: string; _department: string; _email: string }
        Returns: undefined
      }
      admin_set_partner_portal_access: {
        Args: { _access: string; _partner_id: string; _reason?: string }
        Returns: undefined
      }
      admin_set_product_access: {
        Args: {
          _organisation_id: string
          _plan?: string
          _product: Database["public"]["Enums"]["product_key"]
          _seats?: number
          _status: Database["public"]["Enums"]["product_status"]
        }
        Returns: undefined
      }
      admin_set_screening_module: {
        Args: {
          _current_period_end?: string
          _module_id: string
          _monthly_price_eur?: number
          _notes?: string
          _status: string
        }
        Returns: Json
      }
      admin_suspend_internal: {
        Args: { _email: string; _suspend: boolean }
        Returns: undefined
      }
      admin_user_360: { Args: { _user_id: string }; Returns: Json }
      admin_user_activity: {
        Args: never
        Returns: {
          auth_created_at: string
          email_confirmed_at: string
          last_sign_in_at: string
          user_id: string
        }[]
      }
      business_account_ids: { Args: { _user_id: string }; Returns: string[] }
      calculate_customer_risk_score: {
        Args: { p_customer_id: string }
        Returns: Json
      }
      cert_rank: { Args: { _level: string }; Returns: number }
      current_partner_cert_level: { Args: never; Returns: string }
      current_portal_customer_id: { Args: never; Returns: string }
      current_user_has_suite_access: { Args: never; Returns: boolean }
      current_user_org_id: { Args: never; Returns: string }
      current_user_screening_entitlement: {
        Args: never
        Returns: {
          current_period_end: string
          has_access: boolean
          is_admin: boolean
          monitor_quota: number
          monitored_entity_quota: number
          plan: string
          search_quota_annual: number
          seat_quota: number
          seats_used: number
          status: string
        }[]
      }
      current_user_screening_modules: {
        Args: never
        Returns: {
          activated_at: string
          current_period_end: string
          member_role: string
          module: string
          monthly_price_eur: number
          organisation_id: string
          requested_at: string
          status: string
        }[]
      }
      current_user_screening_org: { Args: never; Returns: string }
      dsar_execute_erasure: {
        Args: { _customer_id: string; _dsar_id?: string; _reason?: string }
        Returns: Json
      }
      enqueue_outreach: {
        Args: {
          _delay?: string
          _metadata?: Json
          _template_id: string
          _trigger_type: string
          _user_id: string
        }
        Returns: string
      }
      ensure_default_screening_policy: {
        Args: { _org: string }
        Returns: string
      }
      file_str_amendment: {
        Args: { _explanation: string; _report_id: string }
        Returns: undefined
      }
      get_academy_module_counts: {
        Args: never
        Returns: {
          course_id: string
          module_count: number
        }[]
      }
      get_academy_template_file_url: {
        Args: { _template_id: string }
        Returns: string
      }
      get_certificate_by_token: { Args: { _token: string }; Returns: Json }
      get_public_onboarding_form: {
        Args: { _form_id: string }
        Returns: {
          branding: Json
          description: string
          id: string
          is_active: boolean
          name: string
          organisation_id: string
          redirect_url: string
          required_checks: Json
          schema: Json
        }[]
      }
      get_rls_audit: {
        Args: never
        Returns: {
          command: string
          permissive: string
          policy_name: string
          rls_enabled: boolean
          table: string
        }[]
      }
      get_screening_org_quota: {
        Args: { _org_id: string }
        Returns: {
          current_period_end: string
          monitor_quota: number
          plan: string
          search_quota_annual: number
          seat_quota: number
          status: string
        }[]
      }
      get_storage_buckets_audit: {
        Args: never
        Returns: {
          name: string
          public: boolean
        }[]
      }
      get_user_org_ids: { Args: { _user_id: string }; Returns: string[] }
      has_academy_course_access: {
        Args: { _course_id: string }
        Returns: boolean
      }
      has_partner_portal_access: {
        Args: { _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      invite_screening_member: {
        Args: {
          _email: string
          _role: Database["public"]["Enums"]["product_role"]
        }
        Returns: undefined
      }
      is_business_admin: { Args: { _account: string }; Returns: boolean }
      is_business_member: { Args: { _account: string }; Returns: boolean }
      is_eligible_for_sales_outreach: {
        Args: { _user_id: string }
        Returns: Json
      }
      is_portal_user_of: { Args: { _customer_id: string }; Returns: boolean }
      log_admin_access_event: {
        Args: {
          _action: string
          _detail?: string
          _new?: string
          _previous?: string
          _target_email: string
        }
        Returns: undefined
      }
      mark_overdue_periodic_reviews: { Args: never; Returns: number }
      news_clean_text: { Args: { _raw: string }; Returns: string }
      next_screening_reference: { Args: { _prefix?: string }; Returns: string }
      onboarding_form_publish: {
        Args: { _form_id: string; _notes?: string }
        Returns: string
      }
      onboarding_form_rollback: {
        Args: { _form_id: string; _notes?: string; _version_id: string }
        Returns: string
      }
      onboarding_form_save_draft: {
        Args: {
          _branding: Json
          _description: string
          _form_id: string
          _name: string
          _redirect_url: string
          _required_checks: Json
          _schema: Json
        }
        Returns: string
      }
      partner_audit: {
        Args: {
          _action: string
          _changes: Json
          _entity_id: string
          _entity_label: string
          _entity_type: string
        }
        Returns: undefined
      }
      portal_accept_document: {
        Args: { _new_doc_id: string }
        Returns: undefined
      }
      portal_activate_session: { Args: never; Returns: string }
      portal_invite_customer: {
        Args: { _customer_id: string; _email: string }
        Returns: string
      }
      portal_reject_document: {
        Args: { _new_doc_id: string; _reason: string }
        Returns: undefined
      }
      portal_submit_document: {
        Args: {
          _expires_on: string
          _file_name: string
          _file_path: string
          _issued_on: string
          _mime_type: string
          _notes: string
          _replaces_id: string
          _size_bytes: number
        }
        Returns: string
      }
      rcm_can_edit: { Args: { _org: string }; Returns: boolean }
      rcm_can_manage: { Args: { _org: string }; Returns: boolean }
      rcm_is_org_admin: { Args: { _org: string }; Returns: boolean }
      rcm_is_org_member: { Args: { _org: string }; Returns: boolean }
      rcm_member_role: {
        Args: { _org: string }
        Returns: Database["public"]["Enums"]["org_member_role"]
      }
      record_ecosystem_event: {
        Args: {
          _entity_id: string
          _entity_type: string
          _event_type: string
          _metadata?: Json
          _organisation_id: string
          _portal: string
          _user_id: string
        }
        Returns: undefined
      }
      remove_screening_member: {
        Args: { _user_id: string }
        Returns: undefined
      }
      request_str_amendment: {
        Args: { _reason: string; _report_id: string }
        Returns: string
      }
      review_cadence_months: { Args: { _risk_level: string }; Returns: number }
      same_domain_signup_count: {
        Args: never
        Returns: {
          domain: string
          signup_count: number
        }[]
      }
      screening_escalation_reviewers: {
        Args: { _organisation_id: string }
        Returns: {
          email: string
          full_name: string
          role: string
          user_id: string
        }[]
      }
      screening_is_org_member: { Args: { _org: string }; Returns: boolean }
      screening_module_active: {
        Args: { _module: string; _organisation_id: string }
        Returns: boolean
      }
      screening_team_members: { Args: never; Returns: Json }
      set_product_member_role: {
        Args: {
          _organisation_id: string
          _product: Database["public"]["Enums"]["product_key"]
          _role: Database["public"]["Enums"]["product_role"]
          _user_id: string
        }
        Returns: undefined
      }
      set_screening_member_role: {
        Args: {
          _role: Database["public"]["Enums"]["product_role"]
          _user_id: string
        }
        Returns: undefined
      }
      submit_quiz_and_issue_certificate: {
        Args: { _answers: Json; _course_id: string; _holder_name: string }
        Returns: Json
      }
      suite_bootstrap_org: { Args: { _name: string }; Returns: string }
      suite_provision_baseline_rules: {
        Args: { _org: string }
        Returns: number
      }
      sweep_customer_document_expiry: { Args: never; Returns: Json }
      sweep_regulator_submission_sla: { Args: never; Returns: number }
      sweep_retention: { Args: never; Returns: Json }
      sweep_sanctions_search_retention: { Args: never; Returns: number }
    }
    Enums: {
      adverse_media_status:
        | "new"
        | "relevant"
        | "not_relevant"
        | "duplicate"
        | "escalated"
      analyst_decision_kind:
        | "confirm_match"
        | "keep_possible"
        | "false_positive"
        | "escalate"
        | "add_to_monitoring"
        | "reopen"
      app_role: "admin" | "moderator" | "user"
      attribute_assessment:
        | "match"
        | "partial_match"
        | "conflict"
        | "unavailable"
      deal_registration_status:
        | "pending"
        | "approved"
        | "rejected"
        | "won"
        | "lost"
        | "expired"
      monitoring_status: "active" | "paused" | "stopped"
      org_member_role:
        | "admin"
        | "mlro"
        | "compliance_officer"
        | "analyst"
        | "viewer"
      partner_certification: "none" | "bronze" | "silver" | "gold"
      partner_status:
        | "pending"
        | "approved"
        | "rejected"
        | "more_info"
        | "withdrawn"
      partner_type: "referral" | "affiliate" | "reseller" | "technology"
      product_key: "screening" | "suite" | "academy"
      product_role:
        | "admin"
        | "manager"
        | "analyst"
        | "viewer"
        | "mlro_approver"
        | "reviewer"
        | "submitter"
        | "owner"
        | "contributor"
        | "learner"
        | "seat_manager"
      product_status: "trial" | "active" | "suspended" | "cancelled"
      referral_status: "clicked" | "signed_up" | "converted"
      screening_case_status:
        | "no_potential_matches"
        | "potential_matches_require_review"
        | "review_in_progress"
        | "match_confirmed"
        | "false_positives_resolved"
        | "escalated"
        | "screening_failed"
        | "monitoring_update_requires_review"
        | "closed"
      screening_category: "sanctions" | "pep_rca" | "warnings" | "adverse_media"
      screening_match_status:
        | "review_required"
        | "review_in_progress"
        | "confirmed"
        | "possible"
        | "false_positive"
        | "escalated"
      screening_subject_type:
        | "person"
        | "organisation"
        | "company"
        | "vessel"
        | "aircraft"
      suite_module_key: "kyc_kyb" | "rcm"
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
      adverse_media_status: [
        "new",
        "relevant",
        "not_relevant",
        "duplicate",
        "escalated",
      ],
      analyst_decision_kind: [
        "confirm_match",
        "keep_possible",
        "false_positive",
        "escalate",
        "add_to_monitoring",
        "reopen",
      ],
      app_role: ["admin", "moderator", "user"],
      attribute_assessment: [
        "match",
        "partial_match",
        "conflict",
        "unavailable",
      ],
      deal_registration_status: [
        "pending",
        "approved",
        "rejected",
        "won",
        "lost",
        "expired",
      ],
      monitoring_status: ["active", "paused", "stopped"],
      org_member_role: [
        "admin",
        "mlro",
        "compliance_officer",
        "analyst",
        "viewer",
      ],
      partner_certification: ["none", "bronze", "silver", "gold"],
      partner_status: [
        "pending",
        "approved",
        "rejected",
        "more_info",
        "withdrawn",
      ],
      partner_type: ["referral", "affiliate", "reseller", "technology"],
      product_key: ["screening", "suite", "academy"],
      product_role: [
        "admin",
        "manager",
        "analyst",
        "viewer",
        "mlro_approver",
        "reviewer",
        "submitter",
        "owner",
        "contributor",
        "learner",
        "seat_manager",
      ],
      product_status: ["trial", "active", "suspended", "cancelled"],
      referral_status: ["clicked", "signed_up", "converted"],
      screening_case_status: [
        "no_potential_matches",
        "potential_matches_require_review",
        "review_in_progress",
        "match_confirmed",
        "false_positives_resolved",
        "escalated",
        "screening_failed",
        "monitoring_update_requires_review",
        "closed",
      ],
      screening_category: ["sanctions", "pep_rca", "warnings", "adverse_media"],
      screening_match_status: [
        "review_required",
        "review_in_progress",
        "confirmed",
        "possible",
        "false_positive",
        "escalated",
      ],
      screening_subject_type: [
        "person",
        "organisation",
        "company",
        "vessel",
        "aircraft",
      ],
      suite_module_key: ["kyc_kyb", "rcm"],
    },
  },
} as const

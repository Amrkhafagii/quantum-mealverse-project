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
      achievement_progress: {
        Row: {
          achievement_id: string | null
          achievement_progress_user_id: string | null
          completed: boolean | null
          created_at: string | null
          current_progress: number | null
          id: string
          target_progress: number
          updated_at: string | null
        }
        Insert: {
          achievement_id?: string | null
          achievement_progress_user_id?: string | null
          completed?: boolean | null
          created_at?: string | null
          current_progress?: number | null
          id?: string
          target_progress: number
          updated_at?: string | null
        }
        Update: {
          achievement_id?: string | null
          achievement_progress_user_id?: string | null
          completed?: boolean | null
          created_at?: string | null
          current_progress?: number | null
          id?: string
          target_progress?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "achievement_progress_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      achievements: {
        Row: {
          criteria: string
          description: string
          icon: string
          id: string
          name: string
          points: number
        }
        Insert: {
          criteria: string
          description: string
          icon: string
          id?: string
          name: string
          points: number
        }
        Update: {
          criteria?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          points?: number
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          admin_users_user_id: string
          created_at: string
        }
        Insert: {
          admin_users_user_id: string
          created_at?: string
        }
        Update: {
          admin_users_user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      app_config: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_secret: boolean | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_secret?: boolean | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_secret?: boolean | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_holder_name: string
          account_number: string
          account_type: string | null
          bank_name: string
          created_at: string | null
          delivery_user_id: string | null
          external_account_id: string | null
          id: string
          is_default: boolean | null
          is_verified: boolean | null
          restaurant_id: string | null
          routing_number: string
          updated_at: string | null
          verification_status: string | null
        }
        Insert: {
          account_holder_name: string
          account_number: string
          account_type?: string | null
          bank_name: string
          created_at?: string | null
          delivery_user_id?: string | null
          external_account_id?: string | null
          id?: string
          is_default?: boolean | null
          is_verified?: boolean | null
          restaurant_id?: string | null
          routing_number: string
          updated_at?: string | null
          verification_status?: string | null
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          account_type?: string | null
          bank_name?: string
          created_at?: string | null
          delivery_user_id?: string | null
          external_account_id?: string | null
          id?: string
          is_default?: boolean | null
          is_verified?: boolean | null
          restaurant_id?: string | null
          routing_number?: string
          updated_at?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      battery_performance_settings: {
        Row: {
          auto_pause_tracking_when_stationary: boolean
          auto_reduce_accuracy_on_low_battery: boolean
          background_processing_enabled: boolean
          batch_size: number
          batch_timeout_seconds: number
          battery_critical_threshold: number
          battery_high_threshold: number
          battery_low_threshold: number
          battery_medium_threshold: number
          cellular_interval: number
          cpu_optimization_level: string
          created_at: string
          delivery_user_id: string
          distance_filter_high: number
          distance_filter_low: number
          distance_filter_medium: number
          enable_data_compression: boolean
          enable_low_power_mode: boolean
          high_accuracy_interval: number
          id: string
          location_batching_enabled: boolean
          low_accuracy_interval: number
          medium_accuracy_interval: number
          motion_detection_enabled: boolean
          motion_sensitivity: string
          movement_threshold_meters: number
          network_quality_optimization: boolean
          offline_mode_interval: number
          poor_network_interval: number
          speed_threshold_kmh: number
          stationary_timeout_minutes: number
          tracking_mode: string
          updated_at: string
          wifi_preferred_interval: number
        }
        Insert: {
          auto_pause_tracking_when_stationary?: boolean
          auto_reduce_accuracy_on_low_battery?: boolean
          background_processing_enabled?: boolean
          batch_size?: number
          batch_timeout_seconds?: number
          battery_critical_threshold?: number
          battery_high_threshold?: number
          battery_low_threshold?: number
          battery_medium_threshold?: number
          cellular_interval?: number
          cpu_optimization_level?: string
          created_at?: string
          delivery_user_id: string
          distance_filter_high?: number
          distance_filter_low?: number
          distance_filter_medium?: number
          enable_data_compression?: boolean
          enable_low_power_mode?: boolean
          high_accuracy_interval?: number
          id?: string
          location_batching_enabled?: boolean
          low_accuracy_interval?: number
          medium_accuracy_interval?: number
          motion_detection_enabled?: boolean
          motion_sensitivity?: string
          movement_threshold_meters?: number
          network_quality_optimization?: boolean
          offline_mode_interval?: number
          poor_network_interval?: number
          speed_threshold_kmh?: number
          stationary_timeout_minutes?: number
          tracking_mode?: string
          updated_at?: string
          wifi_preferred_interval?: number
        }
        Update: {
          auto_pause_tracking_when_stationary?: boolean
          auto_reduce_accuracy_on_low_battery?: boolean
          background_processing_enabled?: boolean
          batch_size?: number
          batch_timeout_seconds?: number
          battery_critical_threshold?: number
          battery_high_threshold?: number
          battery_low_threshold?: number
          battery_medium_threshold?: number
          cellular_interval?: number
          cpu_optimization_level?: string
          created_at?: string
          delivery_user_id?: string
          distance_filter_high?: number
          distance_filter_low?: number
          distance_filter_medium?: number
          enable_data_compression?: boolean
          enable_low_power_mode?: boolean
          high_accuracy_interval?: number
          id?: string
          location_batching_enabled?: boolean
          low_accuracy_interval?: number
          medium_accuracy_interval?: number
          motion_detection_enabled?: boolean
          motion_sensitivity?: string
          movement_threshold_meters?: number
          network_quality_optimization?: boolean
          offline_mode_interval?: number
          poor_network_interval?: number
          speed_threshold_kmh?: number
          stationary_timeout_minutes?: number
          tracking_mode?: string
          updated_at?: string
          wifi_preferred_interval?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_battery_performance_delivery_user"
            columns: ["delivery_user_id"]
            isOneToOne: true
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          challenge_participants_user_id: string
          completed: boolean
          completion_date: string | null
          id: string
          joined_date: string
          progress: number
          team_id: string | null
        }
        Insert: {
          challenge_id: string
          challenge_participants_user_id: string
          completed?: boolean
          completion_date?: string | null
          id?: string
          joined_date?: string
          progress?: number
          team_id?: string | null
        }
        Update: {
          challenge_id?: string
          challenge_participants_user_id?: string
          completed?: boolean
          completion_date?: string | null
          id?: string
          joined_date?: string
          progress?: number
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_participants_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_by: string
          description: string | null
          end_date: string
          goal_type: string | null
          goal_value: number | null
          id: string
          is_active: boolean
          participants_count: number | null
          prize_description: string | null
          reward_points: number | null
          rules: string | null
          start_date: string
          status: string | null
          target_value: number
          team_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_by: string
          description?: string | null
          end_date: string
          goal_type?: string | null
          goal_value?: number | null
          id?: string
          is_active?: boolean
          participants_count?: number | null
          prize_description?: string | null
          reward_points?: number | null
          rules?: string | null
          start_date: string
          status?: string | null
          target_value: number
          team_id?: string | null
          title: string
          type: string
        }
        Update: {
          created_by?: string
          description?: string | null
          end_date?: string
          goal_type?: string | null
          goal_value?: number | null
          id?: string
          is_active?: boolean
          participants_count?: number | null
          prize_description?: string | null
          reward_points?: number | null
          rules?: string | null
          start_date?: string
          status?: string | null
          target_value?: number
          team_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_structures: {
        Row: {
          commission_rate: number
          created_at: string | null
          effective_from: string
          effective_until: string | null
          fixed_fee: number | null
          id: string
          is_active: boolean | null
          minimum_order_value: number | null
          name: string
          payment_processing_rate: number
          restaurant_id: string | null
          updated_at: string | null
        }
        Insert: {
          commission_rate: number
          created_at?: string | null
          effective_from?: string
          effective_until?: string | null
          fixed_fee?: number | null
          id?: string
          is_active?: boolean | null
          minimum_order_value?: number | null
          name: string
          payment_processing_rate: number
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          commission_rate?: number
          created_at?: string | null
          effective_from?: string
          effective_until?: string | null
          fixed_fee?: number | null
          id?: string
          is_active?: boolean | null
          minimum_order_value?: number | null
          name?: string
          payment_processing_rate?: number
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commission_structures_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_communications: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          media_urls: string[] | null
          message_type: string
          order_id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_urls?: string[] | null
          message_type: string
          order_id: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_urls?: string[] | null
          message_type?: string
          order_id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_communications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_logs: {
        Row: {
          affected_rows: number | null
          after_state: Json | null
          before_state: Json | null
          created_at: string
          customer_logs_user_id: string | null
          element_class: string | null
          element_id: string | null
          element_type: string | null
          endpoint: string | null
          error_message: string | null
          error_stack: string | null
          id: string
          metadata: Json | null
          page_url: string | null
          query_text: string | null
          request_body: Json | null
          request_headers: Json | null
          response_body: Json | null
          response_headers: Json | null
          session_id: string | null
          status_code: number | null
          timestamp: string
          type: Database["public"]["Enums"]["log_type"]
        }
        Insert: {
          affected_rows?: number | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          customer_logs_user_id?: string | null
          element_class?: string | null
          element_id?: string | null
          element_type?: string | null
          endpoint?: string | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          metadata?: Json | null
          page_url?: string | null
          query_text?: string | null
          request_body?: Json | null
          request_headers?: Json | null
          response_body?: Json | null
          response_headers?: Json | null
          session_id?: string | null
          status_code?: number | null
          timestamp?: string
          type: Database["public"]["Enums"]["log_type"]
        }
        Update: {
          affected_rows?: number | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          customer_logs_user_id?: string | null
          element_class?: string | null
          element_id?: string | null
          element_type?: string | null
          endpoint?: string | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          metadata?: Json | null
          page_url?: string | null
          query_text?: string | null
          request_body?: Json | null
          request_headers?: Json | null
          response_body?: Json | null
          response_headers?: Json | null
          session_id?: string | null
          status_code?: number | null
          timestamp?: string
          type?: Database["public"]["Enums"]["log_type"]
        }
        Relationships: []
      }
      customer_notifications: {
        Row: {
          created_at: string | null
          customer_id: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          is_sent: boolean | null
          message: string
          notification_type: string
          order_id: string | null
          read_at: string | null
          sent_at: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          is_sent?: boolean | null
          message: string
          notification_type: string
          order_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          is_sent?: boolean | null
          message?: string
          notification_type?: string
          order_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      data_anonymization_settings: {
        Row: {
          anonymize_device_info: boolean | null
          anonymize_location_data: boolean | null
          anonymize_usage_patterns: boolean | null
          created_at: string | null
          data_anonymization_settings_user_id: string | null
          id: string
          precision_reduction_level: number | null
          updated_at: string | null
        }
        Insert: {
          anonymize_device_info?: boolean | null
          anonymize_location_data?: boolean | null
          anonymize_usage_patterns?: boolean | null
          created_at?: string | null
          data_anonymization_settings_user_id?: string | null
          id?: string
          precision_reduction_level?: number | null
          updated_at?: string | null
        }
        Update: {
          anonymize_device_info?: boolean | null
          anonymize_location_data?: boolean | null
          anonymize_usage_patterns?: boolean | null
          created_at?: string | null
          data_anonymization_settings_user_id?: string | null
          id?: string
          precision_reduction_level?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      data_export_requests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          data_export_requests_user_id: string | null
          expires_at: string | null
          export_format: string
          file_url: string | null
          id: string
          request_type: string
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          data_export_requests_user_id?: string | null
          expires_at?: string | null
          export_format: string
          file_url?: string | null
          id?: string
          request_type: string
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          data_export_requests_user_id?: string | null
          expires_at?: string | null
          export_format?: string
          file_url?: string | null
          id?: string
          request_type?: string
          status?: string | null
        }
        Relationships: []
      }
      data_retention_logs: {
        Row: {
          executed_at: string
          id: string
          results: Json
          success: boolean
        }
        Insert: {
          executed_at?: string
          id?: string
          results: Json
          success?: boolean
        }
        Update: {
          executed_at?: string
          id?: string
          results?: Json
          success?: boolean
        }
        Relationships: []
      }
      delivery_addresses: {
        Row: {
          address: string
          city: string
          created_at: string | null
          delivery_addresses_user_id: string
          email: string | null
          full_name: string
          id: string
          is_default: boolean | null
          latitude: number | null
          longitude: number | null
          phone: string
          updated_at: string | null
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          delivery_addresses_user_id: string
          email?: string | null
          full_name: string
          id?: string
          is_default?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          delivery_addresses_user_id?: string
          email?: string | null
          full_name?: string
          id?: string
          is_default?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      delivery_analytics_daily: {
        Row: {
          average_delivery_time: number
          average_rating: number | null
          cancelled_deliveries: number
          completed_deliveries: number
          created_at: string
          customer_ratings: Json | null
          date: string
          delivery_user_id: string
          id: string
          online_time_minutes: number
          peak_hours_worked: number
          total_bonuses: number
          total_deliveries: number
          total_distance_km: number
          total_earnings: number
          total_tips: number
          updated_at: string
        }
        Insert: {
          average_delivery_time?: number
          average_rating?: number | null
          cancelled_deliveries?: number
          completed_deliveries?: number
          created_at?: string
          customer_ratings?: Json | null
          date: string
          delivery_user_id: string
          id?: string
          online_time_minutes?: number
          peak_hours_worked?: number
          total_bonuses?: number
          total_deliveries?: number
          total_distance_km?: number
          total_earnings?: number
          total_tips?: number
          updated_at?: string
        }
        Update: {
          average_delivery_time?: number
          average_rating?: number | null
          cancelled_deliveries?: number
          completed_deliveries?: number
          created_at?: string
          customer_ratings?: Json | null
          date?: string
          delivery_user_id?: string
          id?: string
          online_time_minutes?: number
          peak_hours_worked?: number
          total_bonuses?: number
          total_deliveries?: number
          total_distance_km?: number
          total_earnings?: number
          total_tips?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_analytics_daily_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_assignment_criteria: {
        Row: {
          created_at: string | null
          id: string
          max_assignment_time_minutes: number | null
          max_distance_km: number | null
          preferred_driver_rating: number | null
          priority_factors: Json | null
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_assignment_time_minutes?: number | null
          max_distance_km?: number | null
          preferred_driver_rating?: number | null
          priority_factors?: Json | null
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          max_assignment_time_minutes?: number | null
          max_distance_km?: number | null
          preferred_driver_rating?: number | null
          priority_factors?: Json | null
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_assignment_criteria_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_assignment_history: {
        Row: {
          action: string
          assignment_duration_seconds: number | null
          created_at: string | null
          delivery_assignment_id: string
          delivery_user_id: string | null
          distance_km: number | null
          driver_rating: number | null
          id: string
          metadata: Json | null
          priority_score: number | null
          reason: string | null
        }
        Insert: {
          action: string
          assignment_duration_seconds?: number | null
          created_at?: string | null
          delivery_assignment_id: string
          delivery_user_id?: string | null
          distance_km?: number | null
          driver_rating?: number | null
          id?: string
          metadata?: Json | null
          priority_score?: number | null
          reason?: string | null
        }
        Update: {
          action?: string
          assignment_duration_seconds?: number | null
          created_at?: string | null
          delivery_assignment_id?: string
          delivery_user_id?: string | null
          distance_km?: number | null
          driver_rating?: number | null
          id?: string
          metadata?: Json | null
          priority_score?: number | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_assignment_history_delivery_assignment_id_fkey"
            columns: ["delivery_assignment_id"]
            isOneToOne: false
            referencedRelation: "delivery_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_assignment_history_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_assignment_rejections: {
        Row: {
          assignment_id: string
          created_at: string
          id: string
          order_id: string
          reason: string | null
        }
        Insert: {
          assignment_id: string
          created_at?: string
          id?: string
          order_id: string
          reason?: string | null
        }
        Update: {
          assignment_id?: string
          created_at?: string
          id?: string
          order_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_assignment_rejections_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "delivery_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_assignments: {
        Row: {
          assignment_attempt: number | null
          auto_assigned: boolean | null
          created_at: string
          delivery_time: string | null
          delivery_user_id: string | null
          estimated_delivery_time: string | null
          expires_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          max_attempts: number | null
          order_id: string
          pickup_time: string | null
          priority_score: number | null
          restaurant_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assignment_attempt?: number | null
          auto_assigned?: boolean | null
          created_at?: string
          delivery_time?: string | null
          delivery_user_id?: string | null
          estimated_delivery_time?: string | null
          expires_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          max_attempts?: number | null
          order_id: string
          pickup_time?: string | null
          priority_score?: number | null
          restaurant_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assignment_attempt?: number | null
          auto_assigned?: boolean | null
          created_at?: string
          delivery_time?: string | null
          delivery_user_id?: string | null
          estimated_delivery_time?: string | null
          expires_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          max_attempts?: number | null
          order_id?: string
          pickup_time?: string | null
          priority_score?: number | null
          restaurant_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_assignments_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_assignments_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_auto_status_settings: {
        Row: {
          auto_active_in_work_zone: boolean
          auto_active_on_schedule: boolean
          auto_break_status_during_breaks: boolean
          auto_inactive_off_schedule: boolean
          auto_inactive_outside_work_zone: boolean
          created_at: string
          delivery_user_id: string
          enable_location_based_status: boolean
          enable_time_based_status: boolean
          id: string
          post_shift_buffer_minutes: number | null
          pre_shift_buffer_minutes: number | null
          updated_at: string
          work_zone_latitude: number | null
          work_zone_longitude: number | null
          work_zone_radius_meters: number | null
        }
        Insert: {
          auto_active_in_work_zone?: boolean
          auto_active_on_schedule?: boolean
          auto_break_status_during_breaks?: boolean
          auto_inactive_off_schedule?: boolean
          auto_inactive_outside_work_zone?: boolean
          created_at?: string
          delivery_user_id: string
          enable_location_based_status?: boolean
          enable_time_based_status?: boolean
          id?: string
          post_shift_buffer_minutes?: number | null
          pre_shift_buffer_minutes?: number | null
          updated_at?: string
          work_zone_latitude?: number | null
          work_zone_longitude?: number | null
          work_zone_radius_meters?: number | null
        }
        Update: {
          auto_active_in_work_zone?: boolean
          auto_active_on_schedule?: boolean
          auto_break_status_during_breaks?: boolean
          auto_inactive_off_schedule?: boolean
          auto_inactive_outside_work_zone?: boolean
          created_at?: string
          delivery_user_id?: string
          enable_location_based_status?: boolean
          enable_time_based_status?: boolean
          id?: string
          post_shift_buffer_minutes?: number | null
          pre_shift_buffer_minutes?: number | null
          updated_at?: string
          work_zone_latitude?: number | null
          work_zone_longitude?: number | null
          work_zone_radius_meters?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_auto_status_delivery_user"
            columns: ["delivery_user_id"]
            isOneToOne: true
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_availability: {
        Row: {
          created_at: string
          day_of_week: number
          delivery_user_id: string
          end_time: string
          id: string
          is_recurring: boolean | null
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          delivery_user_id: string
          end_time: string
          id?: string
          is_recurring?: boolean | null
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          delivery_user_id?: string
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_availability_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_availability_schedules: {
        Row: {
          created_at: string
          day_of_week: number
          delivery_user_id: string
          end_time: string
          id: string
          is_active: boolean
          start_time: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          delivery_user_id: string
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          delivery_user_id?: string
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_availability_delivery_user"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_break_logs: {
        Row: {
          actual_duration_minutes: number | null
          break_setting_id: string | null
          break_type: string
          created_at: string
          delivery_user_id: string
          end_time: string | null
          id: string
          location_latitude: number | null
          location_longitude: number | null
          notes: string | null
          start_time: string
          status: string
        }
        Insert: {
          actual_duration_minutes?: number | null
          break_setting_id?: string | null
          break_type: string
          created_at?: string
          delivery_user_id: string
          end_time?: string | null
          id?: string
          location_latitude?: number | null
          location_longitude?: number | null
          notes?: string | null
          start_time: string
          status?: string
        }
        Update: {
          actual_duration_minutes?: number | null
          break_setting_id?: string | null
          break_type?: string
          created_at?: string
          delivery_user_id?: string
          end_time?: string | null
          id?: string
          location_latitude?: number | null
          location_longitude?: number | null
          notes?: string | null
          start_time?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_break_logs_break_setting_id_fkey"
            columns: ["break_setting_id"]
            isOneToOne: false
            referencedRelation: "delivery_break_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_break_logs_delivery_user"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_break_settings: {
        Row: {
          auto_break_reminder: boolean
          break_type: string
          created_at: string
          delivery_user_id: string
          duration_minutes: number
          id: string
          is_active: boolean
          is_flexible: boolean
          max_break_count_per_day: number | null
          minimum_interval_between_breaks_minutes: number | null
          scheduled_time: string | null
          updated_at: string
        }
        Insert: {
          auto_break_reminder?: boolean
          break_type: string
          created_at?: string
          delivery_user_id: string
          duration_minutes: number
          id?: string
          is_active?: boolean
          is_flexible?: boolean
          max_break_count_per_day?: number | null
          minimum_interval_between_breaks_minutes?: number | null
          scheduled_time?: string | null
          updated_at?: string
        }
        Update: {
          auto_break_reminder?: boolean
          break_type?: string
          created_at?: string
          delivery_user_id?: string
          duration_minutes?: number
          id?: string
          is_active?: boolean
          is_flexible?: boolean
          max_break_count_per_day?: number | null
          minimum_interval_between_breaks_minutes?: number | null
          scheduled_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_break_settings_delivery_user"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_confirmations: {
        Row: {
          confirmation_type: string
          confirmed_at: string | null
          confirmed_by: string
          delivery_assignment_id: string
          id: string
          location_latitude: number | null
          location_longitude: number | null
          notes: string | null
          photo_urls: string[]
        }
        Insert: {
          confirmation_type: string
          confirmed_at?: string | null
          confirmed_by: string
          delivery_assignment_id: string
          id?: string
          location_latitude?: number | null
          location_longitude?: number | null
          notes?: string | null
          photo_urls: string[]
        }
        Update: {
          confirmation_type?: string
          confirmed_at?: string | null
          confirmed_by?: string
          delivery_assignment_id?: string
          id?: string
          location_latitude?: number | null
          location_longitude?: number | null
          notes?: string | null
          photo_urls?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "delivery_confirmations_delivery_assignment_id_fkey"
            columns: ["delivery_assignment_id"]
            isOneToOne: false
            referencedRelation: "delivery_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_data_sync_settings: {
        Row: {
          auto_cleanup_enabled: boolean
          auto_resolve_conflicts: boolean
          auto_sync_enabled: boolean
          batch_sync_enabled: boolean
          battery_optimized_sync: boolean
          created_at: string
          delivery_user_id: string
          id: string
          location_conflict_strategy: string
          location_storage_duration_days: number
          max_batch_size: number
          max_offline_locations: number
          priority_sync_enabled: boolean
          prompt_for_manual_resolution: boolean
          settings_conflict_strategy: string
          storage_limit_mb: number
          sync_compression_enabled: boolean
          sync_frequency_minutes: number
          sync_on_app_foreground: boolean
          sync_on_network_change: boolean
          updated_at: string
          wifi_only_sync: boolean
        }
        Insert: {
          auto_cleanup_enabled?: boolean
          auto_resolve_conflicts?: boolean
          auto_sync_enabled?: boolean
          batch_sync_enabled?: boolean
          battery_optimized_sync?: boolean
          created_at?: string
          delivery_user_id: string
          id?: string
          location_conflict_strategy?: string
          location_storage_duration_days?: number
          max_batch_size?: number
          max_offline_locations?: number
          priority_sync_enabled?: boolean
          prompt_for_manual_resolution?: boolean
          settings_conflict_strategy?: string
          storage_limit_mb?: number
          sync_compression_enabled?: boolean
          sync_frequency_minutes?: number
          sync_on_app_foreground?: boolean
          sync_on_network_change?: boolean
          updated_at?: string
          wifi_only_sync?: boolean
        }
        Update: {
          auto_cleanup_enabled?: boolean
          auto_resolve_conflicts?: boolean
          auto_sync_enabled?: boolean
          batch_sync_enabled?: boolean
          battery_optimized_sync?: boolean
          created_at?: string
          delivery_user_id?: string
          id?: string
          location_conflict_strategy?: string
          location_storage_duration_days?: number
          max_batch_size?: number
          max_offline_locations?: number
          priority_sync_enabled?: boolean
          prompt_for_manual_resolution?: boolean
          settings_conflict_strategy?: string
          storage_limit_mb?: number
          sync_compression_enabled?: boolean
          sync_frequency_minutes?: number
          sync_on_app_foreground?: boolean
          sync_on_network_change?: boolean
          updated_at?: string
          wifi_only_sync?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "fk_data_sync_delivery_user"
            columns: ["delivery_user_id"]
            isOneToOne: true
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_documents: {
        Row: {
          created_at: string
          delivery_user_id: string
          document_type: string
          expiry_date: string | null
          file_path: string
          id: string
          notes: string | null
          updated_at: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string
          delivery_user_id: string
          document_type: string
          expiry_date?: string | null
          file_path: string
          id?: string
          notes?: string | null
          updated_at?: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string
          delivery_user_id?: string
          document_type?: string
          expiry_date?: string | null
          file_path?: string
          id?: string
          notes?: string | null
          updated_at?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_documents_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_driver_availability: {
        Row: {
          availability_radius_km: number | null
          created_at: string | null
          current_delivery_count: number | null
          current_latitude: number | null
          current_longitude: number | null
          delivery_user_id: string
          id: string
          is_available: boolean | null
          last_location_update: string | null
          max_concurrent_deliveries: number | null
          updated_at: string | null
        }
        Insert: {
          availability_radius_km?: number | null
          created_at?: string | null
          current_delivery_count?: number | null
          current_latitude?: number | null
          current_longitude?: number | null
          delivery_user_id: string
          id?: string
          is_available?: boolean | null
          last_location_update?: string | null
          max_concurrent_deliveries?: number | null
          updated_at?: string | null
        }
        Update: {
          availability_radius_km?: number | null
          created_at?: string | null
          current_delivery_count?: number | null
          current_latitude?: number | null
          current_longitude?: number | null
          delivery_user_id?: string
          id?: string
          is_available?: boolean | null
          last_location_update?: string | null
          max_concurrent_deliveries?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_driver_availability_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: true
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_earnings: {
        Row: {
          base_amount: number
          bonus_amount: number | null
          created_at: string
          delivery_user_id: string
          id: string
          order_id: string | null
          payout_date: string | null
          status: string
          tip_amount: number | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          base_amount: number
          bonus_amount?: number | null
          created_at?: string
          delivery_user_id: string
          id?: string
          order_id?: string | null
          payout_date?: string | null
          status?: string
          tip_amount?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          base_amount?: number
          bonus_amount?: number | null
          created_at?: string
          delivery_user_id?: string
          id?: string
          order_id?: string | null
          payout_date?: string | null
          status?: string
          tip_amount?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_earnings_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_earnings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_earnings_detailed: {
        Row: {
          assignment_id: string | null
          base_fee: number
          bonus_amount: number
          created_at: string
          currency: string
          delivery_user_id: string
          distance_fee: number
          earned_at: string
          id: string
          order_id: string | null
          paid_at: string | null
          payment_method: string
          payout_batch_id: string | null
          penalty_amount: number
          status: string
          surge_multiplier: number
          time_fee: number
          tip_amount: number
          total_earnings: number
          updated_at: string
        }
        Insert: {
          assignment_id?: string | null
          base_fee?: number
          bonus_amount?: number
          created_at?: string
          currency?: string
          delivery_user_id: string
          distance_fee?: number
          earned_at: string
          id?: string
          order_id?: string | null
          paid_at?: string | null
          payment_method?: string
          payout_batch_id?: string | null
          penalty_amount?: number
          status?: string
          surge_multiplier?: number
          time_fee?: number
          tip_amount?: number
          total_earnings: number
          updated_at?: string
        }
        Update: {
          assignment_id?: string | null
          base_fee?: number
          bonus_amount?: number
          created_at?: string
          currency?: string
          delivery_user_id?: string
          distance_fee?: number
          earned_at?: string
          id?: string
          order_id?: string | null
          paid_at?: string | null
          payment_method?: string
          payout_batch_id?: string | null
          penalty_amount?: number
          status?: string
          surge_multiplier?: number
          time_fee?: number
          tip_amount?: number
          total_earnings?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_earnings_detailed_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "delivery_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_earnings_detailed_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_earnings_detailed_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_emergency_contacts: {
        Row: {
          contact_email: string | null
          contact_name: string
          contact_phone: string
          contact_priority: number
          created_at: string
          delivery_user_id: string
          id: string
          is_active: boolean
          is_primary: boolean
          relationship: string
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_name: string
          contact_phone: string
          contact_priority?: number
          created_at?: string
          delivery_user_id: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          relationship: string
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string
          contact_priority?: number
          created_at?: string
          delivery_user_id?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          relationship?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_emergency_contacts_delivery_user"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_eta_updates: {
        Row: {
          calculated_distance_km: number | null
          calculated_duration_minutes: number | null
          created_at: string | null
          delivery_assignment_id: string
          destination_lat: number | null
          destination_lng: number | null
          driver_location_lat: number | null
          driver_location_lng: number | null
          estimated_arrival: string
          id: string
          order_id: string
          traffic_factor: number | null
        }
        Insert: {
          calculated_distance_km?: number | null
          calculated_duration_minutes?: number | null
          created_at?: string | null
          delivery_assignment_id: string
          destination_lat?: number | null
          destination_lng?: number | null
          driver_location_lat?: number | null
          driver_location_lng?: number | null
          estimated_arrival: string
          id?: string
          order_id: string
          traffic_factor?: number | null
        }
        Update: {
          calculated_distance_km?: number | null
          calculated_duration_minutes?: number | null
          created_at?: string | null
          delivery_assignment_id?: string
          destination_lat?: number | null
          destination_lng?: number | null
          driver_location_lat?: number | null
          driver_location_lng?: number | null
          estimated_arrival?: string
          id?: string
          order_id?: string
          traffic_factor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_eta_updates_delivery_assignment_id_fkey"
            columns: ["delivery_assignment_id"]
            isOneToOne: false
            referencedRelation: "delivery_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_eta_updates_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_financial_reports: {
        Row: {
          created_at: string
          delivery_count: number
          delivery_user_id: string
          expenses: number
          fuel_costs: number
          generated_at: string
          gross_earnings: number
          hours_worked: number
          id: string
          maintenance_costs: number
          net_earnings: number
          performance_metrics: Json | null
          period_end: string
          period_start: string
          report_type: string
          tax_deductions: number
          total_bonuses: number
          total_penalties: number
          total_tips: number
        }
        Insert: {
          created_at?: string
          delivery_count?: number
          delivery_user_id: string
          expenses?: number
          fuel_costs?: number
          generated_at?: string
          gross_earnings?: number
          hours_worked?: number
          id?: string
          maintenance_costs?: number
          net_earnings?: number
          performance_metrics?: Json | null
          period_end: string
          period_start: string
          report_type: string
          tax_deductions?: number
          total_bonuses?: number
          total_penalties?: number
          total_tips?: number
        }
        Update: {
          created_at?: string
          delivery_count?: number
          delivery_user_id?: string
          expenses?: number
          fuel_costs?: number
          generated_at?: string
          gross_earnings?: number
          hours_worked?: number
          id?: string
          maintenance_costs?: number
          net_earnings?: number
          performance_metrics?: Json | null
          period_end?: string
          period_start?: string
          report_type?: string
          tax_deductions?: number
          total_bonuses?: number
          total_penalties?: number
          total_tips?: number
        }
        Relationships: [
          {
            foreignKeyName: "delivery_financial_reports_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_info: {
        Row: {
          address: string
          city: string
          created_at: string
          delivery_info_user_id: string
          full_name: string
          id: string
          phone: string
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          delivery_info_user_id: string
          full_name: string
          id?: string
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          delivery_info_user_id?: string
          full_name?: string
          id?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      delivery_location_accuracy_settings: {
        Row: {
          accuracy_weight: number | null
          confidence_scoring_enabled: boolean
          created_at: string
          delivery_user_id: string
          enable_backup_providers: boolean
          enable_location_validation: boolean
          fallback_provider: string | null
          id: string
          max_distance_jump_meters: number | null
          max_speed_threshold_mps: number | null
          minimum_accuracy_threshold: number
          minimum_confidence_score: number | null
          network_weight: number | null
          primary_provider: string | null
          provider_timeout_seconds: number | null
          recency_weight: number | null
          reject_low_accuracy_locations: boolean
          source_weight: number | null
          strict_accuracy_enforcement: boolean
          updated_at: string
          validate_distance_jumps: boolean
          validate_speed_consistency: boolean
        }
        Insert: {
          accuracy_weight?: number | null
          confidence_scoring_enabled?: boolean
          created_at?: string
          delivery_user_id: string
          enable_backup_providers?: boolean
          enable_location_validation?: boolean
          fallback_provider?: string | null
          id?: string
          max_distance_jump_meters?: number | null
          max_speed_threshold_mps?: number | null
          minimum_accuracy_threshold?: number
          minimum_confidence_score?: number | null
          network_weight?: number | null
          primary_provider?: string | null
          provider_timeout_seconds?: number | null
          recency_weight?: number | null
          reject_low_accuracy_locations?: boolean
          source_weight?: number | null
          strict_accuracy_enforcement?: boolean
          updated_at?: string
          validate_distance_jumps?: boolean
          validate_speed_consistency?: boolean
        }
        Update: {
          accuracy_weight?: number | null
          confidence_scoring_enabled?: boolean
          created_at?: string
          delivery_user_id?: string
          enable_backup_providers?: boolean
          enable_location_validation?: boolean
          fallback_provider?: string | null
          id?: string
          max_distance_jump_meters?: number | null
          max_speed_threshold_mps?: number | null
          minimum_accuracy_threshold?: number
          minimum_confidence_score?: number | null
          network_weight?: number | null
          primary_provider?: string | null
          provider_timeout_seconds?: number | null
          recency_weight?: number | null
          reject_low_accuracy_locations?: boolean
          source_weight?: number | null
          strict_accuracy_enforcement?: boolean
          updated_at?: string
          validate_distance_jumps?: boolean
          validate_speed_consistency?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "fk_location_accuracy_delivery_user"
            columns: ["delivery_user_id"]
            isOneToOne: true
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_location_quality_logs: {
        Row: {
          accuracy: number | null
          accuracy_score: number | null
          backup_provider_used: boolean
          battery_level: number | null
          confidence_score: number | null
          created_at: string
          delivery_user_id: string
          id: string
          is_moving: boolean | null
          latitude: number
          location_provider: string | null
          longitude: number
          network_quality: string | null
          network_score: number | null
          network_type: string | null
          recency_score: number | null
          source_score: number | null
          timestamp_recorded: string
          validation_errors: string[] | null
          validation_passed: boolean
        }
        Insert: {
          accuracy?: number | null
          accuracy_score?: number | null
          backup_provider_used?: boolean
          battery_level?: number | null
          confidence_score?: number | null
          created_at?: string
          delivery_user_id: string
          id?: string
          is_moving?: boolean | null
          latitude: number
          location_provider?: string | null
          longitude: number
          network_quality?: string | null
          network_score?: number | null
          network_type?: string | null
          recency_score?: number | null
          source_score?: number | null
          timestamp_recorded: string
          validation_errors?: string[] | null
          validation_passed?: boolean
        }
        Update: {
          accuracy?: number | null
          accuracy_score?: number | null
          backup_provider_used?: boolean
          battery_level?: number | null
          confidence_score?: number | null
          created_at?: string
          delivery_user_id?: string
          id?: string
          is_moving?: boolean | null
          latitude?: number
          location_provider?: string | null
          longitude?: number
          network_quality?: string | null
          network_score?: number | null
          network_type?: string | null
          recency_score?: number | null
          source_score?: number | null
          timestamp_recorded?: string
          validation_errors?: string[] | null
          validation_passed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "fk_location_quality_delivery_user"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_location_settings: {
        Row: {
          auto_stop_sharing_after_delivery: boolean | null
          background_location_enabled: boolean | null
          battery_optimization_enabled: boolean | null
          created_at: string | null
          custom_geofence_zones: Json | null
          delivery_user_id: string
          delivery_zone_radius: number | null
          geofence_entry_notifications: boolean | null
          geofence_exit_notifications: boolean | null
          high_accuracy_interval: number | null
          high_accuracy_threshold: number | null
          id: string
          location_sharing_duration: number | null
          low_accuracy_interval: number | null
          low_accuracy_threshold: number | null
          medium_accuracy_interval: number | null
          medium_accuracy_threshold: number | null
          movement_detection_sensitivity: string | null
          sharing_precision_level: string | null
          updated_at: string | null
        }
        Insert: {
          auto_stop_sharing_after_delivery?: boolean | null
          background_location_enabled?: boolean | null
          battery_optimization_enabled?: boolean | null
          created_at?: string | null
          custom_geofence_zones?: Json | null
          delivery_user_id: string
          delivery_zone_radius?: number | null
          geofence_entry_notifications?: boolean | null
          geofence_exit_notifications?: boolean | null
          high_accuracy_interval?: number | null
          high_accuracy_threshold?: number | null
          id?: string
          location_sharing_duration?: number | null
          low_accuracy_interval?: number | null
          low_accuracy_threshold?: number | null
          medium_accuracy_interval?: number | null
          medium_accuracy_threshold?: number | null
          movement_detection_sensitivity?: string | null
          sharing_precision_level?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_stop_sharing_after_delivery?: boolean | null
          background_location_enabled?: boolean | null
          battery_optimization_enabled?: boolean | null
          created_at?: string | null
          custom_geofence_zones?: Json | null
          delivery_user_id?: string
          delivery_zone_radius?: number | null
          geofence_entry_notifications?: boolean | null
          geofence_exit_notifications?: boolean | null
          high_accuracy_interval?: number | null
          high_accuracy_threshold?: number | null
          id?: string
          location_sharing_duration?: number | null
          low_accuracy_interval?: number | null
          low_accuracy_threshold?: number | null
          medium_accuracy_interval?: number | null
          medium_accuracy_threshold?: number | null
          movement_detection_sensitivity?: string | null
          sharing_precision_level?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_location_settings_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: true
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_location_tracking: {
        Row: {
          accuracy: number | null
          altitude: number | null
          battery_level: number | null
          created_at: string | null
          delivery_assignment_id: string
          delivery_user_id: string
          heading: number | null
          id: string
          latitude: number
          longitude: number
          network_type: string | null
          speed: number | null
          timestamp: string
        }
        Insert: {
          accuracy?: number | null
          altitude?: number | null
          battery_level?: number | null
          created_at?: string | null
          delivery_assignment_id: string
          delivery_user_id: string
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          network_type?: string | null
          speed?: number | null
          timestamp?: string
        }
        Update: {
          accuracy?: number | null
          altitude?: number | null
          battery_level?: number | null
          created_at?: string | null
          delivery_assignment_id?: string
          delivery_user_id?: string
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          network_type?: string | null
          speed?: number | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_location_tracking_delivery_assignment_id_fkey"
            columns: ["delivery_assignment_id"]
            isOneToOne: false
            referencedRelation: "delivery_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_location_tracking_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_location_updates: {
        Row: {
          accuracy: number | null
          assignment_id: string | null
          battery_level: number | null
          created_at: string | null
          delivery_user_id: string | null
          heading: number | null
          id: string
          is_moving: boolean | null
          latitude: number
          location_source: string | null
          longitude: number
          speed: number | null
          timestamp: string | null
        }
        Insert: {
          accuracy?: number | null
          assignment_id?: string | null
          battery_level?: number | null
          created_at?: string | null
          delivery_user_id?: string | null
          heading?: number | null
          id?: string
          is_moving?: boolean | null
          latitude: number
          location_source?: string | null
          longitude: number
          speed?: number | null
          timestamp?: string | null
        }
        Update: {
          accuracy?: number | null
          assignment_id?: string | null
          battery_level?: number | null
          created_at?: string | null
          delivery_user_id?: string | null
          heading?: number | null
          id?: string
          is_moving?: boolean | null
          latitude?: number
          location_source?: string | null
          longitude?: number
          speed?: number | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_location_updates_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "delivery_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_location_updates_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_locations: {
        Row: {
          assignment_id: string
          id: string
          latitude: number
          longitude: number
          timestamp: string
        }
        Insert: {
          assignment_id: string
          id?: string
          latitude: number
          longitude: number
          timestamp?: string
        }
        Update: {
          assignment_id?: string
          id?: string
          latitude?: number
          longitude?: number
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_locations_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "delivery_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_management_logs: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          target_id: string | null
          target_type: string
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type: string
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      delivery_metrics: {
        Row: {
          acceptance_rate: number | null
          avg_delivery_time: number | null
          avg_pickup_time: number | null
          completion_rate: number | null
          created_at: string
          date: string
          delivery_user_id: string
          id: string
          on_time_percentage: number | null
          updated_at: string
        }
        Insert: {
          acceptance_rate?: number | null
          avg_delivery_time?: number | null
          avg_pickup_time?: number | null
          completion_rate?: number | null
          created_at?: string
          date: string
          delivery_user_id: string
          id?: string
          on_time_percentage?: number | null
          updated_at?: string
        }
        Update: {
          acceptance_rate?: number | null
          avg_delivery_time?: number | null
          avg_pickup_time?: number | null
          completion_rate?: number | null
          created_at?: string
          date?: string
          delivery_user_id?: string
          id?: string
          on_time_percentage?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_metrics_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_notification_preferences: {
        Row: {
          created_at: string | null
          delivery_user_id: string
          email_delivery_assignments: boolean | null
          email_order_updates: boolean | null
          email_payment_notifications: boolean | null
          email_system_alerts: boolean | null
          email_weekly_summary: boolean | null
          id: string
          push_delivery_assignments: boolean | null
          push_order_updates: boolean | null
          push_payment_notifications: boolean | null
          push_system_alerts: boolean | null
          quiet_hours_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sms_delivery_assignments: boolean | null
          sms_order_updates: boolean | null
          sms_payment_notifications: boolean | null
          sms_system_alerts: boolean | null
          sound_delivery_assignments: string | null
          sound_enabled: boolean | null
          sound_order_updates: string | null
          sound_payment_notifications: string | null
          sound_system_alerts: string | null
          updated_at: string | null
          vibration_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          delivery_user_id: string
          email_delivery_assignments?: boolean | null
          email_order_updates?: boolean | null
          email_payment_notifications?: boolean | null
          email_system_alerts?: boolean | null
          email_weekly_summary?: boolean | null
          id?: string
          push_delivery_assignments?: boolean | null
          push_order_updates?: boolean | null
          push_payment_notifications?: boolean | null
          push_system_alerts?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_delivery_assignments?: boolean | null
          sms_order_updates?: boolean | null
          sms_payment_notifications?: boolean | null
          sms_system_alerts?: boolean | null
          sound_delivery_assignments?: string | null
          sound_enabled?: boolean | null
          sound_order_updates?: string | null
          sound_payment_notifications?: string | null
          sound_system_alerts?: string | null
          updated_at?: string | null
          vibration_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          delivery_user_id?: string
          email_delivery_assignments?: boolean | null
          email_order_updates?: boolean | null
          email_payment_notifications?: boolean | null
          email_system_alerts?: boolean | null
          email_weekly_summary?: boolean | null
          id?: string
          push_delivery_assignments?: boolean | null
          push_order_updates?: boolean | null
          push_payment_notifications?: boolean | null
          push_system_alerts?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_delivery_assignments?: boolean | null
          sms_order_updates?: boolean | null
          sms_payment_notifications?: boolean | null
          sms_system_alerts?: boolean | null
          sound_delivery_assignments?: string | null
          sound_enabled?: boolean | null
          sound_order_updates?: string | null
          sound_payment_notifications?: string | null
          sound_system_alerts?: string | null
          updated_at?: string | null
          vibration_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_notification_preferences_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: true
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_payment_details: {
        Row: {
          account_name: string
          account_number: string
          bank_name: string
          created_at: string
          delivery_user_id: string
          has_accepted_terms: boolean | null
          id: string
          routing_number: string
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          bank_name: string
          created_at?: string
          delivery_user_id: string
          has_accepted_terms?: boolean | null
          id?: string
          routing_number: string
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_name?: string
          created_at?: string
          delivery_user_id?: string
          has_accepted_terms?: boolean | null
          id?: string
          routing_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_payment_details_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: true
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_performance_alerts: {
        Row: {
          actual_value: number | null
          alert_type: string
          created_at: string | null
          delivery_user_id: string | null
          description: string
          id: string
          is_resolved: boolean | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          threshold_value: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_value?: number | null
          alert_type: string
          created_at?: string | null
          delivery_user_id?: string | null
          description: string
          id?: string
          is_resolved?: boolean | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          threshold_value?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_value?: number | null
          alert_type?: string
          created_at?: string | null
          delivery_user_id?: string | null
          description?: string
          id?: string
          is_resolved?: boolean | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          threshold_value?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_performance_alerts_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_performance_metrics: {
        Row: {
          acceptance_rate: number
          bonuses_earned: number
          cancellation_rate: number
          completion_rate: number
          created_at: string
          customer_satisfaction: number
          delivery_user_id: string
          earnings_per_delivery: number
          earnings_per_hour: number
          efficiency_score: number
          id: string
          metric_date: string
          on_time_rate: number
          peak_hours_bonus: number
          penalties_count: number
          total_hours_worked: number
          updated_at: string
        }
        Insert: {
          acceptance_rate?: number
          bonuses_earned?: number
          cancellation_rate?: number
          completion_rate?: number
          created_at?: string
          customer_satisfaction?: number
          delivery_user_id: string
          earnings_per_delivery?: number
          earnings_per_hour?: number
          efficiency_score?: number
          id?: string
          metric_date: string
          on_time_rate?: number
          peak_hours_bonus?: number
          penalties_count?: number
          total_hours_worked?: number
          updated_at?: string
        }
        Update: {
          acceptance_rate?: number
          bonuses_earned?: number
          cancellation_rate?: number
          completion_rate?: number
          created_at?: string
          customer_satisfaction?: number
          delivery_user_id?: string
          earnings_per_delivery?: number
          earnings_per_hour?: number
          efficiency_score?: number
          id?: string
          metric_date?: string
          on_time_rate?: number
          peak_hours_bonus?: number
          penalties_count?: number
          total_hours_worked?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_performance_metrics_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_id: string
          delivery_assignment_id: string
          delivery_user_id: string
          id: string
          order_id: string
          rating: number
          rating_categories: Json | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_id: string
          delivery_assignment_id: string
          delivery_user_id: string
          id?: string
          order_id: string
          rating: number
          rating_categories?: Json | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string
          delivery_assignment_id?: string
          delivery_user_id?: string
          id?: string
          order_id?: string
          rating?: number
          rating_categories?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_ratings_delivery_assignment_id_fkey"
            columns: ["delivery_assignment_id"]
            isOneToOne: false
            referencedRelation: "delivery_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_ratings_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_ratings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_sync_conflicts: {
        Row: {
          auto_resolvable: boolean
          conflict_score: number | null
          conflict_type: string
          created_at: string
          delivery_user_id: string
          id: string
          local_data: Json
          merged_data: Json | null
          requires_user_input: boolean
          resolution_strategy: string
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          resource_id: string | null
          resource_type: string | null
          server_data: Json
          sync_log_id: string | null
        }
        Insert: {
          auto_resolvable?: boolean
          conflict_score?: number | null
          conflict_type: string
          created_at?: string
          delivery_user_id: string
          id?: string
          local_data: Json
          merged_data?: Json | null
          requires_user_input?: boolean
          resolution_strategy: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          resource_id?: string | null
          resource_type?: string | null
          server_data: Json
          sync_log_id?: string | null
        }
        Update: {
          auto_resolvable?: boolean
          conflict_score?: number | null
          conflict_type?: string
          created_at?: string
          delivery_user_id?: string
          id?: string
          local_data?: Json
          merged_data?: Json | null
          requires_user_input?: boolean
          resolution_strategy?: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          resource_id?: string | null
          resource_type?: string | null
          server_data?: Json
          sync_log_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_sync_conflicts_delivery_user"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sync_conflicts_log"
            columns: ["sync_log_id"]
            isOneToOne: false
            referencedRelation: "delivery_sync_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_sync_logs: {
        Row: {
          battery_level: number | null
          conflicts_detected: number | null
          conflicts_resolved: number | null
          connection_quality: string | null
          created_at: string
          data_size_kb: number | null
          delivery_user_id: string
          duration_ms: number | null
          end_time: string | null
          error_details: Json | null
          error_message: string | null
          errors_encountered: number | null
          id: string
          locations_synced: number | null
          network_type: string | null
          operation_type: string
          start_time: string
          success: boolean
          sync_trigger: string | null
          sync_type: string
        }
        Insert: {
          battery_level?: number | null
          conflicts_detected?: number | null
          conflicts_resolved?: number | null
          connection_quality?: string | null
          created_at?: string
          data_size_kb?: number | null
          delivery_user_id: string
          duration_ms?: number | null
          end_time?: string | null
          error_details?: Json | null
          error_message?: string | null
          errors_encountered?: number | null
          id?: string
          locations_synced?: number | null
          network_type?: string | null
          operation_type: string
          start_time: string
          success?: boolean
          sync_trigger?: string | null
          sync_type: string
        }
        Update: {
          battery_level?: number | null
          conflicts_detected?: number | null
          conflicts_resolved?: number | null
          connection_quality?: string | null
          created_at?: string
          data_size_kb?: number | null
          delivery_user_id?: string
          duration_ms?: number | null
          end_time?: string | null
          error_details?: Json | null
          error_message?: string | null
          errors_encountered?: number | null
          id?: string
          locations_synced?: number | null
          network_type?: string | null
          operation_type?: string
          start_time?: string
          success?: boolean
          sync_trigger?: string | null
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_sync_logs_delivery_user"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_users: {
        Row: {
          average_rating: number | null
          created_at: string
          delivery_users_user_id: string
          first_name: string
          id: string
          is_approved: boolean | null
          last_name: string
          latitude: number | null
          longitude: number | null
          phone: string
          status: string
          total_deliveries: number | null
          updated_at: string
        }
        Insert: {
          average_rating?: number | null
          created_at?: string
          delivery_users_user_id: string
          first_name: string
          id?: string
          is_approved?: boolean | null
          last_name: string
          latitude?: number | null
          longitude?: number | null
          phone: string
          status?: string
          total_deliveries?: number | null
          updated_at?: string
        }
        Update: {
          average_rating?: number | null
          created_at?: string
          delivery_users_user_id?: string
          first_name?: string
          id?: string
          is_approved?: boolean | null
          last_name?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string
          status?: string
          total_deliveries?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      delivery_vehicles: {
        Row: {
          color: string | null
          created_at: string
          delivery_user_id: string
          id: string
          insurance_expiry: string | null
          insurance_number: string | null
          license_plate: string | null
          make: string | null
          model: string | null
          type: string
          updated_at: string
          year: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          delivery_user_id: string
          id?: string
          insurance_expiry?: string | null
          insurance_number?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          type: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          delivery_user_id?: string
          id?: string
          insurance_expiry?: string | null
          insurance_number?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          type?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_vehicles_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_weekly_summaries: {
        Row: {
          average_hourly_rate: number
          best_day_date: string | null
          best_day_earnings: number
          created_at: string
          delivery_user_id: string
          efficiency_rating: number
          goal_achievement_percentage: number
          id: string
          total_bonuses: number
          total_deliveries: number
          total_earnings: number
          total_hours: number
          total_tips: number
          updated_at: string
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          average_hourly_rate?: number
          best_day_date?: string | null
          best_day_earnings?: number
          created_at?: string
          delivery_user_id: string
          efficiency_rating?: number
          goal_achievement_percentage?: number
          id?: string
          total_bonuses?: number
          total_deliveries?: number
          total_earnings?: number
          total_hours?: number
          total_tips?: number
          updated_at?: string
          week_end_date: string
          week_start_date: string
        }
        Update: {
          average_hourly_rate?: number
          best_day_date?: string | null
          best_day_earnings?: number
          created_at?: string
          delivery_user_id?: string
          efficiency_rating?: number
          goal_achievement_percentage?: number
          id?: string
          total_bonuses?: number
          total_deliveries?: number
          total_earnings?: number
          total_hours?: number
          total_tips?: number
          updated_at?: string
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_weekly_summaries_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_zones: {
        Row: {
          base_delivery_fee: number | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          max_delivery_distance: number | null
          name: string
          per_km_fee: number | null
          polygon: Json
          priority_level: number | null
          updated_at: string | null
        }
        Insert: {
          base_delivery_fee?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          max_delivery_distance?: number | null
          name: string
          per_km_fee?: number | null
          polygon: Json
          priority_level?: number | null
          updated_at?: string | null
        }
        Update: {
          base_delivery_fee?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          max_delivery_distance?: number | null
          name?: string
          per_km_fee?: number | null
          polygon?: Json
          priority_level?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dietary_tags: {
        Row: {
          description: string | null
          icon: string | null
          id: number
          name: string
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: number
          name: string
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      driver_approval_workflow: {
        Row: {
          approval_date: string | null
          created_at: string | null
          delivery_user_id: string | null
          id: string
          rejection_date: string | null
          rejection_reason: string | null
          review_notes: string | null
          reviewer_id: string | null
          stage: string
          status: string
          updated_at: string | null
        }
        Insert: {
          approval_date?: string | null
          created_at?: string | null
          delivery_user_id?: string | null
          id?: string
          rejection_date?: string | null
          rejection_reason?: string | null
          review_notes?: string | null
          reviewer_id?: string | null
          stage: string
          status: string
          updated_at?: string | null
        }
        Update: {
          approval_date?: string | null
          created_at?: string | null
          delivery_user_id?: string | null
          id?: string
          rejection_date?: string | null
          rejection_reason?: string | null
          review_notes?: string | null
          reviewer_id?: string | null
          stage?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_approval_workflow_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          created_at: string
          error_details: Json | null
          error_message: string
          error_type: string
          id: string
          is_critical: boolean
          is_resolved: boolean
          related_order_id: string | null
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          created_at?: string
          error_details?: Json | null
          error_message: string
          error_type: string
          id?: string
          is_critical?: boolean
          is_resolved?: boolean
          related_order_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          created_at?: string
          error_details?: Json | null
          error_message?: string
          error_type?: string
          id?: string
          is_critical?: boolean
          is_resolved?: boolean
          related_order_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_logs_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_instructions: {
        Row: {
          content_url: string | null
          created_at: string | null
          exercise_id: string | null
          id: string
          instruction_text: string | null
          instruction_type: string
          order_index: number
          updated_at: string | null
        }
        Insert: {
          content_url?: string | null
          created_at?: string | null
          exercise_id?: string | null
          id?: string
          instruction_text?: string | null
          instruction_type: string
          order_index?: number
          updated_at?: string | null
        }
        Update: {
          content_url?: string | null
          created_at?: string | null
          exercise_id?: string | null
          id?: string
          instruction_text?: string | null
          instruction_type?: string
          order_index?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_instructions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_library: {
        Row: {
          calories_per_minute: number | null
          category: string
          created_at: string | null
          description: string | null
          difficulty_level: string
          equipment_required: string[] | null
          id: string
          image_urls: string[] | null
          instructions: string[] | null
          is_active: boolean | null
          name: string
          primary_muscles: string[]
          secondary_muscles: string[] | null
          tips: string[] | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          calories_per_minute?: number | null
          category: string
          created_at?: string | null
          description?: string | null
          difficulty_level: string
          equipment_required?: string[] | null
          id?: string
          image_urls?: string[] | null
          instructions?: string[] | null
          is_active?: boolean | null
          name: string
          primary_muscles: string[]
          secondary_muscles?: string[] | null
          tips?: string[] | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          calories_per_minute?: number | null
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: string
          equipment_required?: string[] | null
          id?: string
          image_urls?: string[] | null
          instructions?: string[] | null
          is_active?: boolean | null
          name?: string
          primary_muscles?: string[]
          secondary_muscles?: string[] | null
          tips?: string[] | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      exercise_progress: {
        Row: {
          created_at: string | null
          exercise_name: string
          exercise_progress_user_id: string
          id: string
          max_reps: number | null
          max_weight: number | null
          one_rep_max: number | null
          recorded_date: string
          total_volume: number | null
          workout_log_id: string | null
        }
        Insert: {
          created_at?: string | null
          exercise_name: string
          exercise_progress_user_id: string
          id?: string
          max_reps?: number | null
          max_weight?: number | null
          one_rep_max?: number | null
          recorded_date: string
          total_volume?: number | null
          workout_log_id?: string | null
        }
        Update: {
          created_at?: string | null
          exercise_name?: string
          exercise_progress_user_id?: string
          id?: string
          max_reps?: number | null
          max_weight?: number | null
          one_rep_max?: number | null
          recorded_date?: string
          total_volume?: number | null
          workout_log_id?: string | null
        }
        Relationships: []
      }
      exercise_sets: {
        Row: {
          actual_distance: number | null
          actual_duration_seconds: number | null
          actual_reps: number | null
          actual_weight: number | null
          completed: boolean | null
          created_at: string | null
          exercise_id: string
          exercise_order: number
          id: string
          notes: string | null
          rest_duration_seconds: number | null
          rpe: number | null
          set_number: number
          set_type: string | null
          target_distance: number | null
          target_duration_seconds: number | null
          target_reps: number | null
          target_weight: number | null
          updated_at: string | null
          workout_log_id: string
        }
        Insert: {
          actual_distance?: number | null
          actual_duration_seconds?: number | null
          actual_reps?: number | null
          actual_weight?: number | null
          completed?: boolean | null
          created_at?: string | null
          exercise_id: string
          exercise_order: number
          id?: string
          notes?: string | null
          rest_duration_seconds?: number | null
          rpe?: number | null
          set_number: number
          set_type?: string | null
          target_distance?: number | null
          target_duration_seconds?: number | null
          target_reps?: number | null
          target_weight?: number | null
          updated_at?: string | null
          workout_log_id: string
        }
        Update: {
          actual_distance?: number | null
          actual_duration_seconds?: number | null
          actual_reps?: number | null
          actual_weight?: number | null
          completed?: boolean | null
          created_at?: string | null
          exercise_id?: string
          exercise_order?: number
          id?: string
          notes?: string | null
          rest_duration_seconds?: number | null
          rpe?: number | null
          set_number?: number
          set_type?: string | null
          target_distance?: number | null
          target_duration_seconds?: number | null
          target_reps?: number | null
          target_weight?: number | null
          updated_at?: string | null
          workout_log_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_sets_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs_enhanced"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string
          equipment_needed: string[] | null
          id: string
          image_url: string | null
          instructions: string[] | null
          muscle_groups: string[]
          name: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty: string
          equipment_needed?: string[] | null
          id?: string
          image_url?: string | null
          instructions?: string[] | null
          muscle_groups: string[]
          name: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string
          equipment_needed?: string[] | null
          id?: string
          image_url?: string | null
          instructions?: string[] | null
          muscle_groups?: string[]
          name?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      financial_reports: {
        Row: {
          average_order_value: number
          commission_rate: number | null
          created_at: string | null
          generated_at: string | null
          gross_revenue: number
          id: string
          net_revenue: number
          payment_methods_breakdown: Json | null
          period_end: string
          period_start: string
          report_type: string
          restaurant_id: string | null
          top_selling_items: Json | null
          total_commission: number
          total_fees: number
          total_orders: number
          total_refunds: number
        }
        Insert: {
          average_order_value?: number
          commission_rate?: number | null
          created_at?: string | null
          generated_at?: string | null
          gross_revenue?: number
          id?: string
          net_revenue?: number
          payment_methods_breakdown?: Json | null
          period_end: string
          period_start: string
          report_type: string
          restaurant_id?: string | null
          top_selling_items?: Json | null
          total_commission?: number
          total_fees?: number
          total_orders?: number
          total_refunds?: number
        }
        Update: {
          average_order_value?: number
          commission_rate?: number | null
          created_at?: string | null
          generated_at?: string | null
          gross_revenue?: number
          id?: string
          net_revenue?: number
          payment_methods_breakdown?: Json | null
          period_end?: string
          period_start?: string
          report_type?: string
          restaurant_id?: string | null
          top_selling_items?: Json | null
          total_commission?: number
          total_fees?: number
          total_orders?: number
          total_refunds?: number
        }
        Relationships: [
          {
            foreignKeyName: "financial_reports_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          delivery_user_id: string | null
          description: string | null
          external_transaction_id: string | null
          financial_transactions_user_id: string
          id: string
          metadata: Json | null
          net_amount: number | null
          order_id: string | null
          payment_method_id: string | null
          platform_commission: number | null
          processed_at: string | null
          provider: string
          provider_fee: number | null
          restaurant_id: string | null
          status: string
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          delivery_user_id?: string | null
          description?: string | null
          external_transaction_id?: string | null
          financial_transactions_user_id: string
          id?: string
          metadata?: Json | null
          net_amount?: number | null
          order_id?: string | null
          payment_method_id?: string | null
          platform_commission?: number | null
          processed_at?: string | null
          provider: string
          provider_fee?: number | null
          restaurant_id?: string | null
          status?: string
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          delivery_user_id?: string | null
          description?: string | null
          external_transaction_id?: string | null
          financial_transactions_user_id?: string
          id?: string
          metadata?: Json | null
          net_amount?: number | null
          order_id?: string | null
          payment_method_id?: string | null
          platform_commission?: number | null
          processed_at?: string | null
          provider?: string
          provider_fee?: number | null
          restaurant_id?: string | null
          status?: string
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      fitness_challenge_participants: {
        Row: {
          challenge_id: string | null
          completed_at: string | null
          current_progress: number | null
          fitness_challenge_participants_user_id: string
          id: string
          is_completed: boolean | null
          joined_at: string | null
        }
        Insert: {
          challenge_id?: string | null
          completed_at?: string | null
          current_progress?: number | null
          fitness_challenge_participants_user_id: string
          id?: string
          is_completed?: boolean | null
          joined_at?: string | null
        }
        Update: {
          challenge_id?: string | null
          completed_at?: string | null
          current_progress?: number | null
          fitness_challenge_participants_user_id?: string
          id?: string
          is_completed?: boolean | null
          joined_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fitness_challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "fitness_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      fitness_challenges: {
        Row: {
          challenge_type: string
          created_at: string | null
          created_by: string
          description: string | null
          end_date: string
          id: string
          is_public: boolean | null
          is_team_challenge: boolean | null
          max_participants: number | null
          participants_count: number | null
          prize_description: string | null
          start_date: string
          target_unit: string
          target_value: number
          title: string
          updated_at: string | null
        }
        Insert: {
          challenge_type: string
          created_at?: string | null
          created_by: string
          description?: string | null
          end_date: string
          id?: string
          is_public?: boolean | null
          is_team_challenge?: boolean | null
          max_participants?: number | null
          participants_count?: number | null
          prize_description?: string | null
          start_date: string
          target_unit: string
          target_value: number
          title: string
          updated_at?: string | null
        }
        Update: {
          challenge_type?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_date?: string
          id?: string
          is_public?: boolean | null
          is_team_challenge?: boolean | null
          max_participants?: number | null
          participants_count?: number | null
          prize_description?: string | null
          start_date?: string
          target_unit?: string
          target_value?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fitness_goals: {
        Row: {
          created_at: string
          description: string
          fitness_goals_user_id: string
          id: string
          name: string
          status: string
          target_body_fat: number | null
          target_date: string | null
          target_weight: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          fitness_goals_user_id: string
          id?: string
          name: string
          status?: string
          target_body_fat?: number | null
          target_date?: string | null
          target_weight?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          fitness_goals_user_id?: string
          id?: string
          name?: string
          status?: string
          target_body_fat?: number | null
          target_date?: string | null
          target_weight?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      fitness_goals_enhanced: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_value: number | null
          description: string | null
          fitness_goals_enhanced_user_id: string
          goal_type: string
          id: string
          priority_level: string | null
          progress_percentage: number | null
          status: string | null
          target_date: string | null
          target_metric: string
          target_value: number
          title: string
          unit: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          fitness_goals_enhanced_user_id: string
          goal_type: string
          id?: string
          priority_level?: string | null
          progress_percentage?: number | null
          status?: string | null
          target_date?: string | null
          target_metric: string
          target_value: number
          title: string
          unit: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          fitness_goals_enhanced_user_id?: string
          goal_type?: string
          id?: string
          priority_level?: string | null
          progress_percentage?: number | null
          status?: string | null
          target_date?: string | null
          target_metric?: string
          target_value?: number
          title?: string
          unit?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fitness_milestones: {
        Row: {
          achieved_date: string | null
          achieved_value: number | null
          created_at: string | null
          description: string | null
          goal_id: string
          id: string
          is_achieved: boolean | null
          reward: string | null
          target_date: string | null
          target_value: number
          title: string
          updated_at: string | null
        }
        Insert: {
          achieved_date?: string | null
          achieved_value?: number | null
          created_at?: string | null
          description?: string | null
          goal_id: string
          id?: string
          is_achieved?: boolean | null
          reward?: string | null
          target_date?: string | null
          target_value: number
          title: string
          updated_at?: string | null
        }
        Update: {
          achieved_date?: string | null
          achieved_value?: number | null
          created_at?: string | null
          description?: string | null
          goal_id?: string
          id?: string
          is_achieved?: boolean | null
          reward?: string | null
          target_date?: string | null
          target_value?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fitness_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "fitness_goals_enhanced"
            referencedColumns: ["id"]
          },
        ]
      }
      fitness_profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          dietary_preferences: string[] | null
          dietary_restrictions: string[] | null
          display_name: string | null
          fitness_goals: string[] | null
          fitness_level: string | null
          fitness_profiles_user_id: string
          gender: string | null
          goal_weight: number | null
          height: number | null
          id: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          dietary_preferences?: string[] | null
          dietary_restrictions?: string[] | null
          display_name?: string | null
          fitness_goals?: string[] | null
          fitness_level?: string | null
          fitness_profiles_user_id: string
          gender?: string | null
          goal_weight?: number | null
          height?: number | null
          id?: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          dietary_preferences?: string[] | null
          dietary_restrictions?: string[] | null
          display_name?: string | null
          fitness_goals?: string[] | null
          fitness_level?: string | null
          fitness_profiles_user_id?: string
          gender?: string | null
          goal_weight?: number | null
          height?: number | null
          id?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      food_item_prices: {
        Row: {
          base_portion_size: number | null
          created_at: string | null
          food_item_id: string | null
          food_name: string
          id: string
          is_active: boolean | null
          price_per_100g: number
          price_per_base_portion: number
          restaurant_id: string | null
          updated_at: string | null
        }
        Insert: {
          base_portion_size?: number | null
          created_at?: string | null
          food_item_id?: string | null
          food_name: string
          id?: string
          is_active?: boolean | null
          price_per_100g: number
          price_per_base_portion?: number
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          base_portion_size?: number | null
          created_at?: string | null
          food_item_id?: string | null
          food_name?: string
          id?: string
          is_active?: boolean | null
          price_per_100g?: number
          price_per_base_portion?: number
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_item_prices_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_item_prices_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      food_items: {
        Row: {
          base_unit: string
          category: string
          created_at: string | null
          id: string
          name: string
          nutritional_info: Json
          updated_at: string | null
        }
        Insert: {
          base_unit?: string
          category: string
          created_at?: string | null
          id?: string
          name: string
          nutritional_info?: Json
          updated_at?: string | null
        }
        Update: {
          base_unit?: string
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          nutritional_info?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      geofence_events: {
        Row: {
          accuracy: number | null
          assignment_id: string | null
          delivery_user_id: string | null
          event_type: string
          geofence_zone_id: string | null
          id: string
          latitude: number
          longitude: number
          metadata: Json | null
          timestamp: string | null
        }
        Insert: {
          accuracy?: number | null
          assignment_id?: string | null
          delivery_user_id?: string | null
          event_type: string
          geofence_zone_id?: string | null
          id?: string
          latitude: number
          longitude: number
          metadata?: Json | null
          timestamp?: string | null
        }
        Update: {
          accuracy?: number | null
          assignment_id?: string | null
          delivery_user_id?: string | null
          event_type?: string
          geofence_zone_id?: string | null
          id?: string
          latitude?: number
          longitude?: number
          metadata?: Json | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "geofence_events_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "delivery_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geofence_events_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geofence_events_geofence_zone_id_fkey"
            columns: ["geofence_zone_id"]
            isOneToOne: false
            referencedRelation: "geofence_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      geofence_zones: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          latitude: number
          longitude: number
          metadata: Json | null
          name: string
          order_id: string | null
          radius_meters: number
          restaurant_id: string | null
          updated_at: string | null
          zone_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude: number
          longitude: number
          metadata?: Json | null
          name: string
          order_id?: string | null
          radius_meters?: number
          restaurant_id?: string | null
          updated_at?: string | null
          zone_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          metadata?: Json | null
          name?: string
          order_id?: string | null
          radius_meters?: number
          restaurant_id?: string | null
          updated_at?: string | null
          zone_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "geofence_zones_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geofence_zones_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      global_meal_ratings: {
        Row: {
          avg_rating: number
          id: string
          last_updated: string
          meal_id: string
          rating_distribution: Json
          review_count: number
        }
        Insert: {
          avg_rating?: number
          id?: string
          last_updated?: string
          meal_id: string
          rating_distribution?: Json
          review_count?: number
        }
        Update: {
          avg_rating?: number
          id?: string
          last_updated?: string
          meal_id?: string
          rating_distribution?: Json
          review_count?: number
        }
        Relationships: []
      }
      ingredient_availability_checks: {
        Row: {
          available_quantity: number
          created_at: string | null
          id: string
          ingredient_name: string
          is_sufficient: boolean
          meal_id: string | null
          notes: string | null
          order_id: string
          required_quantity: number
          restaurant_id: string | null
          substitution_suggested: string | null
        }
        Insert: {
          available_quantity: number
          created_at?: string | null
          id?: string
          ingredient_name: string
          is_sufficient: boolean
          meal_id?: string | null
          notes?: string | null
          order_id: string
          required_quantity: number
          restaurant_id?: string | null
          substitution_suggested?: string | null
        }
        Update: {
          available_quantity?: number
          created_at?: string | null
          id?: string
          ingredient_name?: string
          is_sufficient?: boolean
          meal_id?: string | null
          notes?: string | null
          order_id?: string
          required_quantity?: number
          restaurant_id?: string | null
          substitution_suggested?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_availability_checks_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_availability_checks_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredient_substitutions: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean
          nutritional_impact: Json | null
          original_ingredient: string
          price_adjustment: number
          substitute_ingredient: string
          substitution_reason: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          nutritional_impact?: Json | null
          original_ingredient: string
          price_adjustment?: number
          substitute_ingredient: string
          substitution_reason?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          nutritional_impact?: Json | null
          original_ingredient?: string
          price_adjustment?: number
          substitute_ingredient?: string
          substitution_reason?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      location_anonymization_log: {
        Row: {
          anonymization_method: string | null
          anonymized_location_count: number | null
          id: string
          location_anonymization_log_user_id: string | null
          original_location_count: number | null
          precision_level: number | null
          processed_at: string | null
        }
        Insert: {
          anonymization_method?: string | null
          anonymized_location_count?: number | null
          id?: string
          location_anonymization_log_user_id?: string | null
          original_location_count?: number | null
          precision_level?: number | null
          processed_at?: string | null
        }
        Update: {
          anonymization_method?: string | null
          anonymized_location_count?: number | null
          id?: string
          location_anonymization_log_user_id?: string | null
          original_location_count?: number | null
          precision_level?: number | null
          processed_at?: string | null
        }
        Relationships: []
      }
      location_data_retention_policies: {
        Row: {
          auto_anonymize_after_days: number
          auto_delete_after_days: number
          created_at: string | null
          export_format: string | null
          id: string
          location_data_retention_policies_user_id: string | null
          retention_period_days: number
          updated_at: string | null
        }
        Insert: {
          auto_anonymize_after_days?: number
          auto_delete_after_days?: number
          created_at?: string | null
          export_format?: string | null
          id?: string
          location_data_retention_policies_user_id?: string | null
          retention_period_days?: number
          updated_at?: string | null
        }
        Update: {
          auto_anonymize_after_days?: number
          auto_delete_after_days?: number
          created_at?: string | null
          export_format?: string | null
          id?: string
          location_data_retention_policies_user_id?: string | null
          retention_period_days?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      location_sharing_permissions: {
        Row: {
          created_at: string | null
          customer_user_id: string
          delivery_assignment_id: string
          delivery_user_id: string
          id: string
          is_location_sharing_enabled: boolean | null
          privacy_level: string | null
          sharing_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_user_id: string
          delivery_assignment_id: string
          delivery_user_id: string
          id?: string
          is_location_sharing_enabled?: boolean | null
          privacy_level?: string | null
          sharing_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_user_id?: string
          delivery_assignment_id?: string
          delivery_user_id?: string
          id?: string
          is_location_sharing_enabled?: boolean | null
          privacy_level?: string | null
          sharing_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "location_sharing_permissions_delivery_assignment_id_fkey"
            columns: ["delivery_assignment_id"]
            isOneToOne: false
            referencedRelation: "delivery_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_sharing_permissions_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      meal_category_junction: {
        Row: {
          category_id: string
          meal_id: string
        }
        Insert: {
          category_id: string
          meal_id: string
        }
        Update: {
          category_id?: string
          meal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_category_junction_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "meal_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_customization_options: {
        Row: {
          created_at: string | null
          customization_type: string
          id: string
          is_active: boolean
          meal_id: string | null
          option_description: string | null
          option_name: string
          price_adjustment: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customization_type: string
          id?: string
          is_active?: boolean
          meal_id?: string | null
          option_description?: string | null
          option_name: string
          price_adjustment?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customization_type?: string
          id?: string
          is_active?: boolean
          meal_id?: string | null
          option_description?: string | null
          option_name?: string
          price_adjustment?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_customization_options_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_customizations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          meal_id: string | null
          name: string
          nutritional_impact: Json | null
          price_impact: number | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          meal_id?: string | null
          name: string
          nutritional_impact?: Json | null
          price_impact?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          meal_id?: string | null
          name?: string
          nutritional_impact?: Json | null
          price_impact?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meal_dietary_tags: {
        Row: {
          meal_id: string
          tag_id: number
        }
        Insert: {
          meal_id: string
          tag_id: number
        }
        Update: {
          meal_id?: string
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_dietary_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "dietary_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_ingredients: {
        Row: {
          created_at: string | null
          id: string
          ingredient_name: string
          meal_id: string | null
          quantity: number
          unit: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ingredient_name: string
          meal_id?: string | null
          quantity: number
          unit?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ingredient_name?: string
          meal_id?: string | null
          quantity?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_ingredients_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_cart_items: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          meal_plan_cart_items_user_id: string | null
          meal_plan_data: Json
          restaurant_id: string | null
          total_price: number
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          meal_plan_cart_items_user_id?: string | null
          meal_plan_data: Json
          restaurant_id?: string | null
          total_price: number
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          meal_plan_cart_items_user_id?: string | null
          meal_plan_data?: Json
          restaurant_id?: string | null
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_cart_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_customizations: {
        Row: {
          created_at: string | null
          dietary_preferences: string[] | null
          id: string
          ingredient_substitutions: Json | null
          meal_id: string | null
          meal_plan_customizations_user_id: string | null
          meal_plan_id: string
          portion_size_multiplier: number
          servings_count: number
          special_instructions: string | null
          total_price_adjustment: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dietary_preferences?: string[] | null
          id?: string
          ingredient_substitutions?: Json | null
          meal_id?: string | null
          meal_plan_customizations_user_id?: string | null
          meal_plan_id: string
          portion_size_multiplier?: number
          servings_count?: number
          special_instructions?: string | null
          total_price_adjustment?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dietary_preferences?: string[] | null
          id?: string
          ingredient_substitutions?: Json | null
          meal_id?: string | null
          meal_plan_customizations_user_id?: string | null
          meal_plan_id?: string
          portion_size_multiplier?: number
          servings_count?: number
          special_instructions?: string | null
          total_price_adjustment?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_customizations_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_order_item_meals: {
        Row: {
          meal_id: string
          meal_plan_order_item_id: string
        }
        Insert: {
          meal_id: string
          meal_plan_order_item_id: string
        }
        Update: {
          meal_id?: string
          meal_plan_order_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_order_item_meals_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_order_item_meals_meal_plan_order_item_id_fkey"
            columns: ["meal_plan_order_item_id"]
            isOneToOne: false
            referencedRelation: "meal_plan_order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_order_items: {
        Row: {
          calories_per_serving: number | null
          carbs_per_serving: number | null
          chef_notes: string | null
          created_at: string | null
          fats_per_serving: number | null
          fiber_per_serving: number | null
          id: string
          meal_id: string
          meal_plan_order_id: string
          preparation_end_time: string | null
          preparation_start_time: string | null
          preparation_status: string | null
          protein_per_serving: number | null
          quantity: number
          sodium_per_serving: number | null
          sugar_per_serving: number | null
          updated_at: string | null
        }
        Insert: {
          calories_per_serving?: number | null
          carbs_per_serving?: number | null
          chef_notes?: string | null
          created_at?: string | null
          fats_per_serving?: number | null
          fiber_per_serving?: number | null
          id?: string
          meal_id: string
          meal_plan_order_id: string
          preparation_end_time?: string | null
          preparation_start_time?: string | null
          preparation_status?: string | null
          protein_per_serving?: number | null
          quantity?: number
          sodium_per_serving?: number | null
          sugar_per_serving?: number | null
          updated_at?: string | null
        }
        Update: {
          calories_per_serving?: number | null
          carbs_per_serving?: number | null
          chef_notes?: string | null
          created_at?: string | null
          fats_per_serving?: number | null
          fiber_per_serving?: number | null
          id?: string
          meal_id?: string
          meal_plan_order_id?: string
          preparation_end_time?: string | null
          preparation_start_time?: string | null
          preparation_status?: string | null
          protein_per_serving?: number | null
          quantity?: number
          sodium_per_serving?: number | null
          sugar_per_serving?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_order_items_meal_plan_order_id_fkey"
            columns: ["meal_plan_order_id"]
            isOneToOne: false
            referencedRelation: "meal_plan_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_orders: {
        Row: {
          actual_delivery_time: string | null
          created_at: string | null
          delivery_date: string
          estimated_delivery_time: string | null
          id: string
          meal_plan_id: string
          meal_plan_orders_user_id: string
          notes: string | null
          order_id: string
          status: string
          total_calories: number | null
          total_carbs: number | null
          total_fats: number | null
          total_fiber: number | null
          total_protein: number | null
          total_sodium: number | null
          total_sugar: number | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          created_at?: string | null
          delivery_date: string
          estimated_delivery_time?: string | null
          id?: string
          meal_plan_id: string
          meal_plan_orders_user_id: string
          notes?: string | null
          order_id: string
          status?: string
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_fiber?: number | null
          total_protein?: number | null
          total_sodium?: number | null
          total_sugar?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          created_at?: string | null
          delivery_date?: string
          estimated_delivery_time?: string | null
          id?: string
          meal_plan_id?: string
          meal_plan_orders_user_id?: string
          notes?: string | null
          order_id?: string
          status?: string
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_fiber?: number | null
          total_protein?: number | null
          total_sodium?: number | null
          total_sugar?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meal_plan_restaurant_assignments: {
        Row: {
          assignment_strategy: string
          created_at: string | null
          id: string
          meal_plan_id: string
          restaurant_assignments: Json
          total_price: number
          updated_at: string | null
        }
        Insert: {
          assignment_strategy?: string
          created_at?: string | null
          id?: string
          meal_plan_id: string
          restaurant_assignments: Json
          total_price?: number
          updated_at?: string | null
        }
        Update: {
          assignment_strategy?: string
          created_at?: string | null
          id?: string
          meal_plan_id?: string
          restaurant_assignments?: Json
          total_price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      meal_plan_to_menu_mappings: {
        Row: {
          created_at: string | null
          id: string
          menu_item_id: string | null
          nutrition_food_name: string
          nutritional_accuracy: number | null
          similarity_score: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          nutrition_food_name: string
          nutritional_accuracy?: number | null
          similarity_score?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          nutrition_food_name?: string
          nutritional_accuracy?: number | null
          similarity_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_to_menu_mappings_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          meal_plans_user_id: string | null
          meals_data: Json
          name: string
          total_calories: number | null
          total_carbs: number | null
          total_fats: number | null
          total_fiber: number | null
          total_protein: number | null
          total_sodium: number | null
          total_sugar: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          meal_plans_user_id?: string | null
          meals_data?: Json
          name: string
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_fiber?: number | null
          total_protein?: number | null
          total_sodium?: number | null
          total_sugar?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          meal_plans_user_id?: string | null
          meals_data?: Json
          name?: string
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_fiber?: number | null
          total_protein?: number | null
          total_sodium?: number | null
          total_sugar?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meal_preparation_estimates: {
        Row: {
          base_prep_time: number
          complexity_multiplier: number
          cooking_time: number
          created_at: string | null
          id: string
          ingredient_prep_time: number
          kitchen_capacity_factor: number | null
          meal_id: string | null
          peak_hours_multiplier: number | null
          plating_time: number
          restaurant_id: string | null
          total_estimated_time: number | null
          updated_at: string | null
        }
        Insert: {
          base_prep_time?: number
          complexity_multiplier?: number
          cooking_time?: number
          created_at?: string | null
          id?: string
          ingredient_prep_time?: number
          kitchen_capacity_factor?: number | null
          meal_id?: string | null
          peak_hours_multiplier?: number | null
          plating_time?: number
          restaurant_id?: string | null
          total_estimated_time?: number | null
          updated_at?: string | null
        }
        Update: {
          base_prep_time?: number
          complexity_multiplier?: number
          cooking_time?: number
          created_at?: string | null
          id?: string
          ingredient_prep_time?: number
          kitchen_capacity_factor?: number | null
          meal_id?: string | null
          peak_hours_multiplier?: number | null
          plating_time?: number
          restaurant_id?: string | null
          total_estimated_time?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_preparation_estimates_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_preparation_estimates_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_preparation_progress: {
        Row: {
          actual_duration_minutes: number | null
          chef_id: string | null
          completed_at: string | null
          created_at: string | null
          estimated_duration_minutes: number | null
          id: string
          meal_plan_order_item_id: string
          notes: string | null
          started_at: string | null
          status: string
          step_description: string | null
          step_name: string
          updated_at: string | null
        }
        Insert: {
          actual_duration_minutes?: number | null
          chef_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          meal_plan_order_item_id: string
          notes?: string | null
          started_at?: string | null
          status?: string
          step_description?: string | null
          step_name: string
          updated_at?: string | null
        }
        Update: {
          actual_duration_minutes?: number | null
          chef_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          meal_plan_order_item_id?: string
          notes?: string | null
          started_at?: string | null
          status?: string
          step_description?: string | null
          step_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_preparation_progress_meal_plan_order_item_id_fkey"
            columns: ["meal_plan_order_item_id"]
            isOneToOne: false
            referencedRelation: "meal_plan_order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_ratings: {
        Row: {
          avg_rating: number
          id: string
          last_updated: string
          meal_id: string
          rating_distribution: Json
          restaurant_id: string
          review_count: number
        }
        Insert: {
          avg_rating?: number
          id?: string
          last_updated?: string
          meal_id: string
          rating_distribution?: Json
          restaurant_id: string
          review_count?: number
        }
        Update: {
          avg_rating?: number
          id?: string
          last_updated?: string
          meal_id?: string
          rating_distribution?: Json
          restaurant_id?: string
          review_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_ratings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          allergen_warnings: string[] | null
          base_ingredients: Json | null
          calories: number | null
          carbs: number | null
          category: string | null
          complexity_level: string | null
          cooking_instructions: Json | null
          created_at: string | null
          description: string | null
          dietary_tags: string[] | null
          fat: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          preparation_time: number
          price: number
          protein: number | null
          restaurant_id: string | null
          updated_at: string | null
        }
        Insert: {
          allergen_warnings?: string[] | null
          base_ingredients?: Json | null
          calories?: number | null
          carbs?: number | null
          category?: string | null
          complexity_level?: string | null
          cooking_instructions?: Json | null
          created_at?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          fat?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          preparation_time?: number
          price?: number
          protein?: number | null
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          allergen_warnings?: string[] | null
          base_ingredients?: Json | null
          calories?: number | null
          carbs?: number | null
          category?: string | null
          complexity_level?: string | null
          cooking_instructions?: Json | null
          created_at?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          fat?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          preparation_time?: number
          price?: number
          protein?: number | null
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meals_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          order: number | null
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          order?: number | null
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          order?: number | null
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          ingredients: string[] | null
          is_available: boolean
          name: string
          nutritional_info: Json | null
          preparation_time: number
          price: number
          restaurant_id: string
          steps: string[] | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_available?: boolean
          name: string
          nutritional_info?: Json | null
          preparation_time?: number
          price?: number
          restaurant_id: string
          steps?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_available?: boolean
          name?: string
          nutritional_info?: Json | null
          preparation_time?: number
          price?: number
          restaurant_id?: string
          steps?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_menu_items_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_sessions: {
        Row: {
          assignment_id: string | null
          completed_at: string | null
          current_latitude: number | null
          current_longitude: number | null
          current_step_index: number | null
          delivery_user_id: string | null
          distance_remaining_meters: number | null
          id: string
          is_active: boolean | null
          next_maneuver: string | null
          next_maneuver_distance_meters: number | null
          off_route: boolean | null
          reroute_count: number | null
          route_id: string | null
          started_at: string | null
          time_remaining_seconds: number | null
          updated_at: string | null
        }
        Insert: {
          assignment_id?: string | null
          completed_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          current_step_index?: number | null
          delivery_user_id?: string | null
          distance_remaining_meters?: number | null
          id?: string
          is_active?: boolean | null
          next_maneuver?: string | null
          next_maneuver_distance_meters?: number | null
          off_route?: boolean | null
          reroute_count?: number | null
          route_id?: string | null
          started_at?: string | null
          time_remaining_seconds?: number | null
          updated_at?: string | null
        }
        Update: {
          assignment_id?: string | null
          completed_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          current_step_index?: number | null
          delivery_user_id?: string | null
          distance_remaining_meters?: number | null
          id?: string
          is_active?: boolean | null
          next_maneuver?: string | null
          next_maneuver_distance_meters?: number | null
          off_route?: boolean | null
          reroute_count?: number | null
          route_id?: string | null
          started_at?: string | null
          time_remaining_seconds?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "navigation_sessions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "delivery_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "navigation_sessions_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "navigation_sessions_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          delivery_user_id: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          notifications_user_id: string
          order_id: string | null
          read_at: string | null
          restaurant_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          delivery_user_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          notifications_user_id: string
          order_id?: string | null
          read_at?: string | null
          restaurant_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          delivery_user_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          notifications_user_id?: string
          order_id?: string | null
          read_at?: string | null
          restaurant_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_cart_items: {
        Row: {
          calories: number
          carbs: number
          created_at: string | null
          fat: number
          food_category: string | null
          id: string
          meal_type: string
          name: string
          nutrition_cart_items_user_id: string | null
          portion_size: number
          protein: number
          quantity: number
          session_id: string | null
          updated_at: string | null
          usda_food_id: string | null
        }
        Insert: {
          calories?: number
          carbs?: number
          created_at?: string | null
          fat?: number
          food_category?: string | null
          id?: string
          meal_type: string
          name: string
          nutrition_cart_items_user_id?: string | null
          portion_size?: number
          protein?: number
          quantity?: number
          session_id?: string | null
          updated_at?: string | null
          usda_food_id?: string | null
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string | null
          fat?: number
          food_category?: string | null
          id?: string
          meal_type?: string
          name?: string
          nutrition_cart_items_user_id?: string | null
          portion_size?: number
          protein?: number
          quantity?: number
          session_id?: string | null
          updated_at?: string | null
          usda_food_id?: string | null
        }
        Relationships: []
      }
      nutritional_info: {
        Row: {
          allergens: string[] | null
          calories: number | null
          carbs: number | null
          fats: number | null
          meal_id: string
          protein: number | null
          sodium: number | null
          sugar: number | null
        }
        Insert: {
          allergens?: string[] | null
          calories?: number | null
          carbs?: number | null
          fats?: number | null
          meal_id: string
          protein?: number | null
          sodium?: number | null
          sugar?: number | null
        }
        Update: {
          allergens?: string[] | null
          calories?: number | null
          carbs?: number | null
          fats?: number | null
          meal_id?: string
          protein?: number | null
          sodium?: number | null
          sugar?: number | null
        }
        Relationships: []
      }
      order_complexity_analysis: {
        Row: {
          complex_meals: number
          created_at: string | null
          dietary_restrictions: string[] | null
          estimated_completion_time: string
          id: string
          kitchen_load_factor: number | null
          moderate_meals: number
          order_id: string
          requires_chef_attention: boolean | null
          restaurant_id: string | null
          simple_meals: number
          special_requirements: string[] | null
          total_meals: number
          total_preparation_time: number
        }
        Insert: {
          complex_meals?: number
          created_at?: string | null
          dietary_restrictions?: string[] | null
          estimated_completion_time: string
          id?: string
          kitchen_load_factor?: number | null
          moderate_meals?: number
          order_id: string
          requires_chef_attention?: boolean | null
          restaurant_id?: string | null
          simple_meals?: number
          special_requirements?: string[] | null
          total_meals: number
          total_preparation_time: number
        }
        Update: {
          complex_meals?: number
          created_at?: string | null
          dietary_restrictions?: string[] | null
          estimated_completion_time?: string
          id?: string
          kitchen_load_factor?: number | null
          moderate_meals?: number
          order_id?: string
          requires_chef_attention?: boolean | null
          restaurant_id?: string | null
          simple_meals?: number
          special_requirements?: string[] | null
          total_meals?: number
          total_preparation_time?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_complexity_analysis_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_events: {
        Row: {
          created_at: string | null
          delivery_user_id: string | null
          event_data: Json | null
          event_type: string
          id: string
          order_events_user_id: string | null
          order_id: string
          restaurant_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_user_id?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          order_events_user_id?: string | null
          order_id: string
          restaurant_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_user_id?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          order_events_user_id?: string | null
          order_id?: string
          restaurant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_events_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_events_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_history: {
        Row: {
          assignment_source: string | null
          created_at: string
          details: Json | null
          expired_at: string | null
          id: string
          order_id: string
          previous_status: string | null
          restaurant_id: string
          restaurant_name: string
          status: string
          visibility: boolean
        }
        Insert: {
          assignment_source?: string | null
          created_at?: string
          details?: Json | null
          expired_at?: string | null
          id?: string
          order_id: string
          previous_status?: string | null
          restaurant_id: string
          restaurant_name: string
          status: string
          visibility?: boolean
        }
        Update: {
          assignment_source?: string | null
          created_at?: string
          details?: Json | null
          expired_at?: string | null
          id?: string
          order_id?: string
          previous_status?: string | null
          restaurant_id?: string
          restaurant_name?: string
          status?: string
          visibility?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "fk_order_history_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_history_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_history_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_id_formats: {
        Row: {
          created_at: string
          date_part: string
          formatted_id: string
          id: string
          random_part: string
          sequence_part: string
        }
        Insert: {
          created_at?: string
          date_part: string
          formatted_id: string
          id?: string
          random_part: string
          sequence_part: string
        }
        Update: {
          created_at?: string
          date_part?: string
          formatted_id?: string
          id?: string
          random_part?: string
          sequence_part?: string
        }
        Relationships: []
      }
      order_item_preparation: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          order_item_id: string
          prep_time_minutes: number | null
          preparation_stage_id: string
          special_instructions: string | null
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          order_item_id: string
          prep_time_minutes?: number | null
          preparation_stage_id: string
          special_instructions?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          order_item_id?: string
          prep_time_minutes?: number | null
          preparation_stage_id?: string
          special_instructions?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_item_preparation_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "flexible_order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_preparation_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_preparation_preparation_stage_id_fkey"
            columns: ["preparation_stage_id"]
            isOneToOne: false
            referencedRelation: "order_preparation_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          meal_id: string | null
          menu_item_id: string | null
          name: string
          order_id: string
          price: number
          quantity: number
          source_type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          meal_id?: string | null
          menu_item_id?: string | null
          name: string
          order_id: string
          price: number
          quantity: number
          source_type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          meal_id?: string | null
          menu_item_id?: string | null
          name?: string
          order_id?: string
          price?: number
          quantity?: number
          source_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_locations: {
        Row: {
          distance_km: number | null
          id: string
          latitude: number
          longitude: number
          order_id: string
          restaurant_id: string | null
          status: string | null
          timestamp: string
        }
        Insert: {
          distance_km?: number | null
          id?: string
          latitude: number
          longitude: number
          order_id: string
          restaurant_id?: string | null
          status?: string | null
          timestamp?: string
        }
        Update: {
          distance_km?: number | null
          id?: string
          latitude?: number
          longitude?: number
          order_id?: string
          restaurant_id?: string | null
          status?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      order_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          order_id: string
          order_notifications_user_id: string | null
          read_at: string | null
          restaurant_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          order_id: string
          order_notifications_user_id?: string | null
          read_at?: string | null
          restaurant_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          order_id?: string
          order_notifications_user_id?: string | null
          read_at?: string | null
          restaurant_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_notifications_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_preparation_instructions: {
        Row: {
          chef_notes: string | null
          created_at: string | null
          customer_notes: string | null
          equipment_needed: string[] | null
          estimated_time_minutes: number | null
          id: string
          instruction_text: string
          instruction_type: string
          meal_id: string | null
          order_id: string
          priority_level: number
          requires_special_equipment: boolean | null
        }
        Insert: {
          chef_notes?: string | null
          created_at?: string | null
          customer_notes?: string | null
          equipment_needed?: string[] | null
          estimated_time_minutes?: number | null
          id?: string
          instruction_text: string
          instruction_type: string
          meal_id?: string | null
          order_id: string
          priority_level?: number
          requires_special_equipment?: boolean | null
        }
        Update: {
          chef_notes?: string | null
          created_at?: string | null
          customer_notes?: string | null
          equipment_needed?: string[] | null
          estimated_time_minutes?: number | null
          id?: string
          instruction_text?: string
          instruction_type?: string
          meal_id?: string | null
          order_id?: string
          priority_level?: number
          requires_special_equipment?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "order_preparation_instructions_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      order_preparation_stages: {
        Row: {
          actual_duration_minutes: number | null
          completed_at: string | null
          created_at: string
          estimated_duration_minutes: number | null
          id: string
          notes: string | null
          order_id: string
          restaurant_id: string
          stage_name: string
          stage_order: number
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          actual_duration_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          estimated_duration_minutes?: number | null
          id?: string
          notes?: string | null
          order_id: string
          restaurant_id: string
          stage_name: string
          stage_order: number
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          actual_duration_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          estimated_duration_minutes?: number | null
          id?: string
          notes?: string | null
          order_id?: string
          restaurant_id?: string
          stage_name?: string
          stage_order?: number
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_preparation_stages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_preparation_stages_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_rejections: {
        Row: {
          assignment_id: string | null
          created_at: string | null
          id: string
          order_id: string
          rejected_at: string | null
          rejection_details: string | null
          rejection_reason: string
          restaurant_id: string
        }
        Insert: {
          assignment_id?: string | null
          created_at?: string | null
          id?: string
          order_id: string
          rejected_at?: string | null
          rejection_details?: string | null
          rejection_reason: string
          restaurant_id: string
        }
        Update: {
          assignment_id?: string | null
          created_at?: string | null
          id?: string
          order_id?: string
          rejected_at?: string | null
          rejection_details?: string | null
          rejection_reason?: string
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_rejections_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "restaurant_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_rejections_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_rejections_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_sequences: {
        Row: {
          day: number
          id: number
          month: number
          sequence: number
          year: number
        }
        Insert: {
          day: number
          id?: number
          month: number
          sequence?: number
          year: number
        }
        Update: {
          day?: number
          id?: number
          month?: number
          sequence?: number
          year?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          accepted_at: string | null
          assigned_at: string | null
          assignment_source: string | null
          cancelled_at: string | null
          city: string
          complexity_score: number | null
          created_at: string
          customer_email: string
          customer_id: string
          customer_name: string
          customer_phone: string
          delivered_at: string | null
          delivery_address: string
          delivery_fee: number
          delivery_method: string
          estimated_preparation_time: number | null
          formatted_order_id: string | null
          id: string
          is_mixed_order: boolean | null
          last_rejected_at: string | null
          latitude: number | null
          locale: string | null
          longitude: number | null
          max_rejection_attempts: number | null
          notes: string | null
          payment_method: string
          picked_up_at: string | null
          preparation_started_at: string | null
          ready_at: string | null
          refund_amount: number | null
          refund_status: string | null
          rejection_count: number | null
          requires_chef_attention: boolean | null
          restaurant_attempts: Json | null
          restaurant_id: string | null
          return_images: string[] | null
          return_reason: string | null
          return_status: string | null
          special_instructions: string | null
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          assigned_at?: string | null
          assignment_source?: string | null
          cancelled_at?: string | null
          city: string
          complexity_score?: number | null
          created_at?: string
          customer_email: string
          customer_id: string
          customer_name: string
          customer_phone: string
          delivered_at?: string | null
          delivery_address: string
          delivery_fee: number
          delivery_method: string
          estimated_preparation_time?: number | null
          formatted_order_id?: string | null
          id?: string
          is_mixed_order?: boolean | null
          last_rejected_at?: string | null
          latitude?: number | null
          locale?: string | null
          longitude?: number | null
          max_rejection_attempts?: number | null
          notes?: string | null
          payment_method: string
          picked_up_at?: string | null
          preparation_started_at?: string | null
          ready_at?: string | null
          refund_amount?: number | null
          refund_status?: string | null
          rejection_count?: number | null
          requires_chef_attention?: boolean | null
          restaurant_attempts?: Json | null
          restaurant_id?: string | null
          return_images?: string[] | null
          return_reason?: string | null
          return_status?: string | null
          special_instructions?: string | null
          status?: string
          subtotal: number
          total: number
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          assigned_at?: string | null
          assignment_source?: string | null
          cancelled_at?: string | null
          city?: string
          complexity_score?: number | null
          created_at?: string
          customer_email?: string
          customer_id?: string
          customer_name?: string
          customer_phone?: string
          delivered_at?: string | null
          delivery_address?: string
          delivery_fee?: number
          delivery_method?: string
          estimated_preparation_time?: number | null
          formatted_order_id?: string | null
          id?: string
          is_mixed_order?: boolean | null
          last_rejected_at?: string | null
          latitude?: number | null
          locale?: string | null
          longitude?: number | null
          max_rejection_attempts?: number | null
          notes?: string | null
          payment_method?: string
          picked_up_at?: string | null
          preparation_started_at?: string | null
          ready_at?: string | null
          refund_amount?: number | null
          refund_status?: string | null
          rejection_count?: number | null
          requires_chef_attention?: boolean | null
          restaurant_attempts?: Json | null
          restaurant_id?: string | null
          return_images?: string[] | null
          return_reason?: string | null
          return_status?: string | null
          special_instructions?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_orders_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_confirmations: {
        Row: {
          confirmation_method: string | null
          confirmation_status: string
          confirmed_at: string | null
          confirming_party: string
          confirming_user_id: string | null
          created_at: string | null
          dispute_reason: string | null
          id: string
          order_id: string
          payment_transaction_id: string
          timeout_at: string | null
        }
        Insert: {
          confirmation_method?: string | null
          confirmation_status?: string
          confirmed_at?: string | null
          confirming_party: string
          confirming_user_id?: string | null
          created_at?: string | null
          dispute_reason?: string | null
          id?: string
          order_id: string
          payment_transaction_id: string
          timeout_at?: string | null
        }
        Update: {
          confirmation_method?: string | null
          confirmation_status?: string
          confirmed_at?: string | null
          confirming_party?: string
          confirming_user_id?: string | null
          created_at?: string | null
          dispute_reason?: string | null
          id?: string
          order_id?: string
          payment_transaction_id?: string
          timeout_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_confirmations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_confirmations_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          brand: string | null
          created_at: string | null
          expires_month: number | null
          expires_year: number | null
          external_id: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          last_four: string | null
          payment_methods_user_id: string
          provider: string
          type: string
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          expires_month?: number | null
          expires_year?: number | null
          external_id: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_four?: string | null
          payment_methods_user_id: string
          provider: string
          type: string
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          expires_month?: number | null
          expires_year?: number | null
          external_id?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_four?: string | null
          payment_methods_user_id?: string
          provider?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_notifications: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          order_id: string
          read_at: string | null
          recipient_id: string
          recipient_type: string
          sent_at: string | null
          title: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          order_id: string
          read_at?: string | null
          recipient_id: string
          recipient_type: string
          sent_at?: string | null
          title: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          order_id?: string
          read_at?: string | null
          recipient_id?: string
          recipient_type?: string
          sent_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_status_coordination: {
        Row: {
          all_parties_confirmed: boolean | null
          base_payment_status: string | null
          confirmation_status: string | null
          created_at: string | null
          id: string
          last_status_update: string | null
          order_id: string
          overall_payment_status: string
          requires_manual_review: boolean | null
          status_history: Json | null
          tip_payment_status: string | null
          updated_at: string | null
        }
        Insert: {
          all_parties_confirmed?: boolean | null
          base_payment_status?: string | null
          confirmation_status?: string | null
          created_at?: string | null
          id?: string
          last_status_update?: string | null
          order_id: string
          overall_payment_status?: string
          requires_manual_review?: boolean | null
          status_history?: Json | null
          tip_payment_status?: string | null
          updated_at?: string | null
        }
        Update: {
          all_parties_confirmed?: boolean | null
          base_payment_status?: string | null
          confirmation_status?: string | null
          created_at?: string | null
          id?: string
          last_status_update?: string | null
          order_id?: string
          overall_payment_status?: string
          requires_manual_review?: boolean | null
          status_history?: Json | null
          tip_payment_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_status_coordination_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          customer_id: string
          delivery_user_id: string | null
          external_transaction_id: string | null
          failure_reason: string | null
          id: string
          metadata: Json | null
          order_id: string
          payment_method: string
          payment_processor: string | null
          processed_at: string | null
          restaurant_id: string | null
          status: string
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          customer_id: string
          delivery_user_id?: string | null
          external_transaction_id?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          order_id: string
          payment_method: string
          payment_processor?: string | null
          processed_at?: string | null
          restaurant_id?: string | null
          status?: string
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          customer_id?: string
          delivery_user_id?: string | null
          external_transaction_id?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string
          payment_method?: string
          payment_processor?: string | null
          processed_at?: string | null
          restaurant_id?: string | null
          status?: string
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          delivery_user_id: string | null
          earnings_count: number
          external_payout_id: string | null
          failure_reason: string | null
          id: string
          metadata: Json | null
          net_amount: number | null
          payout_method: string
          period_end: string
          period_start: string
          processed_at: string | null
          provider: string
          provider_fee: number | null
          restaurant_id: string
          scheduled_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          delivery_user_id?: string | null
          earnings_count?: number
          external_payout_id?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          net_amount?: number | null
          payout_method: string
          period_end: string
          period_start: string
          processed_at?: string | null
          provider: string
          provider_fee?: number | null
          restaurant_id: string
          scheduled_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          delivery_user_id?: string | null
          earnings_count?: number
          external_payout_id?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          net_amount?: number | null
          payout_method?: string
          period_end?: string
          period_start?: string
          processed_at?: string | null
          provider?: string
          provider_fee?: number | null
          restaurant_id?: string
          scheduled_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_records: {
        Row: {
          achieved_at: string
          created_at: string | null
          exercise_id: string
          id: string
          notes: string | null
          personal_records_user_id: string
          record_type: string
          unit: string
          value: number
          video_url: string | null
          workout_log_id: string | null
        }
        Insert: {
          achieved_at: string
          created_at?: string | null
          exercise_id: string
          id?: string
          notes?: string | null
          personal_records_user_id: string
          record_type: string
          unit: string
          value: number
          video_url?: string | null
          workout_log_id?: string | null
        }
        Update: {
          achieved_at?: string
          created_at?: string | null
          exercise_id?: string
          id?: string
          notes?: string | null
          personal_records_user_id?: string
          record_type?: string
          unit?: string
          value?: number
          video_url?: string | null
          workout_log_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs_enhanced"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_usage: {
        Row: {
          discount_applied: number
          id: string
          order_id: string
          promotion_id: string
          promotion_usage_user_id: string
          used_at: string | null
        }
        Insert: {
          discount_applied: number
          id?: string
          order_id: string
          promotion_id: string
          promotion_usage_user_id: string
          used_at?: string | null
        }
        Update: {
          discount_applied?: number
          id?: string
          order_id?: string
          promotion_id?: string
          promotion_usage_user_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotion_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_usage_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "restaurant_promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      push_notification_tokens: {
        Row: {
          created_at: string | null
          device_id: string | null
          id: string
          is_active: boolean | null
          platform: string
          push_notification_tokens_user_id: string
          token: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          push_notification_tokens_user_id: string
          token: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          push_notification_tokens_user_id?: string
          token?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      push_notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          delivered_at: string | null
          id: string
          notification_type: string
          push_notifications_user_id: string
          sent_at: string | null
          status: string | null
          title: string
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          delivered_at?: string | null
          id?: string
          notification_type: string
          push_notifications_user_id: string
          sent_at?: string | null
          status?: string | null
          title: string
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          delivered_at?: string | null
          id?: string
          notification_type?: string
          push_notifications_user_id?: string
          sent_at?: string | null
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      recommendation_feedback: {
        Row: {
          comments: string | null
          created_at: string | null
          feedback_type: string
          id: string
          rating: number | null
          recommendation_feedback_user_id: string
          recommendation_id: string
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          feedback_type: string
          id?: string
          rating?: number | null
          recommendation_feedback_user_id: string
          recommendation_id: string
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          feedback_type?: string
          id?: string
          rating?: number | null
          recommendation_feedback_user_id?: string
          recommendation_id?: string
        }
        Relationships: []
      }
      refund_requests: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          id: string
          notes: string | null
          order_id: string
          processed_at: string | null
          processed_by: string | null
          reason: string
          refund_requests_user_id: string
          requested_amount: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id: string
          processed_at?: string | null
          processed_by?: string | null
          reason: string
          refund_requests_user_id: string
          requested_amount: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string
          refund_requests_user_id?: string
          requested_amount?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_refund_requests_order_id"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      rest_timer_sessions: {
        Row: {
          actual_rest_seconds: number | null
          completed_at: string | null
          exercise_name: string
          id: string
          planned_rest_seconds: number
          rest_timer_sessions_user_id: string
          set_number: number
          started_at: string | null
          was_skipped: boolean | null
          workout_log_id: string | null
        }
        Insert: {
          actual_rest_seconds?: number | null
          completed_at?: string | null
          exercise_name: string
          id?: string
          planned_rest_seconds: number
          rest_timer_sessions_user_id: string
          set_number: number
          started_at?: string | null
          was_skipped?: boolean | null
          workout_log_id?: string | null
        }
        Update: {
          actual_rest_seconds?: number | null
          completed_at?: string | null
          exercise_name?: string
          id?: string
          planned_rest_seconds?: number
          rest_timer_sessions_user_id?: string
          set_number?: number
          started_at?: string | null
          was_skipped?: boolean | null
          workout_log_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rest_timer_sessions_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_analytics: {
        Row: {
          average_order_value: number | null
          average_preparation_time: number | null
          created_at: string | null
          customer_satisfaction_score: number | null
          date: string
          id: string
          order_completion_rate: number | null
          restaurant_id: string
          total_orders: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          average_order_value?: number | null
          average_preparation_time?: number | null
          created_at?: string | null
          customer_satisfaction_score?: number | null
          date: string
          id?: string
          order_completion_rate?: number | null
          restaurant_id: string
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          average_order_value?: number | null
          average_preparation_time?: number | null
          created_at?: string | null
          customer_satisfaction_score?: number | null
          date?: string
          id?: string
          order_completion_rate?: number | null
          restaurant_id?: string
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_analytics_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_assignments: {
        Row: {
          assigned_at: string | null
          assignment_metadata: Json | null
          assignment_source: string | null
          created_at: string
          expires_at: string
          id: string
          notes: string | null
          order_id: string
          rejection_details: string | null
          rejection_reason: string | null
          responded_at: string | null
          response_notes: string | null
          restaurant_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string | null
          assignment_metadata?: Json | null
          assignment_source?: string | null
          created_at?: string
          expires_at: string
          id?: string
          notes?: string | null
          order_id: string
          rejection_details?: string | null
          rejection_reason?: string | null
          responded_at?: string | null
          response_notes?: string | null
          restaurant_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string | null
          assignment_metadata?: Json | null
          assignment_source?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          rejection_details?: string | null
          rejection_reason?: string | null
          responded_at?: string | null
          response_notes?: string | null
          restaurant_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_restaurant_assignments_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_restaurant_assignments_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_assignments_restaurant_id_restaurants_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_delivery_areas: {
        Row: {
          area_name: string
          area_type: string | null
          center_latitude: number | null
          center_longitude: number | null
          created_at: string | null
          delivery_fee: number | null
          estimated_delivery_time: number | null
          id: string
          is_active: boolean | null
          minimum_order_amount: number | null
          polygon_coordinates: Json | null
          postal_codes: string[] | null
          priority_order: number | null
          radius_km: number | null
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          area_name: string
          area_type?: string | null
          center_latitude?: number | null
          center_longitude?: number | null
          created_at?: string | null
          delivery_fee?: number | null
          estimated_delivery_time?: number | null
          id?: string
          is_active?: boolean | null
          minimum_order_amount?: number | null
          polygon_coordinates?: Json | null
          postal_codes?: string[] | null
          priority_order?: number | null
          radius_km?: number | null
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          area_name?: string
          area_type?: string | null
          center_latitude?: number | null
          center_longitude?: number | null
          created_at?: string | null
          delivery_fee?: number | null
          estimated_delivery_time?: number | null
          id?: string
          is_active?: boolean | null
          minimum_order_amount?: number | null
          polygon_coordinates?: Json | null
          postal_codes?: string[] | null
          priority_order?: number | null
          radius_km?: number | null
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_delivery_areas_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_documents: {
        Row: {
          created_at: string | null
          document_name: string
          document_type: string
          document_url: string
          file_size: number | null
          file_type: string | null
          id: string
          restaurant_id: string
          updated_at: string | null
          uploaded_at: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_name: string
          document_type: string
          document_url: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          restaurant_id: string
          updated_at?: string | null
          uploaded_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string
          document_type?: string
          document_url?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          restaurant_id?: string
          updated_at?: string | null
          uploaded_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_documents_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_earnings: {
        Row: {
          available_at: string | null
          commission_rate: number
          created_at: string | null
          earned_at: string | null
          gross_amount: number
          id: string
          net_earnings: number
          order_id: string | null
          payment_processing_fee: number
          payout_id: string | null
          platform_commission: number
          restaurant_id: string
          status: string
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          available_at?: string | null
          commission_rate: number
          created_at?: string | null
          earned_at?: string | null
          gross_amount: number
          id?: string
          net_earnings: number
          order_id?: string | null
          payment_processing_fee: number
          payout_id?: string | null
          platform_commission: number
          restaurant_id: string
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          available_at?: string | null
          commission_rate?: number
          created_at?: string | null
          earned_at?: string | null
          gross_amount?: number
          id?: string
          net_earnings?: number
          order_id?: string | null
          payment_processing_fee?: number
          payout_id?: string | null
          platform_commission?: number
          restaurant_id?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_earnings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_earnings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_earnings_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_food_capabilities: {
        Row: {
          created_at: string | null
          food_item_id: string
          id: string
          is_available: boolean
          maximum_quantity_grams: number | null
          minimum_quantity_grams: number | null
          preparation_time_minutes: number | null
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          food_item_id: string
          id?: string
          is_available?: boolean
          maximum_quantity_grams?: number | null
          minimum_quantity_grams?: number | null
          preparation_time_minutes?: number | null
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          food_item_id?: string
          id?: string
          is_available?: boolean
          maximum_quantity_grams?: number | null
          minimum_quantity_grams?: number | null
          preparation_time_minutes?: number | null
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_food_capabilities_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_food_capabilities_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_ingredient_inventory: {
        Row: {
          batch_number: string | null
          cost_per_unit: number
          created_at: string | null
          current_stock: number
          id: string
          ingredient_name: string
          is_available: boolean
          last_restocked: string | null
          minimum_stock: number
          quality_grade: string | null
          restaurant_id: string | null
          storage_location: string | null
          unit: string
          updated_at: string | null
        }
        Insert: {
          batch_number?: string | null
          cost_per_unit?: number
          created_at?: string | null
          current_stock?: number
          id?: string
          ingredient_name: string
          is_available?: boolean
          last_restocked?: string | null
          minimum_stock?: number
          quality_grade?: string | null
          restaurant_id?: string | null
          storage_location?: string | null
          unit?: string
          updated_at?: string | null
        }
        Update: {
          batch_number?: string | null
          cost_per_unit?: number
          created_at?: string | null
          current_stock?: number
          id?: string
          ingredient_name?: string
          is_available?: boolean
          last_restocked?: string | null
          minimum_stock?: number
          quality_grade?: string | null
          restaurant_id?: string | null
          storage_location?: string | null
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_ingredient_inventory_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_logs: {
        Row: {
          affected_rows: number | null
          after_state: Json | null
          before_state: Json | null
          element_class: string | null
          element_id: string | null
          element_type: string | null
          endpoint: string | null
          error_message: string | null
          error_stack: string | null
          id: string
          page_url: string | null
          query_text: string | null
          request_body: Json | null
          request_headers: Json | null
          response_body: Json | null
          response_headers: Json | null
          restaurant_logs_user_id: string | null
          session_id: string | null
          status_code: number | null
          timestamp: string | null
          type: string
        }
        Insert: {
          affected_rows?: number | null
          after_state?: Json | null
          before_state?: Json | null
          element_class?: string | null
          element_id?: string | null
          element_type?: string | null
          endpoint?: string | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          page_url?: string | null
          query_text?: string | null
          request_body?: Json | null
          request_headers?: Json | null
          response_body?: Json | null
          response_headers?: Json | null
          restaurant_logs_user_id?: string | null
          session_id?: string | null
          status_code?: number | null
          timestamp?: string | null
          type: string
        }
        Update: {
          affected_rows?: number | null
          after_state?: Json | null
          before_state?: Json | null
          element_class?: string | null
          element_id?: string | null
          element_type?: string | null
          endpoint?: string | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          page_url?: string | null
          query_text?: string | null
          request_body?: Json | null
          request_headers?: Json | null
          response_body?: Json | null
          response_headers?: Json | null
          restaurant_logs_user_id?: string | null
          session_id?: string | null
          status_code?: number | null
          timestamp?: string | null
          type?: string
        }
        Relationships: []
      }
      restaurant_menu_items: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          ingredients: string[] | null
          is_available: boolean | null
          name: string
          nutritional_info: Json | null
          preparation_time: number | null
          price: number
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_available?: boolean | null
          name: string
          nutritional_info?: Json | null
          preparation_time?: number | null
          price: number
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_available?: boolean | null
          name?: string
          nutritional_info?: Json | null
          preparation_time?: number | null
          price?: number
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_onboarding_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          data: Json | null
          id: string
          is_completed: boolean | null
          notes: string | null
          restaurant_id: string
          step_name: string
          step_number: number
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          restaurant_id: string
          step_name: string
          step_number: number
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          restaurant_id?: string
          step_name?: string
          step_number?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_onboarding_progress_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_operational_hours: {
        Row: {
          break_end_time: string | null
          break_start_time: string | null
          close_time: string | null
          created_at: string | null
          day_of_week: number
          id: string
          is_24_hours: boolean | null
          is_open: boolean | null
          open_time: string | null
          restaurant_id: string
          special_hours_note: string | null
          updated_at: string | null
        }
        Insert: {
          break_end_time?: string | null
          break_start_time?: string | null
          close_time?: string | null
          created_at?: string | null
          day_of_week: number
          id?: string
          is_24_hours?: boolean | null
          is_open?: boolean | null
          open_time?: string | null
          restaurant_id: string
          special_hours_note?: string | null
          updated_at?: string | null
        }
        Update: {
          break_end_time?: string | null
          break_start_time?: string | null
          close_time?: string | null
          created_at?: string | null
          day_of_week?: number
          id?: string
          is_24_hours?: boolean | null
          is_open?: boolean | null
          open_time?: string | null
          restaurant_id?: string
          special_hours_note?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_operational_hours_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_performance_metrics: {
        Row: {
          average_order_value: number | null
          average_preparation_time: number | null
          average_rating: number | null
          cancelled_orders: number | null
          completed_orders: number | null
          created_at: string | null
          customer_satisfaction_score: number | null
          id: string
          metric_date: string
          on_time_delivery_rate: number | null
          order_accuracy_rate: number | null
          peak_hours: Json | null
          restaurant_id: string
          total_orders: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          average_order_value?: number | null
          average_preparation_time?: number | null
          average_rating?: number | null
          cancelled_orders?: number | null
          completed_orders?: number | null
          created_at?: string | null
          customer_satisfaction_score?: number | null
          id?: string
          metric_date: string
          on_time_delivery_rate?: number | null
          order_accuracy_rate?: number | null
          peak_hours?: Json | null
          restaurant_id: string
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          average_order_value?: number | null
          average_preparation_time?: number | null
          average_rating?: number | null
          cancelled_orders?: number | null
          completed_orders?: number | null
          created_at?: string | null
          customer_satisfaction_score?: number | null
          id?: string
          metric_date?: string
          on_time_delivery_rate?: number | null
          order_accuracy_rate?: number | null
          peak_hours?: Json | null
          restaurant_id?: string
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_performance_metrics_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_promotions: {
        Row: {
          applicable_items: Json | null
          created_at: string | null
          description: string | null
          discount_value: number | null
          end_date: string
          id: string
          is_active: boolean | null
          maximum_discount_amount: number | null
          minimum_order_amount: number | null
          name: string
          promo_code: string | null
          promotion_type: string
          restaurant_id: string
          start_date: string
          terms_conditions: string | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
        }
        Insert: {
          applicable_items?: Json | null
          created_at?: string | null
          description?: string | null
          discount_value?: number | null
          end_date: string
          id?: string
          is_active?: boolean | null
          maximum_discount_amount?: number | null
          minimum_order_amount?: number | null
          name: string
          promo_code?: string | null
          promotion_type: string
          restaurant_id: string
          start_date: string
          terms_conditions?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Update: {
          applicable_items?: Json | null
          created_at?: string | null
          description?: string | null
          discount_value?: number | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          maximum_discount_amount?: number | null
          minimum_order_amount?: number | null
          name?: string
          promo_code?: string | null
          promotion_type?: string
          restaurant_id?: string
          start_date?: string
          terms_conditions?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_promotions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_settings: {
        Row: {
          auto_accept_orders: boolean | null
          created_at: string | null
          id: string
          max_daily_orders: number | null
          notifications_enabled: boolean | null
          operating_status: string | null
          order_preparation_time: number | null
          restaurant_id: string
          special_instructions: string | null
          updated_at: string | null
        }
        Insert: {
          auto_accept_orders?: boolean | null
          created_at?: string | null
          id?: string
          max_daily_orders?: number | null
          notifications_enabled?: boolean | null
          operating_status?: string | null
          order_preparation_time?: number | null
          restaurant_id: string
          special_instructions?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_accept_orders?: boolean | null
          created_at?: string | null
          id?: string
          max_daily_orders?: number | null
          notifications_enabled?: boolean | null
          operating_status?: string | null
          order_preparation_time?: number | null
          restaurant_id?: string
          special_instructions?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_verification_documents: {
        Row: {
          document_name: string
          document_type: string
          document_url: string
          id: string
          restaurant_id: string
          uploaded_at: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
        }
        Insert: {
          document_name: string
          document_type: string
          document_url: string
          id?: string
          restaurant_id: string
          uploaded_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
        }
        Update: {
          document_name?: string
          document_type?: string
          document_url?: string
          id?: string
          restaurant_id?: string
          uploaded_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_verification_documents_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string
          business_license: string | null
          city: string
          country: string | null
          cover_image_url: string | null
          created_at: string | null
          cuisine_type: string | null
          delivery_fee: number | null
          delivery_radius: number | null
          description: string | null
          email: string
          estimated_delivery_time: number | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          latitude: number
          logo_url: string | null
          longitude: number
          minimum_order_amount: number | null
          name: string
          onboarding_completed_at: string | null
          onboarding_status: string | null
          onboarding_step: number | null
          opening_hours: Json | null
          phone: string
          postal_code: string | null
          restaurant_id: string
          restaurants_user_id: string
          tax_number: string | null
          updated_at: string | null
          verification_notes: string | null
          verification_status: string | null
        }
        Insert: {
          address: string
          business_license?: string | null
          city: string
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          cuisine_type?: string | null
          delivery_fee?: number | null
          delivery_radius?: number | null
          description?: string | null
          email: string
          estimated_delivery_time?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude: number
          logo_url?: string | null
          longitude: number
          minimum_order_amount?: number | null
          name: string
          onboarding_completed_at?: string | null
          onboarding_status?: string | null
          onboarding_step?: number | null
          opening_hours?: Json | null
          phone: string
          postal_code?: string | null
          restaurant_id?: string
          restaurants_user_id: string
          tax_number?: string | null
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
        }
        Update: {
          address?: string
          business_license?: string | null
          city?: string
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          cuisine_type?: string | null
          delivery_fee?: number | null
          delivery_radius?: number | null
          description?: string | null
          email?: string
          estimated_delivery_time?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number
          logo_url?: string | null
          longitude?: number
          minimum_order_amount?: number | null
          name?: string
          onboarding_completed_at?: string | null
          onboarding_status?: string | null
          onboarding_step?: number | null
          opening_hours?: Json | null
          phone?: string
          postal_code?: string | null
          restaurant_id?: string
          restaurants_user_id?: string
          tax_number?: string | null
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      return_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          images: string[] | null
          order_id: string
          reason: string
          refund_amount: number | null
          return_requests_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          order_id: string
          reason: string
          refund_amount?: number | null
          return_requests_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          order_id?: string
          reason?: string
          refund_amount?: number | null
          return_requests_user_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "return_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          images: string[] | null
          is_flagged: boolean
          is_verified_purchase: boolean
          meal_id: string
          rating: number
          restaurant_id: string
          reviews_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          is_flagged?: boolean
          is_verified_purchase?: boolean
          meal_id: string
          rating: number
          restaurant_id: string
          reviews_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          is_flagged?: boolean
          is_verified_purchase?: boolean
          meal_id?: string
          rating?: number
          restaurant_id?: string
          reviews_user_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      route_segments: {
        Row: {
          created_at: string | null
          distance_meters: number
          duration_seconds: number
          end_latitude: number
          end_longitude: number
          id: string
          instruction: string
          maneuver: string | null
          road_name: string | null
          route_id: string | null
          segment_index: number
          segment_polyline: string | null
          start_latitude: number
          start_longitude: number
        }
        Insert: {
          created_at?: string | null
          distance_meters: number
          duration_seconds: number
          end_latitude: number
          end_longitude: number
          id?: string
          instruction: string
          maneuver?: string | null
          road_name?: string | null
          route_id?: string | null
          segment_index: number
          segment_polyline?: string | null
          start_latitude: number
          start_longitude: number
        }
        Update: {
          created_at?: string | null
          distance_meters?: number
          duration_seconds?: number
          end_latitude?: number
          end_longitude?: number
          id?: string
          instruction?: string
          maneuver?: string | null
          road_name?: string | null
          route_id?: string | null
          segment_index?: number
          segment_polyline?: string | null
          start_latitude?: number
          start_longitude?: number
        }
        Relationships: [
          {
            foreignKeyName: "route_segments_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          assignment_id: string | null
          created_at: string | null
          destination_latitude: number
          destination_longitude: number
          estimated_arrival: string | null
          id: string
          optimized_waypoints: Json | null
          origin_latitude: number
          origin_longitude: number
          route_polyline: string | null
          route_status: string | null
          route_steps: Json | null
          total_distance_meters: number | null
          total_duration_seconds: number | null
          traffic_data: Json | null
          updated_at: string | null
          waypoints: Json | null
        }
        Insert: {
          assignment_id?: string | null
          created_at?: string | null
          destination_latitude: number
          destination_longitude: number
          estimated_arrival?: string | null
          id?: string
          optimized_waypoints?: Json | null
          origin_latitude: number
          origin_longitude: number
          route_polyline?: string | null
          route_status?: string | null
          route_steps?: Json | null
          total_distance_meters?: number | null
          total_duration_seconds?: number | null
          traffic_data?: Json | null
          updated_at?: string | null
          waypoints?: Json | null
        }
        Update: {
          assignment_id?: string | null
          created_at?: string | null
          destination_latitude?: number
          destination_longitude?: number
          estimated_arrival?: string | null
          id?: string
          optimized_waypoints?: Json | null
          origin_latitude?: number
          origin_longitude?: number
          route_polyline?: string | null
          route_status?: string | null
          route_steps?: Json | null
          total_distance_meters?: number | null
          total_duration_seconds?: number | null
          traffic_data?: Json | null
          updated_at?: string | null
          waypoints?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "delivery_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_meal_plans: {
        Row: {
          date_created: string
          id: string
          meal_plan: Json
          name: string
          saved_meal_plans_user_id: string
          tdee_id: string | null
        }
        Insert: {
          date_created?: string
          id?: string
          meal_plan: Json
          name: string
          saved_meal_plans_user_id: string
          tdee_id?: string | null
        }
        Update: {
          date_created?: string
          id?: string
          meal_plan?: Json
          name?: string
          saved_meal_plans_user_id?: string
          tdee_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_meal_plans_tdee_id_fkey"
            columns: ["tdee_id"]
            isOneToOne: false
            referencedRelation: "user_tdee"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      status: {
        Row: {
          order_id: string
          status: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          order_id: string
          status: string
          updated_at?: string
          updated_by?: string
        }
        Update: {
          order_id?: string
          status?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          is_trial: boolean
          meals_per_week: number
          plan_name: string
          price: number
          start_date: string
          status: string
          subscriptions_user_id: string
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_trial?: boolean
          meals_per_week: number
          plan_name: string
          price: number
          start_date: string
          status?: string
          subscriptions_user_id: string
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_trial?: boolean
          meals_per_week?: number
          plan_name?: string
          price?: number
          start_date?: string
          status?: string
          subscriptions_user_id?: string
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      support_ticket_messages: {
        Row: {
          attachments: string[] | null
          created_at: string | null
          id: string
          is_internal: boolean | null
          message: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          attachments?: string[] | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          attachments: string[] | null
          category: string
          created_at: string | null
          delivery_assignment_id: string | null
          description: string
          id: string
          order_id: string | null
          priority: string | null
          resolved_at: string | null
          status: string | null
          subject: string
          support_tickets_user_id: string
          ticket_number: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: string[] | null
          category: string
          created_at?: string | null
          delivery_assignment_id?: string | null
          description: string
          id?: string
          order_id?: string | null
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          subject: string
          support_tickets_user_id: string
          ticket_number: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: string[] | null
          category?: string
          created_at?: string | null
          delivery_assignment_id?: string | null
          description?: string
          id?: string
          order_id?: string | null
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string
          support_tickets_user_id?: string
          ticket_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_delivery_assignment_id_fkey"
            columns: ["delivery_assignment_id"]
            isOneToOne: false
            referencedRelation: "delivery_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          contribution_points: number | null
          id: string
          joined_at: string | null
          joined_date: string
          points_contributed: number | null
          role: string
          team_id: string
          team_members_user_id: string
        }
        Insert: {
          contribution_points?: number | null
          id?: string
          joined_at?: string | null
          joined_date?: string
          points_contributed?: number | null
          role?: string
          team_id: string
          team_members_user_id: string
        }
        Update: {
          contribution_points?: number | null
          id?: string
          joined_at?: string | null
          joined_date?: string
          points_contributed?: number | null
          role?: string
          team_id?: string
          team_members_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string
          creator_id: string | null
          description: string | null
          id: string
          member_count: number | null
          members_count: number | null
          name: string
          total_points: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by: string
          creator_id?: string | null
          description?: string | null
          id?: string
          member_count?: number | null
          members_count?: number | null
          name: string
          total_points?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          creator_id?: string | null
          description?: string | null
          id?: string
          member_count?: number | null
          members_count?: number | null
          name?: string
          total_points?: number | null
        }
        Relationships: []
      }
      third_party_sharing_preferences: {
        Row: {
          analytics_sharing: boolean | null
          consent_date: string | null
          created_at: string | null
          data_processing_consent: boolean | null
          id: string
          location_sharing_partners: Json | null
          marketing_sharing: boolean | null
          research_sharing: boolean | null
          third_party_sharing_preferences_user_id: string | null
          updated_at: string | null
        }
        Insert: {
          analytics_sharing?: boolean | null
          consent_date?: string | null
          created_at?: string | null
          data_processing_consent?: boolean | null
          id?: string
          location_sharing_partners?: Json | null
          marketing_sharing?: boolean | null
          research_sharing?: boolean | null
          third_party_sharing_preferences_user_id?: string | null
          updated_at?: string | null
        }
        Update: {
          analytics_sharing?: boolean | null
          consent_date?: string | null
          created_at?: string | null
          data_processing_consent?: boolean | null
          id?: string
          location_sharing_partners?: Json | null
          marketing_sharing?: boolean | null
          research_sharing?: boolean | null
          third_party_sharing_preferences_user_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tip_distributions: {
        Row: {
          created_at: string | null
          delivery_user_id: string
          distributed_at: string | null
          distribution_status: string | null
          driver_tip_amount: number
          driver_tip_percentage: number | null
          failure_reason: string | null
          id: string
          order_id: string
          payment_transaction_id: string | null
          platform_fee_amount: number | null
          restaurant_tip_amount: number | null
          total_tip_amount: number
        }
        Insert: {
          created_at?: string | null
          delivery_user_id: string
          distributed_at?: string | null
          distribution_status?: string | null
          driver_tip_amount: number
          driver_tip_percentage?: number | null
          failure_reason?: string | null
          id?: string
          order_id: string
          payment_transaction_id?: string | null
          platform_fee_amount?: number | null
          restaurant_tip_amount?: number | null
          total_tip_amount: number
        }
        Update: {
          created_at?: string | null
          delivery_user_id?: string
          distributed_at?: string | null
          distribution_status?: string | null
          driver_tip_amount?: number
          driver_tip_percentage?: number | null
          failure_reason?: string | null
          id?: string
          order_id?: string
          payment_transaction_id?: string | null
          platform_fee_amount?: number | null
          restaurant_tip_amount?: number | null
          total_tip_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "tip_distributions_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "delivery_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tip_distributions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tip_distributions_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      traffic_incidents: {
        Row: {
          created_at: string | null
          delay_minutes: number | null
          description: string | null
          end_time: string | null
          id: string
          incident_type: string
          is_active: boolean | null
          latitude: number
          longitude: number
          radius_meters: number | null
          severity: string
          start_time: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delay_minutes?: number | null
          description?: string | null
          end_time?: string | null
          id?: string
          incident_type: string
          is_active?: boolean | null
          latitude: number
          longitude: number
          radius_meters?: number | null
          severity: string
          start_time?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delay_minutes?: number | null
          description?: string | null
          end_time?: string | null
          id?: string
          incident_type?: string
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          radius_meters?: number | null
          severity?: string
          start_time?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      unified_locations: {
        Row: {
          accuracy: number | null
          altitude: number | null
          altitude_accuracy: number | null
          battery_level: number | null
          delivery_assignment_id: string | null
          device_info: Json | null
          geom: unknown | null
          heading: number | null
          id: string
          is_anonymized: boolean | null
          is_moving: boolean | null
          latitude: number
          location_type: string
          longitude: number
          network_type: string | null
          order_id: string | null
          restaurant_id: string | null
          retention_expires_at: string | null
          source: string
          speed: number | null
          timestamp: string
          unified_locations_user_id: string | null
          user_consent: boolean | null
        }
        Insert: {
          accuracy?: number | null
          altitude?: number | null
          altitude_accuracy?: number | null
          battery_level?: number | null
          delivery_assignment_id?: string | null
          device_info?: Json | null
          geom?: unknown | null
          heading?: number | null
          id?: string
          is_anonymized?: boolean | null
          is_moving?: boolean | null
          latitude: number
          location_type: string
          longitude: number
          network_type?: string | null
          order_id?: string | null
          restaurant_id?: string | null
          retention_expires_at?: string | null
          source: string
          speed?: number | null
          timestamp?: string
          unified_locations_user_id?: string | null
          user_consent?: boolean | null
        }
        Update: {
          accuracy?: number | null
          altitude?: number | null
          altitude_accuracy?: number | null
          battery_level?: number | null
          delivery_assignment_id?: string | null
          device_info?: Json | null
          geom?: unknown | null
          heading?: number | null
          id?: string
          is_anonymized?: boolean | null
          is_moving?: boolean | null
          latitude?: number
          location_type?: string
          longitude?: number
          network_type?: string | null
          order_id?: string | null
          restaurant_id?: string | null
          retention_expires_at?: string | null
          source?: string
          speed?: number | null
          timestamp?: string
          unified_locations_user_id?: string | null
          user_consent?: boolean | null
        }
        Relationships: []
      }
      unit_test_customer: {
        Row: {
          actual_output: Json | null
          error_message: string | null
          execution_time: number
          expected_output: Json | null
          function_name: string
          id: string
          input: Json | null
          passed: boolean
          test_name: string
          timestamp: string
        }
        Insert: {
          actual_output?: Json | null
          error_message?: string | null
          execution_time: number
          expected_output?: Json | null
          function_name: string
          id?: string
          input?: Json | null
          passed: boolean
          test_name: string
          timestamp?: string
        }
        Update: {
          actual_output?: Json | null
          error_message?: string | null
          execution_time?: number
          expected_output?: Json | null
          function_name?: string
          id?: string
          input?: Json | null
          passed?: boolean
          test_name?: string
          timestamp?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          date_achieved: string
          id: string
          user_achievements_user_id: string
        }
        Insert: {
          achievement_id: string
          date_achieved?: string
          id?: string
          user_achievements_user_id: string
        }
        Update: {
          achievement_id?: string
          date_achieved?: string
          id?: string
          user_achievements_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_locations: {
        Row: {
          id: string
          latitude: number
          longitude: number
          source: string | null
          timestamp: string
          user_locations_user_id: string
        }
        Insert: {
          id?: string
          latitude: number
          longitude: number
          source?: string | null
          timestamp?: string
          user_locations_user_id: string
        }
        Update: {
          id?: string
          latitude?: number
          longitude?: number
          source?: string | null
          timestamp?: string
          user_locations_user_id?: string
        }
        Relationships: []
      }
      user_measurements: {
        Row: {
          arms: number | null
          body_fat: number | null
          chest: number | null
          date: string
          hips: number | null
          id: string
          legs: number | null
          notes: string | null
          user_measurements_user_id: string
          waist: number | null
          weight: number
        }
        Insert: {
          arms?: number | null
          body_fat?: number | null
          chest?: number | null
          date?: string
          hips?: number | null
          id?: string
          legs?: number | null
          notes?: string | null
          user_measurements_user_id: string
          waist?: number | null
          weight: number
        }
        Update: {
          arms?: number | null
          body_fat?: number | null
          chest?: number | null
          date?: string
          hips?: number | null
          id?: string
          legs?: number | null
          notes?: string | null
          user_measurements_user_id?: string
          waist?: number | null
          weight?: number
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          allergies: string[] | null
          calorie_target: number | null
          carbs_target: number | null
          created_at: string | null
          currency: string
          dietary_restrictions: string[] | null
          fat_target: number | null
          id: string
          location_tracking_enabled: boolean | null
          protein_target: number | null
          updated_at: string | null
          user_preferences_user_id: string
        }
        Insert: {
          allergies?: string[] | null
          calorie_target?: number | null
          carbs_target?: number | null
          created_at?: string | null
          currency?: string
          dietary_restrictions?: string[] | null
          fat_target?: number | null
          id?: string
          location_tracking_enabled?: boolean | null
          protein_target?: number | null
          updated_at?: string | null
          user_preferences_user_id: string
        }
        Update: {
          allergies?: string[] | null
          calorie_target?: number | null
          carbs_target?: number | null
          created_at?: string | null
          currency?: string
          dietary_restrictions?: string[] | null
          fat_target?: number | null
          id?: string
          location_tracking_enabled?: boolean | null
          protein_target?: number | null
          updated_at?: string | null
          user_preferences_user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          currentstreak: number
          id: string
          last_activity_date: string
          longeststreak: number
          streak_type: string
          user_streaks_user_id: string
        }
        Insert: {
          currentstreak?: number
          id?: string
          last_activity_date: string
          longeststreak?: number
          streak_type: string
          user_streaks_user_id: string
        }
        Update: {
          currentstreak?: number
          id?: string
          last_activity_date?: string
          longeststreak?: number
          streak_type?: string
          user_streaks_user_id?: string
        }
        Relationships: []
      }
      user_tdee: {
        Row: {
          activity_level: string
          bmr: number
          carbs_target: number
          date: string
          fat_target: number
          goal: string
          id: string
          notes: string | null
          protein_target: number
          tdee: number
          user_tdee_user_id: string
        }
        Insert: {
          activity_level: string
          bmr: number
          carbs_target: number
          date?: string
          fat_target: number
          goal: string
          id?: string
          notes?: string | null
          protein_target: number
          tdee: number
          user_tdee_user_id: string
        }
        Update: {
          activity_level?: string
          bmr?: number
          carbs_target?: number
          date?: string
          fat_target?: number
          goal?: string
          id?: string
          notes?: string | null
          protein_target?: number
          tdee?: number
          user_tdee_user_id?: string
        }
        Relationships: []
      }
      user_types: {
        Row: {
          created_at: string
          id: string
          type: string
          user_types_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          type: string
          user_types_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: string
          user_types_user_id?: string
        }
        Relationships: []
      }
      user_workout_preferences: {
        Row: {
          auto_progression: boolean | null
          available_equipment: string[] | null
          created_at: string | null
          fitness_level: string | null
          id: string
          injury_history: string[] | null
          intensity_preference: string | null
          preferred_workout_duration: number | null
          preferred_workout_frequency: number | null
          preferred_workout_types: string[] | null
          time_constraints: Json | null
          updated_at: string | null
          user_workout_preferences_user_id: string
        }
        Insert: {
          auto_progression?: boolean | null
          available_equipment?: string[] | null
          created_at?: string | null
          fitness_level?: string | null
          id?: string
          injury_history?: string[] | null
          intensity_preference?: string | null
          preferred_workout_duration?: number | null
          preferred_workout_frequency?: number | null
          preferred_workout_types?: string[] | null
          time_constraints?: Json | null
          updated_at?: string | null
          user_workout_preferences_user_id: string
        }
        Update: {
          auto_progression?: boolean | null
          available_equipment?: string[] | null
          created_at?: string | null
          fitness_level?: string | null
          id?: string
          injury_history?: string[] | null
          intensity_preference?: string | null
          preferred_workout_duration?: number | null
          preferred_workout_frequency?: number | null
          preferred_workout_types?: string[] | null
          time_constraints?: Json | null
          updated_at?: string | null
          user_workout_preferences_user_id?: string
        }
        Relationships: []
      }
      user_workout_stats: {
        Row: {
          calories_burned: number | null
          created_at: string | null
          id: string
          last_workout_date: string | null
          most_active_day: string | null
          streak_days: number | null
          total_time: number | null
          total_workouts: number | null
          updated_at: string | null
          user_workout_stats_user_id: string
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string | null
          id?: string
          last_workout_date?: string | null
          most_active_day?: string | null
          streak_days?: number | null
          total_time?: number | null
          total_workouts?: number | null
          updated_at?: string | null
          user_workout_stats_user_id: string
        }
        Update: {
          calories_burned?: number | null
          created_at?: string | null
          id?: string
          last_workout_date?: string | null
          most_active_day?: string | null
          streak_days?: number | null
          total_time?: number | null
          total_workouts?: number | null
          updated_at?: string | null
          user_workout_stats_user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          error: string | null
          id: string
          idempotency_key: string | null
          payload: Json | null
          processed_at: string | null
          request_data: Json | null
          response_data: Json | null
          restaurant_assigned: string | null
          status: string | null
          webhook_type: string | null
        }
        Insert: {
          error?: string | null
          id?: string
          idempotency_key?: string | null
          payload?: Json | null
          processed_at?: string | null
          request_data?: Json | null
          response_data?: Json | null
          restaurant_assigned?: string | null
          status?: string | null
          webhook_type?: string | null
        }
        Update: {
          error?: string | null
          id?: string
          idempotency_key?: string | null
          payload?: Json | null
          processed_at?: string | null
          request_data?: Json | null
          response_data?: Json | null
          restaurant_assigned?: string | null
          status?: string | null
          webhook_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_restaurant_assigned_fkey"
            columns: ["restaurant_assigned"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_adaptations: {
        Row: {
          adaptation_type: string
          applied_at: string | null
          created_at: string | null
          exercise_name: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          reason: string | null
          workout_adaptations_user_id: string
          workout_plan_id: string | null
        }
        Insert: {
          adaptation_type: string
          applied_at?: string | null
          created_at?: string | null
          exercise_name?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          workout_adaptations_user_id: string
          workout_plan_id?: string | null
        }
        Update: {
          adaptation_type?: string
          applied_at?: string | null
          created_at?: string | null
          exercise_name?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          workout_adaptations_user_id?: string
          workout_plan_id?: string | null
        }
        Relationships: []
      }
      workout_analytics: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          metric_date: string
          metric_type: string
          metric_value: number
          workout_analytics_user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_date: string
          metric_type: string
          metric_value: number
          workout_analytics_user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_date?: string
          metric_type?: string
          metric_value?: number
          workout_analytics_user_id?: string
        }
        Relationships: []
      }
      workout_data_exports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          date_range_end: string | null
          date_range_start: string | null
          error_message: string | null
          export_type: string
          file_format: string
          file_path: string | null
          id: string
          status: string
          workout_data_exports_user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          error_message?: string | null
          export_type: string
          file_format: string
          file_path?: string | null
          id?: string
          status?: string
          workout_data_exports_user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          error_message?: string | null
          export_type?: string
          file_format?: string
          file_path?: string | null
          id?: string
          status?: string
          workout_data_exports_user_id?: string
        }
        Relationships: []
      }
      workout_goals: {
        Row: {
          created_at: string | null
          current_value: number | null
          description: string | null
          goal_type: string
          id: string
          is_active: boolean | null
          target_date: string | null
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string | null
          workout_goals_user_id: string
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          goal_type: string
          id?: string
          is_active?: boolean | null
          target_date?: string | null
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string | null
          workout_goals_user_id: string
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          goal_type?: string
          id?: string
          is_active?: boolean | null
          target_date?: string | null
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string | null
          workout_goals_user_id?: string
        }
        Relationships: []
      }
      workout_history: {
        Row: {
          calories_burned: number | null
          date: string | null
          duration: number
          exercises_completed: number
          id: string
          total_exercises: number
          workout_day_name: string
          workout_history_user_id: string
          workout_log_id: string
          workout_plan_name: string
        }
        Insert: {
          calories_burned?: number | null
          date?: string | null
          duration: number
          exercises_completed: number
          id?: string
          total_exercises: number
          workout_day_name: string
          workout_history_user_id: string
          workout_log_id: string
          workout_plan_name: string
        }
        Update: {
          calories_burned?: number | null
          date?: string | null
          duration?: number
          exercises_completed?: number
          id?: string
          total_exercises?: number
          workout_day_name?: string
          workout_history_user_id?: string
          workout_log_id?: string
          workout_plan_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_history_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          avg_heart_rate: number | null
          calories_burned: number | null
          completed_exercises: Json
          date: string | null
          duration: number
          id: string
          max_heart_rate: number | null
          notes: string | null
          perceived_exertion: number | null
          total_volume: number | null
          workout_logs_user_id: string
          workout_plan_id: string
        }
        Insert: {
          avg_heart_rate?: number | null
          calories_burned?: number | null
          completed_exercises: Json
          date?: string | null
          duration: number
          id?: string
          max_heart_rate?: number | null
          notes?: string | null
          perceived_exertion?: number | null
          total_volume?: number | null
          workout_logs_user_id: string
          workout_plan_id: string
        }
        Update: {
          avg_heart_rate?: number | null
          calories_burned?: number | null
          completed_exercises?: Json
          date?: string | null
          duration?: number
          id?: string
          max_heart_rate?: number | null
          notes?: string | null
          perceived_exertion?: number | null
          total_volume?: number | null
          workout_logs_user_id?: string
          workout_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs_enhanced: {
        Row: {
          average_heart_rate: number | null
          completed_at: string | null
          created_at: string | null
          id: string
          location: string | null
          max_heart_rate: number | null
          notes: string | null
          perceived_exertion: number | null
          started_at: string
          total_calories_burned: number | null
          total_duration_minutes: number | null
          updated_at: string | null
          weather_conditions: string | null
          workout_logs_enhanced_user_id: string
          workout_name: string
          workout_rating: number | null
          workout_template_id: string | null
        }
        Insert: {
          average_heart_rate?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          max_heart_rate?: number | null
          notes?: string | null
          perceived_exertion?: number | null
          started_at: string
          total_calories_burned?: number | null
          total_duration_minutes?: number | null
          updated_at?: string | null
          weather_conditions?: string | null
          workout_logs_enhanced_user_id: string
          workout_name: string
          workout_rating?: number | null
          workout_template_id?: string | null
        }
        Update: {
          average_heart_rate?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          max_heart_rate?: number | null
          notes?: string | null
          perceived_exertion?: number | null
          started_at?: string
          total_calories_burned?: number | null
          total_duration_minutes?: number | null
          updated_at?: string | null
          weather_conditions?: string | null
          workout_logs_enhanced_user_id?: string
          workout_name?: string
          workout_rating?: number | null
          workout_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_enhanced_workout_template_id_fkey"
            columns: ["workout_template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates_enhanced"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plan_templates: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string
          duration_weeks: number
          equipment_needed: string[] | null
          goal_focus: string
          id: string
          is_active: boolean | null
          is_public: boolean | null
          name: string
          progression_scheme: Json | null
          rating: number | null
          sessions_per_week: number
          target_audience: string[] | null
          updated_at: string | null
          usage_count: number | null
          weekly_structure: Json
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level: string
          duration_weeks: number
          equipment_needed?: string[] | null
          goal_focus: string
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name: string
          progression_scheme?: Json | null
          rating?: number | null
          sessions_per_week: number
          target_audience?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
          weekly_structure: Json
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string
          duration_weeks?: number
          equipment_needed?: string[] | null
          goal_focus?: string
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name?: string
          progression_scheme?: Json | null
          rating?: number | null
          sessions_per_week?: number
          target_audience?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
          weekly_structure?: Json
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string
          duration_weeks: number
          frequency: number
          goal: string
          id: string
          is_custom: boolean | null
          name: string
          template_id: string | null
          updated_at: string | null
          workout_days: Json
          workout_plans_user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty: string
          duration_weeks: number
          frequency: number
          goal: string
          id?: string
          is_custom?: boolean | null
          name: string
          template_id?: string | null
          updated_at?: string | null
          workout_days: Json
          workout_plans_user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string
          duration_weeks?: number
          frequency?: number
          goal?: string
          id?: string
          is_custom?: boolean | null
          name?: string
          template_id?: string | null
          updated_at?: string | null
          workout_days?: Json
          workout_plans_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_plans_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_recommendations: {
        Row: {
          applied: boolean | null
          applied_at: string | null
          confidence_score: number | null
          created_at: string | null
          description: string | null
          dismissed: boolean | null
          dismissed_at: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          reason: string | null
          suggested_at: string | null
          title: string | null
          type: string | null
          updated_at: string | null
          workout_recommendations_user_id: string | null
        }
        Insert: {
          applied?: boolean | null
          applied_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          dismissed?: boolean | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          suggested_at?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          workout_recommendations_user_id?: string | null
        }
        Update: {
          applied?: boolean | null
          applied_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          dismissed?: boolean | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          suggested_at?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          workout_recommendations_user_id?: string | null
        }
        Relationships: []
      }
      workout_reminders: {
        Row: {
          created_at: string | null
          id: string
          reminder_time: string
          sent_at: string | null
          status: string
          workout_reminders_user_id: string
          workout_session_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reminder_time: string
          sent_at?: string | null
          status?: string
          workout_reminders_user_id: string
          workout_session_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reminder_time?: string
          sent_at?: string | null
          status?: string
          workout_reminders_user_id?: string
          workout_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_reminders_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_schedules: {
        Row: {
          created_at: string | null
          days_of_week: number[]
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          preferred_time: string | null
          reminder_enabled: boolean
          reminder_minutes_before: number
          start_date: string
          timezone: string
          updated_at: string | null
          workout_plan_id: string
          workout_schedules_user_id: string
        }
        Insert: {
          created_at?: string | null
          days_of_week: number[]
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          preferred_time?: string | null
          reminder_enabled?: boolean
          reminder_minutes_before?: number
          start_date: string
          timezone?: string
          updated_at?: string | null
          workout_plan_id: string
          workout_schedules_user_id: string
        }
        Update: {
          created_at?: string | null
          days_of_week?: number[]
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          preferred_time?: string | null
          reminder_enabled?: boolean
          reminder_minutes_before?: number
          start_date?: string
          timezone?: string
          updated_at?: string | null
          workout_plan_id?: string
          workout_schedules_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_schedules_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          calories_burned: number | null
          completed_at: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          scheduled_date: string
          scheduled_time: string | null
          started_at: string | null
          status: string
          updated_at: string | null
          workout_data: Json | null
          workout_plan_id: string
          workout_schedule_id: string | null
          workout_sessions_user_id: string
        }
        Insert: {
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          workout_data?: Json | null
          workout_plan_id: string
          workout_schedule_id?: string | null
          workout_sessions_user_id: string
        }
        Update: {
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          workout_data?: Json | null
          workout_plan_id?: string
          workout_schedule_id?: string | null
          workout_sessions_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_workout_sessions_workout_plan_id"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_workout_schedule_id_fkey"
            columns: ["workout_schedule_id"]
            isOneToOne: false
            referencedRelation: "workout_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_share_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          share_id: string | null
          updated_at: string | null
          workout_share_comments_user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          share_id?: string | null
          updated_at?: string | null
          workout_share_comments_user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          share_id?: string | null
          updated_at?: string | null
          workout_share_comments_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_share_comments_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "workout_shares"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_share_likes: {
        Row: {
          created_at: string | null
          id: string
          share_id: string | null
          workout_share_likes_user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          share_id?: string | null
          workout_share_likes_user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          share_id?: string | null
          workout_share_likes_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_share_likes_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "workout_shares"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_shares: {
        Row: {
          comments_count: number | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          likes_count: number | null
          share_type: string
          title: string
          updated_at: string | null
          workout_log_id: string | null
          workout_plan_id: string | null
          workout_shares_user_id: string
        }
        Insert: {
          comments_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          share_type: string
          title: string
          updated_at?: string | null
          workout_log_id?: string | null
          workout_plan_id?: string | null
          workout_shares_user_id: string
        }
        Update: {
          comments_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          share_type?: string
          title?: string
          updated_at?: string | null
          workout_log_id?: string | null
          workout_plan_id?: string | null
          workout_shares_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_shares_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_shares_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string
          duration_weeks: number | null
          frequency: number | null
          frequency_per_week: number | null
          goal: string | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string | null
          workout_days: Json
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty: string
          duration_weeks?: number | null
          frequency?: number | null
          frequency_per_week?: number | null
          goal?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string | null
          workout_days: Json
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string
          duration_weeks?: number | null
          frequency?: number | null
          frequency_per_week?: number | null
          goal?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          workout_days?: Json
        }
        Relationships: []
      }
      workout_templates_enhanced: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string
          duration_minutes: number | null
          equipment_needed: string[] | null
          estimated_calories_burned: number | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          name: string
          rating: number | null
          target_muscles: string[] | null
          updated_at: string | null
          usage_count: number | null
          workout_structure: Json
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level: string
          duration_minutes?: number | null
          equipment_needed?: string[] | null
          estimated_calories_burned?: number | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name: string
          rating?: number | null
          target_muscles?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
          workout_structure: Json
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string
          duration_minutes?: number | null
          equipment_needed?: string[] | null
          estimated_calories_burned?: number | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name?: string
          rating?: number | null
          target_muscles?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
          workout_structure?: Json
        }
        Relationships: []
      }
    }
    Views: {
      flexible_order_items: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string | null
          item_category: string | null
          meal_id: string | null
          menu_item_id: string | null
          name: string | null
          order_id: string | null
          price: number | null
          quantity: number | null
          source_type: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: never
          id?: string | null
          item_category?: never
          meal_id?: string | null
          menu_item_id?: string | null
          name?: string | null
          order_id?: string | null
          price?: number | null
          quantity?: number | null
          source_type?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: never
          id?: string | null
          item_category?: never
          meal_id?: string | null
          menu_item_id?: string | null
          name?: string | null
          order_id?: string | null
          price?: number | null
          quantity?: number | null
          source_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { oldname: string; newname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { tbl: unknown; col: string }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: { tbl: unknown; att_name: string; geom: unknown; mode?: string }
        Returns: number
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: { "": unknown }
        Returns: number
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: { "": unknown }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: { geom: unknown }
        Returns: number
      }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          g1: unknown
          clip?: unknown
          tolerance?: number
          return_polygons?: boolean
        }
        Returns: unknown
      }
      _st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      addauth: {
        Args: { "": string }
        Returns: boolean
      }
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              schema_name: string
              table_name: string
              column_name: string
              new_srid_in: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
          | {
              schema_name: string
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
          | {
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
        Returns: string
      }
      advance_preparation_stage: {
        Args: {
          p_order_id: string
          p_current_stage_name: string
          p_notes?: string
        }
        Returns: Json
      }
      anonymize_user_location_data: {
        Args: { p_user_id: string; p_precision_level?: number }
        Returns: number
      }
      box: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box3d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3dtobox: {
        Args: { "": unknown }
        Returns: unknown
      }
      bytea: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      calculate_commission: {
        Args: { p_order_amount: number; p_restaurant_id?: string }
        Returns: {
          commission_amount: number
          processing_fee: number
          net_earnings: number
          commission_rate: number
        }[]
      }
      calculate_delivery_daily_analytics: {
        Args: { p_delivery_user_id: string; p_date: string }
        Returns: undefined
      }
      calculate_delivery_distance: {
        Args: { lat1: number; lng1: number; lat2: number; lng2: number }
        Returns: number
      }
      calculate_delivery_eta: {
        Args: {
          p_delivery_assignment_id: string
          p_driver_lat: number
          p_driver_lng: number
          p_destination_lat: number
          p_destination_lng: number
          p_traffic_factor?: number
        }
        Returns: {
          eta_minutes: number
          distance_km: number
          estimated_arrival: string
        }[]
      }
      calculate_delivery_priority_score: {
        Args: {
          p_delivery_user_id: string
          p_restaurant_lat: number
          p_restaurant_lng: number
          p_restaurant_id?: string
        }
        Returns: number
      }
      calculate_exercise_progress: {
        Args: { p_user_id: string; p_workout_log_id: string }
        Returns: undefined
      }
      calculate_health_score: {
        Args: {
          p_calories: number
          p_protein: number
          p_carbs: number
          p_fats: number
          p_fiber: number
          p_sugar: number
          p_sodium: number
        }
        Returns: number
      }
      calculate_portion_price: {
        Args: {
          base_price: number
          base_portion: number
          requested_portion: number
        }
        Returns: number
      }
      calculate_route_eta: {
        Args: {
          p_route_id: string
          p_current_latitude: number
          p_current_longitude: number
        }
        Returns: string
      }
      check_delivery_zone: {
        Args: { p_latitude: number; p_longitude: number }
        Returns: {
          zone_id: string
          zone_name: string
          base_fee: number
          per_km_fee: number
        }[]
      }
      check_expired_assignments: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_restaurant_meal_capability: {
        Args: { p_restaurant_id: string; p_food_items: Json }
        Returns: boolean
      }
      check_valid_status_transition: {
        Args: { old_status: string; new_status: string }
        Returns: boolean
      }
      check_verified_purchase: {
        Args: { user_id: string; meal_id: string }
        Returns: boolean
      }
      complete_sync_operation: {
        Args: {
          p_log_id: string
          p_success: boolean
          p_locations_synced?: number
          p_conflicts_detected?: number
          p_conflicts_resolved?: number
          p_errors_encountered?: number
          p_data_size_kb?: number
          p_error_message?: string
          p_error_details?: Json
        }
        Returns: boolean
      }
      confirm_payment: {
        Args: {
          p_confirmation_id: string
          p_confirming_user_id: string
          p_confirmation_method?: string
        }
        Returns: boolean
      }
      create_app_config_table: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      create_default_preparation_stages: {
        Args: { p_order_id: string; p_restaurant_id: string }
        Returns: undefined
      }
      create_multi_restaurant_assignment: {
        Args: {
          p_food_items: Json
          p_customer_lat?: number
          p_customer_lng?: number
        }
        Returns: Json
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_title: string
          p_message: string
          p_notification_type: string
          p_order_id?: string
          p_restaurant_id?: string
          p_delivery_user_id?: string
          p_data?: Json
        }
        Returns: string
      }
      create_order_event: {
        Args: {
          p_order_id: string
          p_event_type: string
          p_event_data?: Json
          p_user_id?: string
          p_delivery_user_id?: string
          p_restaurant_id?: string
        }
        Returns: string
      }
      create_restaurant_profile: {
        Args: {
          p_user_id: string
          p_name: string
          p_email: string
          p_phone: string
          p_address: string
          p_city: string
          p_description?: string
        }
        Returns: string
      }
      decrement_delivery_count: {
        Args: { user_id: string }
        Returns: undefined
      }
      delete_user_location_history: {
        Args: { p_user_id: string; p_older_than_days?: number }
        Returns: number
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              schema_name: string
              table_name: string
              column_name: string
            }
          | { schema_name: string; table_name: string; column_name: string }
          | { table_name: string; column_name: string }
        Returns: string
      }
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string }
        Returns: string
      }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      export_user_location_data: {
        Args: {
          p_user_id: string
          p_format?: string
          p_include_anonymized?: boolean
        }
        Returns: Json
      }
      find_best_drivers_for_assignment: {
        Args: {
          p_restaurant_id: string
          p_restaurant_lat: number
          p_restaurant_lng: number
          p_max_distance_km?: number
          p_limit?: number
        }
        Returns: {
          delivery_user_id: string
          driver_name: string
          priority_score: number
          distance_km: number
          current_deliveries: number
          average_rating: number
        }[]
      }
      find_capable_restaurants_for_meal: {
        Args: {
          p_food_items: Json
          p_max_distance_km?: number
          p_customer_lat?: number
          p_customer_lng?: number
        }
        Returns: {
          restaurant_id: string
          restaurant_name: string
          distance_km: number
          estimated_prep_time: number
          can_prepare_complete_meal: boolean
        }[]
      }
      find_nearby_delivery_assignments: {
        Args: {
          p_latitude: number
          p_longitude: number
          p_max_distance_km?: number
        }
        Returns: {
          id: string
          order_id: string
          restaurant_id: string
          delivery_user_id: string
          status: string
          created_at: string
          updated_at: string
          pickup_time: string
          delivery_time: string
          estimated_delivery_time: string
          distance_km: number
          restaurant_name: string
          restaurant_address: string
          restaurant_latitude: number
          restaurant_longitude: number
          customer_name: string
          customer_address: string
          customer_latitude: number
          customer_longitude: number
        }[]
      }
      find_nearby_locations: {
        Args: {
          p_latitude: number
          p_longitude: number
          p_radius_km?: number
          p_location_type?: string
          p_limit?: number
        }
        Returns: {
          accuracy: number | null
          altitude: number | null
          altitude_accuracy: number | null
          battery_level: number | null
          delivery_assignment_id: string | null
          device_info: Json | null
          geom: unknown | null
          heading: number | null
          id: string
          is_anonymized: boolean | null
          is_moving: boolean | null
          latitude: number
          location_type: string
          longitude: number
          network_type: string | null
          order_id: string | null
          restaurant_id: string | null
          retention_expires_at: string | null
          source: string
          speed: number | null
          timestamp: string
          unified_locations_user_id: string | null
          user_consent: boolean | null
        }[]
      }
      find_nearest_restaurant: {
        Args:
          | { order_lat: number; order_lng: number; max_distance_km?: number }
          | { order_lat: number; order_lng: number; max_distance_km?: number }
        Returns: {
          restaurant_id: string
          restaurant_name: string
          restaurant_address: string
          restaurant_email: string
          distance_km: number
        }[]
      }
      force_accept_order: {
        Args: {
          p_assignment_id: string
          p_order_id: string
          p_restaurant_id: string
        }
        Returns: Json
      }
      generate_order_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_performance_alert: {
        Args: {
          p_delivery_user_id: string
          p_alert_type: string
          p_severity: string
          p_title: string
          p_description: string
          p_threshold_value?: number
          p_actual_value?: number
        }
        Returns: string
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_weekly_summary: {
        Args: { p_delivery_user_id: string; p_week_start: string }
        Returns: undefined
      }
      generate_workout_sessions: {
        Args: {
          p_schedule_id: string
          p_start_date?: string
          p_end_date?: string
        }
        Returns: number
      }
      geography: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      geography_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_send: {
        Args: { "": unknown }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geography_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry: {
        Args:
          | { "": string }
          | { "": string }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
        Returns: unknown
      }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_hash: {
        Args: { "": unknown }
        Returns: number
      }
      geometry_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_recv: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_send: {
        Args: { "": unknown }
        Returns: string
      }
      geometry_sortsupport: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geometry_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometrytype: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      get_cheapest_food_pricing: {
        Args: { p_food_name: string; p_portion_size?: number }
        Returns: {
          food_item_id: string
          food_name: string
          restaurant_id: string
          restaurant_name: string
          calculated_price: number
          portion_size: number
        }[]
      }
      get_current_active_stage: {
        Args: { p_order_id: string }
        Returns: {
          stage_name: string
          status: string
          started_at: string
          estimated_duration_minutes: number
        }[]
      }
      get_current_break_status: {
        Args: { p_delivery_user_id: string }
        Returns: {
          is_on_break: boolean
          break_type: string
          break_start_time: string
          estimated_end_time: string
        }[]
      }
      get_food_pricing: {
        Args: {
          p_food_name: string
          p_restaurant_id?: string
          p_portion_size?: number
        }
        Returns: {
          food_item_id: string
          food_name: string
          restaurant_id: string
          restaurant_name: string
          base_price: number
          calculated_price: number
          portion_size: number
          base_unit: string
          nutritional_info: Json
        }[]
      }
      get_meals_with_details: {
        Args: {
          p_restaurant_id?: string
          p_dietary_tag?: string
          p_min_calories?: number
          p_max_calories?: number
          p_is_active?: boolean
        }
        Returns: {
          meal_id: string
          restaurant_id: string
          meal_name: string
          description: string
          price: number
          preparation_time: number
          is_active: boolean
          image_url: string
          calories: number
          protein: number
          carbs: number
          fats: number
          fiber: number
          sugar: number
          sodium: number
          allergens: string[]
          dietary_tags: Json
          health_score: number
        }[]
      }
      get_or_create_anonymization_settings: {
        Args: { p_user_id: string }
        Returns: {
          anonymize_device_info: boolean | null
          anonymize_location_data: boolean | null
          anonymize_usage_patterns: boolean | null
          created_at: string | null
          data_anonymization_settings_user_id: string | null
          id: string
          precision_reduction_level: number | null
          updated_at: string | null
        }
      }
      get_or_create_delivery_location_settings: {
        Args: { p_delivery_user_id: string }
        Returns: {
          auto_stop_sharing_after_delivery: boolean | null
          background_location_enabled: boolean | null
          battery_optimization_enabled: boolean | null
          created_at: string | null
          custom_geofence_zones: Json | null
          delivery_user_id: string
          delivery_zone_radius: number | null
          geofence_entry_notifications: boolean | null
          geofence_exit_notifications: boolean | null
          high_accuracy_interval: number | null
          high_accuracy_threshold: number | null
          id: string
          location_sharing_duration: number | null
          low_accuracy_interval: number | null
          low_accuracy_threshold: number | null
          medium_accuracy_interval: number | null
          medium_accuracy_threshold: number | null
          movement_detection_sensitivity: string | null
          sharing_precision_level: string | null
          updated_at: string | null
        }
      }
      get_or_create_location_retention_policy: {
        Args: { p_user_id: string }
        Returns: {
          auto_anonymize_after_days: number
          auto_delete_after_days: number
          created_at: string | null
          export_format: string | null
          id: string
          location_data_retention_policies_user_id: string | null
          retention_period_days: number
          updated_at: string | null
        }
      }
      get_or_create_sharing_preferences: {
        Args: { p_user_id: string }
        Returns: {
          analytics_sharing: boolean | null
          consent_date: string | null
          created_at: string | null
          data_processing_consent: boolean | null
          id: string
          location_sharing_partners: Json | null
          marketing_sharing: boolean | null
          research_sharing: boolean | null
          third_party_sharing_preferences_user_id: string | null
          updated_at: string | null
        }
      }
      get_order_preparation_progress: {
        Args: { p_order_id: string }
        Returns: {
          stage_name: string
          status: string
          stage_order: number
          started_at: string
          completed_at: string
          estimated_duration_minutes: number
          actual_duration_minutes: number
          notes: string
          progress_percentage: number
        }[]
      }
      get_pending_restaurant_assignments: {
        Args: { p_restaurant_id: string }
        Returns: {
          assignment_id: string
          order_id: string
          expires_at: string
          assigned_at: string
          customer_id: string
          customer_name: string
          customer_email: string
          customer_phone: string
          delivery_address: string
          city: string
          delivery_method: string
          payment_method: string
          delivery_fee: number
          subtotal: number
          order_total: number
          order_created_at: string
          order_updated_at: string
          order_status: string
          latitude: number
          longitude: number
          formatted_order_id: string
          restaurant_id: string
          assignment_source: string
          notes: string
          order_items: Json
        }[]
      }
      get_proj4_from_srid: {
        Args: { "": number }
        Returns: string
      }
      get_recommendation_feedback: {
        Args: { p_user_id: string; p_recommendation_id: string }
        Returns: {
          id: string
          user_id: string
          recommendation_id: string
          feedback_type: string
          rating: number
          comments: string
          created_at: string
        }[]
      }
      get_restaurant_orders_with_stages: {
        Args: { p_restaurant_id: string }
        Returns: {
          order_id: string
          customer_name: string
          customer_phone: string
          delivery_address: string
          order_status: string
          total: number
          created_at: string
          stage_id: string
          stage_name: string
          stage_status: string
          stage_order: number
          estimated_duration_minutes: number
          actual_duration_minutes: number
          stage_started_at: string
          stage_completed_at: string
          stage_notes: string
          overall_progress: number
        }[]
      }
      get_user_adaptations: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          user_id: string
          workout_plan_id: string
          exercise_name: string
          adaptation_type: string
          old_value: Json
          new_value: Json
          reason: string
          applied_at: string
          created_at: string
        }[]
      }
      get_user_info: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_workout_preferences: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          user_id: string
          preferred_workout_duration: number
          preferred_workout_frequency: number
          preferred_workout_types: string[]
          fitness_level: string
          available_equipment: string[]
          injury_history: string[]
          time_constraints: Json
          intensity_preference: string
          auto_progression: boolean
          created_at: string
          updated_at: string
        }[]
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gidx_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      handle_expired_delivery_assignments: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      handle_order_rejection: {
        Args: {
          p_assignment_id: string
          p_restaurant_id: string
          p_rejection_reason: string
          p_rejection_details?: string
        }
        Returns: boolean
      }
      increment_delivery_count: {
        Args: { user_id: string }
        Returns: undefined
      }
      initialize_payment_coordination: {
        Args: { p_order_id: string }
        Returns: string
      }
      insert_recommendation_feedback: {
        Args: {
          p_user_id: string
          p_recommendation_id: string
          p_feedback_type: string
          p_rating?: number
          p_comments?: string
        }
        Returns: string
      }
      insert_workout_adaptation: {
        Args: {
          p_user_id: string
          p_adaptation_type: string
          p_workout_plan_id?: string
          p_exercise_name?: string
          p_old_value?: Json
          p_new_value?: Json
          p_reason?: string
          p_applied_at?: string
        }
        Returns: string
      }
      insert_workout_recommendation: {
        Args: {
          p_user_id: string
          p_title: string
          p_type: string
          p_description?: string
          p_reason?: string
          p_confidence_score?: number
          p_metadata?: Json
        }
        Returns: string
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_delivery_user_available: {
        Args: { p_delivery_user_id: string; p_check_time?: string }
        Returns: boolean
      }
      json: {
        Args: { "": unknown }
        Returns: Json
      }
      jsonb: {
        Args: { "": unknown }
        Returns: Json
      }
      log_admin_action: {
        Args: {
          p_admin_user_id: string
          p_action_type: string
          p_target_type: string
          p_target_id?: string
          p_details?: Json
        }
        Returns: string
      }
      log_error: {
        Args: {
          p_error_type: string
          p_error_message: string
          p_error_details?: Json
          p_related_order_id?: string
          p_is_critical?: boolean
        }
        Returns: string
      }
      log_sync_conflict: {
        Args: {
          p_delivery_user_id: string
          p_sync_log_id: string
          p_conflict_type: string
          p_resource_id: string
          p_resource_type: string
          p_local_data: Json
          p_server_data: Json
          p_resolution_strategy?: string
          p_conflict_score?: number
        }
        Returns: string
      }
      log_sync_operation: {
        Args: {
          p_delivery_user_id: string
          p_sync_type: string
          p_operation_type: string
          p_sync_trigger?: string
          p_start_time?: string
          p_network_type?: string
          p_connection_quality?: string
          p_battery_level?: number
        }
        Returns: string
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      migrate_existing_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      path: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      point: {
        Args: { "": unknown }
        Returns: unknown
      }
      polygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      populate_geometry_columns: {
        Args:
          | { tbl_oid: unknown; use_typmod?: boolean }
          | { use_typmod?: boolean }
        Returns: string
      }
      postgis_addbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: string
      }
      postgis_dropbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: { "": unknown }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          geomname: string
          coord_dimension: number
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_type: {
        Args: { "": number }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      process_payment_transaction: {
        Args: {
          p_order_id: string
          p_customer_id: string
          p_transaction_type: string
          p_amount: number
          p_payment_method: string
          p_external_transaction_id?: string
        }
        Returns: string
      }
      process_tip_distribution: {
        Args: {
          p_order_id: string
          p_total_tip_amount: number
          p_driver_tip_percentage?: number
        }
        Returns: string
      }
      send_customer_notification: {
        Args: {
          p_order_id: string
          p_notification_type: string
          p_title: string
          p_message: string
          p_data?: Json
        }
        Returns: string
      }
      send_payment_notification: {
        Args: {
          p_order_id: string
          p_recipient_id: string
          p_recipient_type: string
          p_notification_type: string
          p_title: string
          p_message: string
          p_amount?: number
        }
        Returns: string
      }
      spheroid_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      spheroid_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlength: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dperimeter: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
        Returns: number
      }
      st_area: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_area2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_asbinary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_asewkt: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asgeojson: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              r: Record<string, unknown>
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
            }
        Returns: string
      }
      st_asgml: {
        Args:
          | { "": string }
          | {
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              version: number
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
          | {
              version: number
              geom: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
        Returns: string
      }
      st_ashexewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_askml: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
        Returns: string
      }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: {
        Args: { geom: unknown; format?: string }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          geom: unknown
          bounds: unknown
          extent?: number
          buffer?: number
          clip_geom?: boolean
        }
        Returns: unknown
      }
      st_assvg: {
        Args:
          | { "": string }
          | { geog: unknown; rel?: number; maxdecimaldigits?: number }
          | { geom: unknown; rel?: number; maxdecimaldigits?: number }
        Returns: string
      }
      st_astext: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_astwkb: {
        Args:
          | {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
            }
          | {
              geom: unknown
              prec?: number
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
            }
        Returns: string
      }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_boundary: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: { geom: unknown; fits?: boolean }
        Returns: unknown
      }
      st_buffer: {
        Args:
          | { geom: unknown; radius: number; options?: string }
          | { geom: unknown; radius: number; quadsegs: number }
        Returns: unknown
      }
      st_buildarea: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_centroid: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: { geom: unknown; box: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      st_collect: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collectionextract: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_geom: unknown
          param_pctconvex: number
          param_allow_holes?: boolean
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_convexhull: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_coorddim: {
        Args: { geometry: unknown }
        Returns: number
      }
      st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_curvetoline: {
        Args: { geom: unknown; tol?: number; toltype?: number; flags?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { g1: unknown; tolerance?: number; flags?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_dimension: {
        Args: { "": unknown }
        Returns: number
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number }
        Returns: number
      }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dump: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_envelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { geom: unknown; dx: number; dy: number; dz?: number; dm?: number }
        Returns: unknown
      }
      st_exteriorring: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force3d: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; zvalue?: number; mvalue?: number }
        Returns: unknown
      }
      st_forcecollection: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcecurve: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcerhr: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcesfs: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_generatepoints: {
        Args:
          | { area: unknown; npoints: number }
          | { area: unknown; npoints: number; seed: number }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geohash: {
        Args:
          | { geog: unknown; maxchars?: number }
          | { geom: unknown; maxchars?: number }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          g: unknown
          tolerance?: number
          max_iter?: number
          fail_if_not_converged?: boolean
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometrytype: {
        Args: { "": unknown }
        Returns: string
      }
      st_geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromgeojson: {
        Args: { "": Json } | { "": Json } | { "": string }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: { marc21xml: string }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_gmltosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_hasarc: {
        Args: { geometry: unknown }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { size: number; bounds: unknown }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_isclosed: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_iscollection: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isempty: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isring: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_issimple: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvalid: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: { geom: unknown; flags?: number }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: { "": unknown }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_length: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_length2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_letters: {
        Args: { letters: string; font?: Json }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { txtin: string; nprecision?: number }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linemerge: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linetocurve: {
        Args: { geometry: unknown }
        Returns: unknown
      }
      st_locatealong: {
        Args: { geometry: unknown; measure: number; leftrightoffset?: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          geometry: unknown
          frommeasure: number
          tomeasure: number
          leftrightoffset?: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { geometry: unknown; fromelevation: number; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_m: {
        Args: { "": unknown }
        Returns: number
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makepolygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { "": unknown } | { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multi: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_ndims: {
        Args: { "": unknown }
        Returns: number
      }
      st_node: {
        Args: { g: unknown }
        Returns: unknown
      }
      st_normalize: {
        Args: { geom: unknown }
        Returns: unknown
      }
      st_npoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_nrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numgeometries: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorring: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpatches: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_offsetcurve: {
        Args: { line: unknown; distance: number; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { "": unknown } | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_perimeter2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_pointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_points: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonize: {
        Args: { "": unknown[] }
        Returns: unknown
      }
      st_project: {
        Args: { geog: unknown; distance: number; azimuth: number }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_x: number
          prec_y?: number
          prec_z?: number
          prec_m?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_reverse: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; vertex_fraction: number; is_outer?: boolean }
        Returns: unknown
      }
      st_split: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_square: {
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { size: number; bounds: unknown }
        Returns: Record<string, unknown>[]
      }
      st_srid: {
        Args: { geog: unknown } | { geom: unknown }
        Returns: number
      }
      st_startpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_subdivide: {
        Args: { geom: unknown; maxvertices?: number; gridsize?: number }
        Returns: unknown[]
      }
      st_summary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          zoom: number
          x: number
          y: number
          bounds?: unknown
          margin?: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_transform: {
        Args:
          | { geom: unknown; from_proj: string; to_proj: string }
          | { geom: unknown; from_proj: string; to_srid: number }
          | { geom: unknown; to_proj: string }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: { g1: unknown }
        Returns: unknown
      }
      st_union: {
        Args:
          | { "": unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number }
        Returns: unknown
      }
      st_voronoilines: {
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown }
        Returns: unknown
      }
      st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: { wkb: string }
        Returns: unknown
      }
      st_wkttosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_wrapx: {
        Args: { geom: unknown; wrap: number; move: number }
        Returns: unknown
      }
      st_x: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmin: {
        Args: { "": unknown }
        Returns: number
      }
      st_y: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymax: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymin: {
        Args: { "": unknown }
        Returns: number
      }
      st_z: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmflag: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmin: {
        Args: { "": unknown }
        Returns: number
      }
      text: {
        Args: { "": unknown }
        Returns: string
      }
      unlockrows: {
        Args: { "": string }
        Returns: number
      }
      update_driver_location_with_eta: {
        Args: {
          p_delivery_assignment_id: string
          p_delivery_user_id: string
          p_latitude: number
          p_longitude: number
          p_accuracy?: number
          p_altitude?: number
          p_heading?: number
          p_speed?: number
          p_battery_level?: number
          p_network_type?: string
        }
        Returns: {
          location_id: string
          eta_minutes: number
          estimated_arrival: string
        }[]
      }
      update_global_meal_rating_cache: {
        Args: { p_meal_id: string }
        Returns: undefined
      }
      update_meal_rating_cache: {
        Args: { p_meal_id: string; p_restaurant_id: string }
        Returns: undefined
      }
      update_navigation_progress: {
        Args: {
          p_session_id: string
          p_current_latitude: number
          p_current_longitude: number
        }
        Returns: boolean
      }
      update_restaurant_performance_metrics: {
        Args: { p_restaurant_id: string; p_date: string }
        Returns: undefined
      }
      update_workout_analytics: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      update_workout_stats_and_achievements: {
        Args: {
          p_user_id: string
          p_workout_date: string
          p_duration: number
          p_calories_burned?: number
        }
        Returns: undefined
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          schema_name: string
          table_name: string
          column_name: string
          new_srid_in: number
        }
        Returns: string
      }
      valid_status_transition: {
        Args: { old_status: string; new_status: string }
        Returns: boolean
      }
      validate_location_quality: {
        Args: {
          p_delivery_user_id: string
          p_latitude: number
          p_longitude: number
          p_accuracy: number
          p_provider?: string
          p_timestamp?: string
        }
        Returns: {
          is_valid: boolean
          confidence_score: number
          validation_errors: string[]
          should_use_backup: boolean
        }[]
      }
      validate_menu_item_exists: {
        Args: { p_meal_id: string }
        Returns: boolean
      }
      validate_order_status_transition: {
        Args: { old_status: string; new_status: string }
        Returns: boolean
      }
    }
    Enums: {
      log_type: "click" | "error" | "api" | "database"
      order_status_enum:
        | "pending"
        | "awaiting_restaurant"
        | "restaurant_assigned"
        | "restaurant_accepted"
        | "preparing"
        | "ready_for_pickup"
        | "picked_up"
        | "on_the_way"
        | "delivered"
        | "cancelled"
        | "no_restaurant_available"
        | "no_restaurant_accepted"
        | "expired_assignment"
        | "refunded"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
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
      log_type: ["click", "error", "api", "database"],
      order_status_enum: [
        "pending",
        "awaiting_restaurant",
        "restaurant_assigned",
        "restaurant_accepted",
        "preparing",
        "ready_for_pickup",
        "picked_up",
        "on_the_way",
        "delivered",
        "cancelled",
        "no_restaurant_available",
        "no_restaurant_accepted",
        "expired_assignment",
        "refunded",
      ],
    },
  },
} as const

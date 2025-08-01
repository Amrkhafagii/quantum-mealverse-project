export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      achievement_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: number
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      achievement_definitions: {
        Row: {
          badge_color: string | null
          category: string
          created_at: string | null
          criteria: Json
          description: string
          difficulty: string | null
          icon: string
          id: string
          is_active: boolean | null
          is_repeatable: boolean | null
          name: string
          points: number | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          badge_color?: string | null
          category: string
          created_at?: string | null
          criteria: Json
          description: string
          difficulty?: string | null
          icon: string
          id?: string
          is_active?: boolean | null
          is_repeatable?: boolean | null
          name: string
          points?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          badge_color?: string | null
          category?: string
          created_at?: string | null
          criteria?: Json
          description?: string
          difficulty?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          is_repeatable?: boolean | null
          name?: string
          points?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      achievement_notifications: {
        Row: {
          achievement_id: number
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          notification_type: string
          title: string
          user_id: string
        }
        Insert: {
          achievement_id: number
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          notification_type: string
          title: string
          user_id: string
        }
        Update: {
          achievement_id?: number
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          notification_type?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievement_notifications_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievement_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "achievement_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      achievement_progress: {
        Row: {
          achievement_id: string
          created_at: string | null
          current_value: number | null
          id: string
          last_updated: string | null
          metadata: Json | null
          progress_percentage: number | null
          target_value: number
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string | null
          current_value?: number | null
          id?: string
          last_updated?: string | null
          metadata?: Json | null
          progress_percentage?: number | null
          target_value: number
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string | null
          current_value?: number | null
          id?: string
          last_updated?: string | null
          metadata?: Json | null
          progress_percentage?: number | null
          target_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievement_progress_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievement_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievement_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "achievement_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      achievements: {
        Row: {
          category: string | null
          category_id: number | null
          created_at: string | null
          criteria: Json
          description: string
          difficulty: string | null
          icon: string | null
          id: number
          is_active: boolean | null
          is_secret: boolean | null
          metadata: Json | null
          name: string
          points: number | null
          prerequisites: Json | null
          reward_points: number | null
          target_value: number | null
          title: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          category_id?: number | null
          created_at?: string | null
          criteria: Json
          description: string
          difficulty?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          is_secret?: boolean | null
          metadata?: Json | null
          name: string
          points?: number | null
          prerequisites?: Json | null
          reward_points?: number | null
          target_value?: number | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          category_id?: number | null
          created_at?: string | null
          criteria?: Json
          description?: string
          difficulty?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          is_secret?: boolean | null
          metadata?: Json | null
          name?: string
          points?: number | null
          prerequisites?: Json | null
          reward_points?: number | null
          target_value?: number | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "achievements_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "achievement_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_feed: {
        Row: {
          activity_type: string
          actor_id: string
          content: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          target_id: string | null
          target_type: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          actor_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          target_id?: string | null
          target_type?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          actor_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          target_id?: string | null
          target_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "activity_feed_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "activity_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "activity_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      anonymous_backups: {
        Row: {
          backup_id: string
          backup_key: string
          created_at: string | null
          data_version: number | null
          device_fingerprint: string
          encrypted_data: Json
          expires_at: string | null
        }
        Insert: {
          backup_id?: string
          backup_key: string
          created_at?: string | null
          data_version?: number | null
          device_fingerprint: string
          encrypted_data: Json
          expires_at?: string | null
        }
        Update: {
          backup_id?: string
          backup_key?: string
          created_at?: string | null
          data_version?: number | null
          device_fingerprint?: string
          encrypted_data?: Json
          expires_at?: string | null
        }
        Relationships: []
      }
      body_composition: {
        Row: {
          bmr_calories: number | null
          body_fat_percentage: number | null
          bone_mass_kg: number | null
          created_at: string | null
          id: string
          measured_at: string | null
          measurement_method: string | null
          metabolic_age: number | null
          muscle_mass_kg: number | null
          notes: string | null
          user_id: string
          visceral_fat_level: number | null
          water_percentage: number | null
        }
        Insert: {
          bmr_calories?: number | null
          body_fat_percentage?: number | null
          bone_mass_kg?: number | null
          created_at?: string | null
          id?: string
          measured_at?: string | null
          measurement_method?: string | null
          metabolic_age?: number | null
          muscle_mass_kg?: number | null
          notes?: string | null
          user_id: string
          visceral_fat_level?: number | null
          water_percentage?: number | null
        }
        Update: {
          bmr_calories?: number | null
          body_fat_percentage?: number | null
          bone_mass_kg?: number | null
          created_at?: string | null
          id?: string
          measured_at?: string | null
          measurement_method?: string | null
          metabolic_age?: number | null
          muscle_mass_kg?: number | null
          notes?: string | null
          user_id?: string
          visceral_fat_level?: number | null
          water_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "body_composition_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "body_composition_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      body_measurements: {
        Row: {
          bicep_left: number | null
          bicep_right: number | null
          body_fat_percentage: number | null
          calf_left: number | null
          calf_right: number | null
          chest: number | null
          created_at: string | null
          forearm_left: number | null
          forearm_right: number | null
          hips: number | null
          id: string
          measurement_date: string
          muscle_mass: number | null
          neck: number | null
          notes: string | null
          thigh_left: number | null
          thigh_right: number | null
          updated_at: string | null
          user_id: string
          waist: number | null
          weight: number | null
        }
        Insert: {
          bicep_left?: number | null
          bicep_right?: number | null
          body_fat_percentage?: number | null
          calf_left?: number | null
          calf_right?: number | null
          chest?: number | null
          created_at?: string | null
          forearm_left?: number | null
          forearm_right?: number | null
          hips?: number | null
          id?: string
          measurement_date?: string
          muscle_mass?: number | null
          neck?: number | null
          notes?: string | null
          thigh_left?: number | null
          thigh_right?: number | null
          updated_at?: string | null
          user_id: string
          waist?: number | null
          weight?: number | null
        }
        Update: {
          bicep_left?: number | null
          bicep_right?: number | null
          body_fat_percentage?: number | null
          calf_left?: number | null
          calf_right?: number | null
          chest?: number | null
          created_at?: string | null
          forearm_left?: number | null
          forearm_right?: number | null
          hips?: number | null
          id?: string
          measurement_date?: string
          muscle_mass?: number | null
          neck?: number | null
          notes?: string | null
          thigh_left?: number | null
          thigh_right?: number | null
          updated_at?: string | null
          user_id?: string
          waist?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "body_measurements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "body_measurements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      challenge_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      challenge_leaderboard_snapshots: {
        Row: {
          challenge_id: string
          created_at: string | null
          id: string
          leaderboard_data: Json
          snapshot_date: string | null
          statistics: Json | null
          top_performers: Json | null
        }
        Insert: {
          challenge_id: string
          created_at?: string | null
          id?: string
          leaderboard_data: Json
          snapshot_date?: string | null
          statistics?: Json | null
          top_performers?: Json | null
        }
        Update: {
          challenge_id?: string
          created_at?: string | null
          id?: string
          leaderboard_data?: Json
          snapshot_date?: string | null
          statistics?: Json | null
          top_performers?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_leaderboard_snapshots_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "community_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_notifications: {
        Row: {
          challenge_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          notification_type: string
          title: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          notification_type: string
          title: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          notification_type?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_notifications_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "challenge_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      challenge_participants: {
        Row: {
          best_progress: number | null
          challenge_id: string
          completed_at: string | null
          created_at: string | null
          current_progress: number | null
          id: string
          is_completed: boolean | null
          joined_at: string | null
          metadata: Json | null
          notes: string | null
          rank: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          best_progress?: number | null
          challenge_id: string
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          id?: string
          is_completed?: boolean | null
          joined_at?: string | null
          metadata?: Json | null
          notes?: string | null
          rank?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          best_progress?: number | null
          challenge_id?: string
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          id?: string
          is_completed?: boolean | null
          joined_at?: string | null
          metadata?: Json | null
          notes?: string | null
          rank?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "community_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "challenge_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      challenge_rewards: {
        Row: {
          challenge_id: string | null
          created_at: string | null
          eligibility_criteria: Json | null
          id: string
          is_active: boolean | null
          reward_data: Json | null
          reward_description: string | null
          reward_name: string
          reward_type: string
          reward_value: number | null
          template_id: string | null
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string | null
          eligibility_criteria?: Json | null
          id?: string
          is_active?: boolean | null
          reward_data?: Json | null
          reward_description?: string | null
          reward_name: string
          reward_type: string
          reward_value?: number | null
          template_id?: string | null
        }
        Update: {
          challenge_id?: string | null
          created_at?: string | null
          eligibility_criteria?: Json | null
          id?: string
          is_active?: boolean | null
          reward_data?: Json | null
          reward_description?: string | null
          reward_name?: string
          reward_type?: string
          reward_value?: number | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_rewards_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "community_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_rewards_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "challenge_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_templates: {
        Row: {
          average_completion_time: number | null
          category: string | null
          challenge_type: string | null
          created_at: string | null
          created_by: string | null
          description: string
          difficulty_level: string | null
          duration_days: number
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          name: string
          prerequisites: Json | null
          rewards: Json | null
          rules: Json | null
          success_rate: number | null
          tags: string[] | null
          target_metric: string
          target_unit: string
          target_value: number
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          average_completion_time?: number | null
          category?: string | null
          challenge_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          difficulty_level?: string | null
          duration_days: number
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          name: string
          prerequisites?: Json | null
          rewards?: Json | null
          rules?: Json | null
          success_rate?: number | null
          tags?: string[] | null
          target_metric: string
          target_unit: string
          target_value: number
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          average_completion_time?: number | null
          category?: string | null
          challenge_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          difficulty_level?: string | null
          duration_days?: number
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          name?: string
          prerequisites?: Json | null
          rewards?: Json | null
          rules?: Json | null
          success_rate?: number | null
          tags?: string[] | null
          target_metric?: string
          target_unit?: string
          target_value?: number
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "challenge_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      challenges: {
        Row: {
          category_id: string | null
          created_at: string | null
          created_by: string | null
          current_participants: number | null
          description: string
          difficulty: string | null
          end_date: string
          id: string
          is_featured: boolean | null
          max_participants: number | null
          metadata: Json | null
          privacy_level: string | null
          reward_badge: string | null
          reward_points: number | null
          reward_title: string | null
          start_date: string | null
          status: string | null
          target_unit: string
          target_value: number
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          description: string
          difficulty?: string | null
          end_date: string
          id?: string
          is_featured?: boolean | null
          max_participants?: number | null
          metadata?: Json | null
          privacy_level?: string | null
          reward_badge?: string | null
          reward_points?: number | null
          reward_title?: string | null
          start_date?: string | null
          status?: string | null
          target_unit: string
          target_value: number
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          description?: string
          difficulty?: string | null
          end_date?: string
          id?: string
          is_featured?: boolean | null
          max_participants?: number | null
          metadata?: Json | null
          privacy_level?: string | null
          reward_badge?: string | null
          reward_points?: number | null
          reward_title?: string | null
          start_date?: string | null
          status?: string | null
          target_unit?: string
          target_value?: number
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "challenge_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "challenges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      community_challenges: {
        Row: {
          challenge_type: string | null
          created_at: string | null
          created_by: string
          description: string
          end_date: string
          entry_fee: number | null
          featured: boolean | null
          id: string
          is_public: boolean | null
          max_participants: number | null
          participant_count: number | null
          prize_description: string | null
          rules: Json | null
          start_date: string
          status: string | null
          tags: string[] | null
          target_unit: string | null
          target_value: number
          title: string
          updated_at: string | null
        }
        Insert: {
          challenge_type?: string | null
          created_at?: string | null
          created_by: string
          description: string
          end_date: string
          entry_fee?: number | null
          featured?: boolean | null
          id?: string
          is_public?: boolean | null
          max_participants?: number | null
          participant_count?: number | null
          prize_description?: string | null
          rules?: Json | null
          start_date: string
          status?: string | null
          tags?: string[] | null
          target_unit?: string | null
          target_value: number
          title: string
          updated_at?: string | null
        }
        Update: {
          challenge_type?: string | null
          created_at?: string | null
          created_by?: string
          description?: string
          end_date?: string
          entry_fee?: number | null
          featured?: boolean | null
          id?: string
          is_public?: boolean | null
          max_participants?: number | null
          participant_count?: number | null
          prize_description?: string | null
          rules?: Json | null
          start_date?: string
          status?: string | null
          tags?: string[] | null
          target_unit?: string | null
          target_value?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_challenges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_challenges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      conflict_resolution: {
        Row: {
          conflict_type: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          local_data: Json
          local_version: number
          remote_data: Json
          remote_version: number
          resolution_strategy: string | null
          resolved_at: string | null
          resolved_by: string | null
          resolved_data: Json | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          conflict_type: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          local_data: Json
          local_version: number
          remote_data: Json
          remote_version: number
          resolution_strategy?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resolved_data?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          conflict_type?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          local_data?: Json
          local_version?: number
          remote_data?: Json
          remote_version?: number
          resolution_strategy?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resolved_data?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conflict_resolution_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conflict_resolution_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conflict_resolution_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conflict_resolution_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      device_profiles: {
        Row: {
          allow_anonymous_sharing: boolean | null
          app_version: string | null
          avatar_url: string | null
          backup_key_hash: string | null
          bio: string | null
          cloud_backup_enabled: boolean | null
          created_at: string | null
          date_of_birth: string | null
          device_fingerprint: string
          device_id: string
          device_name: string | null
          first_seen_at: string | null
          fitness_level: string | null
          full_name: string | null
          height_cm: number | null
          is_public: boolean | null
          last_active_at: string | null
          last_backup_at: string | null
          platform: string
          preferred_units: string | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          allow_anonymous_sharing?: boolean | null
          app_version?: string | null
          avatar_url?: string | null
          backup_key_hash?: string | null
          bio?: string | null
          cloud_backup_enabled?: boolean | null
          created_at?: string | null
          date_of_birth?: string | null
          device_fingerprint: string
          device_id: string
          device_name?: string | null
          first_seen_at?: string | null
          fitness_level?: string | null
          full_name?: string | null
          height_cm?: number | null
          is_public?: boolean | null
          last_active_at?: string | null
          last_backup_at?: string | null
          platform: string
          preferred_units?: string | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          allow_anonymous_sharing?: boolean | null
          app_version?: string | null
          avatar_url?: string | null
          backup_key_hash?: string | null
          bio?: string | null
          cloud_backup_enabled?: boolean | null
          created_at?: string | null
          date_of_birth?: string | null
          device_fingerprint?: string
          device_id?: string
          device_name?: string | null
          first_seen_at?: string | null
          fitness_level?: string | null
          full_name?: string | null
          height_cm?: number | null
          is_public?: boolean | null
          last_active_at?: string | null
          last_backup_at?: string | null
          platform?: string
          preferred_units?: string | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      entity_versions: {
        Row: {
          checksum: string
          created_at: string | null
          data_snapshot: Json | null
          entity_id: string
          entity_type: string
          id: string
          last_modified_at: string | null
          last_modified_by: string | null
          user_id: string | null
          version_number: number
        }
        Insert: {
          checksum: string
          created_at?: string | null
          data_snapshot?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          last_modified_at?: string | null
          last_modified_by?: string | null
          user_id?: string | null
          version_number?: number
        }
        Update: {
          checksum?: string
          created_at?: string | null
          data_snapshot?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          last_modified_at?: string | null
          last_modified_by?: string | null
          user_id?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "entity_versions_last_modified_by_fkey"
            columns: ["last_modified_by"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "entity_versions_last_modified_by_fkey"
            columns: ["last_modified_by"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "entity_versions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "entity_versions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      exercise_analytics: {
        Row: {
          analysis_period: string | null
          average_reps: number | null
          average_weight_kg: number | null
          consistency_score: number | null
          created_at: string | null
          exercise_id: string
          form_improvement_score: number | null
          id: string
          max_reps: number | null
          max_weight_kg: number | null
          period_end: string
          period_start: string
          plateau_indicator: boolean | null
          recommended_progression: Json | null
          strength_progression_rate: number | null
          total_reps: number | null
          total_sessions: number | null
          total_sets: number | null
          total_volume_kg: number | null
          user_id: string
          volume_progression_rate: number | null
        }
        Insert: {
          analysis_period?: string | null
          average_reps?: number | null
          average_weight_kg?: number | null
          consistency_score?: number | null
          created_at?: string | null
          exercise_id: string
          form_improvement_score?: number | null
          id?: string
          max_reps?: number | null
          max_weight_kg?: number | null
          period_end: string
          period_start: string
          plateau_indicator?: boolean | null
          recommended_progression?: Json | null
          strength_progression_rate?: number | null
          total_reps?: number | null
          total_sessions?: number | null
          total_sets?: number | null
          total_volume_kg?: number | null
          user_id: string
          volume_progression_rate?: number | null
        }
        Update: {
          analysis_period?: string | null
          average_reps?: number | null
          average_weight_kg?: number | null
          consistency_score?: number | null
          created_at?: string | null
          exercise_id?: string
          form_improvement_score?: number | null
          id?: string
          max_reps?: number | null
          max_weight_kg?: number | null
          period_end?: string
          period_start?: string
          plateau_indicator?: boolean | null
          recommended_progression?: Json | null
          strength_progression_rate?: number | null
          total_reps?: number | null
          total_sessions?: number | null
          total_sets?: number | null
          total_volume_kg?: number | null
          user_id?: string
          volume_progression_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_analytics_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["exercise_id"]
          },
          {
            foreignKeyName: "exercise_analytics_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "exercise_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      exercise_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      exercise_sets: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          distance_meters: number | null
          duration_seconds: number | null
          id: string
          is_drop_set: boolean | null
          is_failure: boolean | null
          is_warmup: boolean | null
          notes: string | null
          reps: number | null
          rest_time_seconds: number | null
          rpe: number | null
          set_number: number
          updated_at: string | null
          weight_kg: number | null
          workout_exercise_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          distance_meters?: number | null
          duration_seconds?: number | null
          id?: string
          is_drop_set?: boolean | null
          is_failure?: boolean | null
          is_warmup?: boolean | null
          notes?: string | null
          reps?: number | null
          rest_time_seconds?: number | null
          rpe?: number | null
          set_number: number
          updated_at?: string | null
          weight_kg?: number | null
          workout_exercise_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          distance_meters?: number | null
          duration_seconds?: number | null
          id?: string
          is_drop_set?: boolean | null
          is_failure?: boolean | null
          is_warmup?: boolean | null
          notes?: string | null
          reps?: number | null
          rest_time_seconds?: number | null
          rpe?: number | null
          set_number?: number
          updated_at?: string | null
          weight_kg?: number | null
          workout_exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_sets_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          category_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          equipment: string[] | null
          id: string
          image_url: string | null
          instructions: string | null
          is_custom: boolean | null
          muscle_groups: string[] | null
          name: string
          tips: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          equipment?: string[] | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_custom?: boolean | null
          muscle_groups?: string[] | null
          name: string
          tips?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          equipment?: string[] | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_custom?: boolean | null
          muscle_groups?: string[] | null
          name?: string
          tips?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "exercise_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "exercises_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      friendships: {
        Row: {
          addressee_id: string | null
          created_at: string | null
          id: number
          requester_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          addressee_id?: string | null
          created_at?: string | null
          id?: number
          requester_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          addressee_id?: string | null
          created_at?: string | null
          id?: number
          requester_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friendships_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      global_statistics: {
        Row: {
          calculated_at: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          period_end: string | null
          period_start: string | null
          stat_period: string | null
          stat_type: string
          value: number
        }
        Insert: {
          calculated_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          period_end?: string | null
          period_start?: string | null
          stat_period?: string | null
          stat_type: string
          value: number
        }
        Update: {
          calculated_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          period_end?: string | null
          period_start?: string | null
          stat_period?: string | null
          stat_type?: string
          value?: number
        }
        Relationships: []
      }
      goal_tracking: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string | null
          current_value: number | null
          description: string | null
          goal_type: string
          id: string
          last_updated: string | null
          milestones: Json | null
          notes: string | null
          priority: string | null
          progress_percentage: number | null
          start_date: string | null
          status: string | null
          target_date: string | null
          target_value: number
          title: string
          tracking_frequency: string | null
          unit: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          goal_type: string
          id?: string
          last_updated?: string | null
          milestones?: Json | null
          notes?: string | null
          priority?: string | null
          progress_percentage?: number | null
          start_date?: string | null
          status?: string | null
          target_date?: string | null
          target_value: number
          title: string
          tracking_frequency?: string | null
          unit: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          goal_type?: string
          id?: string
          last_updated?: string | null
          milestones?: Json | null
          notes?: string | null
          priority?: string | null
          progress_percentage?: number | null
          start_date?: string | null
          status?: string | null
          target_date?: string | null
          target_value?: number
          title?: string
          tracking_frequency?: string | null
          unit?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "goal_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      leaderboard_entries: {
        Row: {
          additional_metrics: Json | null
          created_at: string | null
          entry_date: string | null
          id: string
          is_tied: boolean | null
          last_activity: string | null
          leaderboard_id: string
          previous_rank: number | null
          rank: number
          rank_change: number | null
          score: number
          tie_breaker_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          additional_metrics?: Json | null
          created_at?: string | null
          entry_date?: string | null
          id?: string
          is_tied?: boolean | null
          last_activity?: string | null
          leaderboard_id: string
          previous_rank?: number | null
          rank: number
          rank_change?: number | null
          score: number
          tie_breaker_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          additional_metrics?: Json | null
          created_at?: string | null
          entry_date?: string | null
          id?: string
          is_tied?: boolean | null
          last_activity?: string | null
          leaderboard_id?: string
          previous_rank?: number | null
          rank?: number
          rank_change?: number | null
          score?: number
          tie_breaker_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_entries_leaderboard_id_fkey"
            columns: ["leaderboard_id"]
            isOneToOne: false
            referencedRelation: "leaderboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboard_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "leaderboard_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      leaderboards: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          end_date: string | null
          entry_criteria: Json | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          last_updated: string | null
          max_entries: number | null
          metric_type: string
          name: string
          start_date: string | null
          time_period: string | null
          update_frequency: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          entry_criteria?: Json | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          last_updated?: string | null
          max_entries?: number | null
          metric_type: string
          name: string
          start_date?: string | null
          time_period?: string | null
          update_frequency?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          entry_criteria?: Json | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          last_updated?: string | null
          max_entries?: number | null
          metric_type?: string
          name?: string
          start_date?: string | null
          time_period?: string | null
          update_frequency?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      measurement_goals: {
        Row: {
          achieved_at: string | null
          created_at: string | null
          current_value: number | null
          goal_type: string | null
          id: string
          is_active: boolean | null
          max_value: number | null
          measurement_type_id: string
          min_value: number | null
          notes: string | null
          start_value: number | null
          target_date: string | null
          target_value: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          created_at?: string | null
          current_value?: number | null
          goal_type?: string | null
          id?: string
          is_active?: boolean | null
          max_value?: number | null
          measurement_type_id: string
          min_value?: number | null
          notes?: string | null
          start_value?: number | null
          target_date?: string | null
          target_value: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          created_at?: string | null
          current_value?: number | null
          goal_type?: string | null
          id?: string
          is_active?: boolean | null
          max_value?: number | null
          measurement_type_id?: string
          min_value?: number | null
          notes?: string | null
          start_value?: number | null
          target_date?: string | null
          target_value?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "measurement_goals_measurement_type_id_fkey"
            columns: ["measurement_type_id"]
            isOneToOne: false
            referencedRelation: "measurement_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "measurement_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "measurement_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      measurement_photos: {
        Row: {
          angle: string | null
          associated_measurements: string[] | null
          created_at: string | null
          id: string
          is_private: boolean | null
          measurement_date: string | null
          notes: string | null
          photo_type: string | null
          photo_url: string
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          angle?: string | null
          associated_measurements?: string[] | null
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          measurement_date?: string | null
          notes?: string | null
          photo_type?: string | null
          photo_url: string
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          angle?: string | null
          associated_measurements?: string[] | null
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          measurement_date?: string | null
          notes?: string | null
          photo_type?: string | null
          photo_url?: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "measurement_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "measurement_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      measurement_types: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          display_name: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          unit: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          unit: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          unit?: string
        }
        Relationships: []
      }
      media_cache: {
        Row: {
          access_count: number | null
          cache_priority: number | null
          checksum: string
          created_at: string | null
          expires_at: string | null
          file_size: number
          id: string
          is_synced: boolean | null
          last_accessed_at: string | null
          local_path: string
          media_type: string
          media_url: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_count?: number | null
          cache_priority?: number | null
          checksum: string
          created_at?: string | null
          expires_at?: string | null
          file_size: number
          id?: string
          is_synced?: boolean | null
          last_accessed_at?: string | null
          local_path: string
          media_type: string
          media_url: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_count?: number | null
          cache_priority?: number | null
          checksum?: string
          created_at?: string | null
          expires_at?: string | null
          file_size?: number
          id?: string
          is_synced?: boolean | null
          last_accessed_at?: string | null
          local_path?: string
          media_type?: string
          media_url?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_cache_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "media_cache_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      milestones: {
        Row: {
          achieved_at: string | null
          celebration_viewed: boolean | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          milestone_type: string
          title: string
          unit: string | null
          user_id: string
          value: number | null
        }
        Insert: {
          achieved_at?: string | null
          celebration_viewed?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          milestone_type: string
          title: string
          unit?: string | null
          user_id: string
          value?: number | null
        }
        Update: {
          achieved_at?: string | null
          celebration_viewed?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          milestone_type?: string
          title?: string
          unit?: string | null
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "milestones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      nutrition_logs: {
        Row: {
          calories: number | null
          carbs_g: number | null
          created_at: string | null
          fat_g: number | null
          fiber_g: number | null
          food_item: string
          id: string
          log_date: string | null
          meal_type: string | null
          notes: string | null
          protein_g: number | null
          quantity: number | null
          sodium_mg: number | null
          sugar_g: number | null
          unit: string | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string | null
          fat_g?: number | null
          fiber_g?: number | null
          food_item: string
          id?: string
          log_date?: string | null
          meal_type?: string | null
          notes?: string | null
          protein_g?: number | null
          quantity?: number | null
          sodium_mg?: number | null
          sugar_g?: number | null
          unit?: string | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string | null
          fat_g?: number | null
          fiber_g?: number | null
          food_item?: string
          id?: string
          log_date?: string | null
          meal_type?: string | null
          notes?: string | null
          protein_g?: number | null
          quantity?: number | null
          sodium_mg?: number | null
          sugar_g?: number | null
          unit?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "nutrition_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      offline_sessions: {
        Row: {
          created_at: string | null
          ended_at: string | null
          id: string
          is_synced: boolean | null
          last_sync_attempt_at: string | null
          local_session_id: string
          session_data: Json
          session_type: string
          started_at: string
          sync_attempts: number | null
          sync_error: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          is_synced?: boolean | null
          last_sync_attempt_at?: string | null
          local_session_id: string
          session_data: Json
          session_type: string
          started_at: string
          sync_attempts?: number | null
          sync_error?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          is_synced?: boolean | null
          last_sync_attempt_at?: string | null
          local_session_id?: string
          session_data?: Json
          session_type?: string
          started_at?: string
          sync_attempts?: number | null
          sync_error?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offline_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "offline_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          change_percentage: number | null
          created_at: string | null
          current_value: number
          id: string
          measurement_date: string | null
          metadata: Json | null
          metric_name: string
          metric_type: string
          previous_value: number | null
          time_period: string | null
          trend_direction: string | null
          user_id: string
        }
        Insert: {
          change_percentage?: number | null
          created_at?: string | null
          current_value: number
          id?: string
          measurement_date?: string | null
          metadata?: Json | null
          metric_name: string
          metric_type: string
          previous_value?: number | null
          time_period?: string | null
          trend_direction?: string | null
          user_id: string
        }
        Update: {
          change_percentage?: number | null
          created_at?: string | null
          current_value?: number
          id?: string
          measurement_date?: string | null
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          previous_value?: number | null
          time_period?: string | null
          trend_direction?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "performance_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      performance_trends: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          data_points: number | null
          id: string
          insights: string | null
          metric_type: string
          period_end: string
          period_start: string
          recommendations: string | null
          statistical_significance: boolean | null
          trend_data: Json | null
          trend_direction: string | null
          trend_period: string | null
          trend_strength: number | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          data_points?: number | null
          id?: string
          insights?: string | null
          metric_type: string
          period_end: string
          period_start: string
          recommendations?: string | null
          statistical_significance?: boolean | null
          trend_data?: Json | null
          trend_direction?: string | null
          trend_period?: string | null
          trend_strength?: number | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          data_points?: number | null
          id?: string
          insights?: string | null
          metric_type?: string
          period_end?: string
          period_start?: string
          recommendations?: string | null
          statistical_significance?: boolean | null
          trend_data?: Json | null
          trend_direction?: string | null
          trend_period?: string | null
          trend_strength?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_trends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "performance_trends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      personal_records: {
        Row: {
          achieved_at: string | null
          celebration_viewed: boolean | null
          created_at: string | null
          exercise_id: string
          exercise_set_id: string | null
          id: string
          improvement_percentage: number | null
          is_current: boolean | null
          notes: string | null
          previous_record_value: number | null
          record_type: string
          reps: number | null
          sets: number | null
          unit: string
          user_id: string
          value: number
          verification_status: string | null
          workout_session_id: string | null
        }
        Insert: {
          achieved_at?: string | null
          celebration_viewed?: boolean | null
          created_at?: string | null
          exercise_id: string
          exercise_set_id?: string | null
          id?: string
          improvement_percentage?: number | null
          is_current?: boolean | null
          notes?: string | null
          previous_record_value?: number | null
          record_type: string
          reps?: number | null
          sets?: number | null
          unit: string
          user_id: string
          value: number
          verification_status?: string | null
          workout_session_id?: string | null
        }
        Update: {
          achieved_at?: string | null
          celebration_viewed?: boolean | null
          created_at?: string | null
          exercise_id?: string
          exercise_set_id?: string | null
          id?: string
          improvement_percentage?: number | null
          is_current?: boolean | null
          notes?: string | null
          previous_record_value?: number | null
          record_type?: string
          reps?: number | null
          sets?: number | null
          unit?: string
          user_id?: string
          value?: number
          verification_status?: string | null
          workout_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["exercise_id"]
          },
          {
            foreignKeyName: "personal_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_exercise_set_id_fkey"
            columns: ["exercise_set_id"]
            isOneToOne: false
            referencedRelation: "exercise_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "personal_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "personal_records_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_albums: {
        Row: {
          cover_photo_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_private: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_photo_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_private?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_photo_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_private?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_albums_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "photo_albums_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      photo_analytics: {
        Row: {
          analysis_date: string | null
          analysis_type: string | null
          confidence_score: number | null
          created_at: string | null
          id: string
          insights: string | null
          photo_id: string
          recommendations: string | null
          results: Json | null
          user_id: string
        }
        Insert: {
          analysis_date?: string | null
          analysis_type?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          insights?: string | null
          photo_id: string
          recommendations?: string | null
          results?: Json | null
          user_id: string
        }
        Update: {
          analysis_date?: string | null
          analysis_type?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          insights?: string | null
          photo_id?: string
          recommendations?: string | null
          results?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_analytics_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "progress_photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "photo_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      photo_comparisons: {
        Row: {
          after_photo_id: string | null
          before_photo_id: string | null
          comparison_type: string | null
          created_at: string | null
          description: string | null
          id: string
          is_private: boolean | null
          name: string
          notes: string | null
          time_difference_days: number | null
          updated_at: string | null
          user_id: string
          weight_difference_kg: number | null
        }
        Insert: {
          after_photo_id?: string | null
          before_photo_id?: string | null
          comparison_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          name: string
          notes?: string | null
          time_difference_days?: number | null
          updated_at?: string | null
          user_id: string
          weight_difference_kg?: number | null
        }
        Update: {
          after_photo_id?: string | null
          before_photo_id?: string | null
          comparison_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          name?: string
          notes?: string | null
          time_difference_days?: number | null
          updated_at?: string | null
          user_id?: string
          weight_difference_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_comparisons_after_photo_id_fkey"
            columns: ["after_photo_id"]
            isOneToOne: false
            referencedRelation: "progress_photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_comparisons_before_photo_id_fkey"
            columns: ["before_photo_id"]
            isOneToOne: false
            referencedRelation: "progress_photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_comparisons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "photo_comparisons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      photo_shares: {
        Row: {
          comparison_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          photo_id: string | null
          share_type: string | null
          share_url: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          comparison_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          photo_id?: string | null
          share_type?: string | null
          share_url?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          comparison_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          photo_id?: string | null
          share_type?: string | null
          share_url?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_shares_comparison_id_fkey"
            columns: ["comparison_id"]
            isOneToOne: false
            referencedRelation: "photo_comparisons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_shares_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "progress_photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "photo_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      photo_tags: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "photo_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          edited_at: string | null
          id: string
          is_edited: boolean | null
          like_count: number | null
          mentions: string[] | null
          parent_comment_id: string | null
          post_id: string
          reply_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          like_count?: number | null
          mentions?: string[] | null
          parent_comment_id?: string | null
          post_id: string
          reply_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          like_count?: number | null
          mentions?: string[] | null
          parent_comment_id?: string | null
          post_id?: string
          reply_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          reaction_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          reaction_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          reaction_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          date_of_birth: string | null
          fitness_level: string | null
          full_name: string | null
          height_cm: number | null
          id: string
          is_public: boolean | null
          preferred_units: string | null
          updated_at: string | null
          username: string
          weight_kg: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          fitness_level?: string | null
          full_name?: string | null
          height_cm?: number | null
          id: string
          is_public?: boolean | null
          preferred_units?: string | null
          updated_at?: string | null
          username: string
          weight_kg?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          fitness_level?: string | null
          full_name?: string | null
          height_cm?: number | null
          id?: string
          is_public?: boolean | null
          preferred_units?: string | null
          updated_at?: string | null
          username?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      progress_photos: {
        Row: {
          album_id: string | null
          angle: string | null
          body_fat_percentage: number | null
          body_state: string | null
          clothing_type: string | null
          created_at: string | null
          description: string | null
          id: string
          is_favorite: boolean | null
          is_private: boolean | null
          lighting_condition: string | null
          metadata: Json | null
          photo_date: string | null
          photo_url: string
          tags: string[] | null
          thumbnail_url: string | null
          time_of_day: string | null
          title: string | null
          updated_at: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          album_id?: string | null
          angle?: string | null
          body_fat_percentage?: number | null
          body_state?: string | null
          clothing_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          is_private?: boolean | null
          lighting_condition?: string | null
          metadata?: Json | null
          photo_date?: string | null
          photo_url: string
          tags?: string[] | null
          thumbnail_url?: string | null
          time_of_day?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          album_id?: string | null
          angle?: string | null
          body_fat_percentage?: number | null
          body_state?: string | null
          clothing_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          is_private?: boolean | null
          lighting_condition?: string | null
          metadata?: Json | null
          photo_date?: string | null
          photo_url?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          time_of_day?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "photo_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "progress_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      recovery_metrics: {
        Row: {
          created_at: string | null
          energy_level: number | null
          heart_rate_variability: number | null
          id: string
          measurement_date: string | null
          motivation_level: number | null
          muscle_soreness: number | null
          notes: string | null
          readiness_to_train: number | null
          recovery_score: number | null
          resting_heart_rate: number | null
          stress_level: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          energy_level?: number | null
          heart_rate_variability?: number | null
          id?: string
          measurement_date?: string | null
          motivation_level?: number | null
          muscle_soreness?: number | null
          notes?: string | null
          readiness_to_train?: number | null
          recovery_score?: number | null
          resting_heart_rate?: number | null
          stress_level?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          energy_level?: number | null
          heart_rate_variability?: number | null
          id?: string
          measurement_date?: string | null
          motivation_level?: number | null
          muscle_soreness?: number | null
          notes?: string | null
          readiness_to_train?: number | null
          recovery_score?: number | null
          resting_heart_rate?: number | null
          stress_level?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recovery_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "recovery_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      session_exercises: {
        Row: {
          created_at: string | null
          exercise_id: number | null
          id: number
          notes: string | null
          order_index: number
          session_id: number | null
        }
        Insert: {
          created_at?: string | null
          exercise_id?: number | null
          id?: number
          notes?: string | null
          order_index: number
          session_id?: number | null
        }
        Update: {
          created_at?: string | null
          exercise_id?: number | null
          id?: number
          notes?: string | null
          order_index?: number
          session_id?: number | null
        }
        Relationships: []
      }
      sleep_logs: {
        Row: {
          bedtime: string | null
          created_at: string | null
          deep_sleep_hours: number | null
          duration_hours: number | null
          energy_level: number | null
          id: string
          interruptions: number | null
          mood_on_waking: number | null
          notes: string | null
          quality_rating: number | null
          rem_sleep_hours: number | null
          sleep_date: string | null
          sleep_efficiency: number | null
          user_id: string
          wake_time: string | null
        }
        Insert: {
          bedtime?: string | null
          created_at?: string | null
          deep_sleep_hours?: number | null
          duration_hours?: number | null
          energy_level?: number | null
          id?: string
          interruptions?: number | null
          mood_on_waking?: number | null
          notes?: string | null
          quality_rating?: number | null
          rem_sleep_hours?: number | null
          sleep_date?: string | null
          sleep_efficiency?: number | null
          user_id: string
          wake_time?: string | null
        }
        Update: {
          bedtime?: string | null
          created_at?: string | null
          deep_sleep_hours?: number | null
          duration_hours?: number | null
          energy_level?: number | null
          id?: string
          interruptions?: number | null
          mood_on_waking?: number | null
          notes?: string | null
          quality_rating?: number | null
          rem_sleep_hours?: number | null
          sleep_date?: string | null
          sleep_efficiency?: number | null
          user_id?: string
          wake_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sleep_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sleep_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      social_activity_feed: {
        Row: {
          activity_type: string
          actor_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          metadata: Json | null
          object_id: string
          object_type: string
          user_id: string
        }
        Insert: {
          activity_type: string
          actor_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          object_id: string
          object_type: string
          user_id: string
        }
        Update: {
          activity_type?: string
          actor_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          object_id?: string
          object_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_activity_feed_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "social_activity_feed_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "social_activity_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "social_activity_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      social_notifications: {
        Row: {
          created_at: string | null
          from_user_id: string
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          notification_type: string
          object_id: string | null
          object_type: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          from_user_id: string
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          notification_type: string
          object_id?: string | null
          object_type?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          from_user_id?: string
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          notification_type?: string
          object_id?: string | null
          object_type?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_notifications_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "social_notifications_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "social_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "social_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      social_posts: {
        Row: {
          comment_count: number | null
          content: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          is_public: boolean | null
          like_count: number | null
          media_urls: string[] | null
          mentions: string[] | null
          metadata: Json | null
          post_type: string | null
          privacy_level: string | null
          progress_photo_id: string | null
          share_count: number | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
          view_count: number | null
          workout_session_id: string | null
        }
        Insert: {
          comment_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          is_public?: boolean | null
          like_count?: number | null
          media_urls?: string[] | null
          mentions?: string[] | null
          metadata?: Json | null
          post_type?: string | null
          privacy_level?: string | null
          progress_photo_id?: string | null
          share_count?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
          view_count?: number | null
          workout_session_id?: string | null
        }
        Update: {
          comment_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          is_public?: boolean | null
          like_count?: number | null
          media_urls?: string[] | null
          mentions?: string[] | null
          metadata?: Json | null
          post_type?: string | null
          privacy_level?: string | null
          progress_photo_id?: string | null
          share_count?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
          workout_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_progress_photo_id_fkey"
            columns: ["progress_photo_id"]
            isOneToOne: false
            referencedRelation: "progress_photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "social_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "social_posts_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      streak_history: {
        Row: {
          count: number
          created_at: string | null
          ended_at: string | null
          id: string
          reason: string | null
          started_at: string
          streak_type: string
          user_id: string
        }
        Insert: {
          count: number
          created_at?: string | null
          ended_at?: string | null
          id?: string
          reason?: string | null
          started_at: string
          streak_type: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string | null
          ended_at?: string | null
          id?: string
          reason?: string | null
          started_at?: string
          streak_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streak_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "streak_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      streaks: {
        Row: {
          best_count: number | null
          created_at: string | null
          current_count: number | null
          id: string
          is_active: boolean | null
          last_activity_date: string | null
          last_updated: string | null
          metadata: Json | null
          started_at: string | null
          streak_type: string
          user_id: string
        }
        Insert: {
          best_count?: number | null
          created_at?: string | null
          current_count?: number | null
          id?: string
          is_active?: boolean | null
          last_activity_date?: string | null
          last_updated?: string | null
          metadata?: Json | null
          started_at?: string | null
          streak_type: string
          user_id: string
        }
        Update: {
          best_count?: number | null
          created_at?: string | null
          current_count?: number | null
          id?: string
          is_active?: boolean | null
          last_activity_date?: string | null
          last_updated?: string | null
          metadata?: Json | null
          started_at?: string | null
          streak_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      sync_queue: {
        Row: {
          completed_at: string | null
          created_at: string | null
          data: Json
          entity_id: string
          entity_type: string
          error_message: string | null
          id: string
          max_retries: number | null
          next_retry_at: string | null
          operation_type: string
          priority: number
          retry_count: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          data: Json
          entity_id: string
          entity_type: string
          error_message?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          operation_type: string
          priority?: number
          retry_count?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          data?: Json
          entity_id?: string
          entity_type?: string
          error_message?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          operation_type?: string
          priority?: number
          retry_count?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sync_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      sync_status: {
        Row: {
          completed_at: string | null
          completed_operations: number | null
          created_at: string | null
          current_operation: string | null
          error_details: Json | null
          failed_operations: number | null
          id: string
          last_activity_at: string | null
          progress_percentage: number | null
          session_id: string
          started_at: string | null
          status: string | null
          total_operations: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_operations?: number | null
          created_at?: string | null
          current_operation?: string | null
          error_details?: Json | null
          failed_operations?: number | null
          id?: string
          last_activity_at?: string | null
          progress_percentage?: number | null
          session_id: string
          started_at?: string | null
          status?: string | null
          total_operations?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_operations?: number | null
          created_at?: string | null
          current_operation?: string | null
          error_details?: Json | null
          failed_operations?: number | null
          id?: string
          last_activity_at?: string | null
          progress_percentage?: number | null
          session_id?: string
          started_at?: string | null
          status?: string | null
          total_operations?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sync_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      team_challenges: {
        Row: {
          captain_id: string
          challenge_id: string
          created_at: string | null
          current_members: number | null
          id: string
          invite_code: string | null
          is_private: boolean | null
          max_members: number | null
          team_avatar_url: string | null
          team_description: string | null
          team_motto: string | null
          team_name: string
          team_rank: number | null
          team_score: number | null
          updated_at: string | null
        }
        Insert: {
          captain_id: string
          challenge_id: string
          created_at?: string | null
          current_members?: number | null
          id?: string
          invite_code?: string | null
          is_private?: boolean | null
          max_members?: number | null
          team_avatar_url?: string | null
          team_description?: string | null
          team_motto?: string | null
          team_name: string
          team_rank?: number | null
          team_score?: number | null
          updated_at?: string | null
        }
        Update: {
          captain_id?: string
          challenge_id?: string
          created_at?: string | null
          current_members?: number | null
          id?: string
          invite_code?: string | null
          is_private?: boolean | null
          max_members?: number | null
          team_avatar_url?: string | null
          team_description?: string | null
          team_motto?: string | null
          team_name?: string
          team_rank?: number | null
          team_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_challenges_captain_id_fkey"
            columns: ["captain_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "team_challenges_captain_id_fkey"
            columns: ["captain_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "team_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "community_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          contribution_percentage: number | null
          created_at: string | null
          id: string
          individual_score: number | null
          is_active: boolean | null
          joined_at: string | null
          left_at: string | null
          role: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          contribution_percentage?: number | null
          created_at?: string | null
          id?: string
          individual_score?: number | null
          is_active?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          role?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          contribution_percentage?: number | null
          created_at?: string | null
          id?: string
          individual_score?: number | null
          is_active?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          role?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_achievement_stats: {
        Row: {
          completion_percentage: number | null
          current_streak: number | null
          last_unlock_date: string | null
          longest_streak: number | null
          stats_data: Json | null
          total_achievements: number | null
          total_points: number | null
          unlocked_achievements: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completion_percentage?: number | null
          current_streak?: number | null
          last_unlock_date?: string | null
          longest_streak?: number | null
          stats_data?: Json | null
          total_achievements?: number | null
          total_points?: number | null
          unlocked_achievements?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completion_percentage?: number | null
          current_streak?: number | null
          last_unlock_date?: string | null
          longest_streak?: number | null
          stats_data?: Json | null
          total_achievements?: number | null
          total_points?: number | null
          unlocked_achievements?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievement_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_achievement_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: number | null
          celebration_shown: boolean | null
          id: number
          progress: Json | null
          progress_at_unlock: number | null
          unlock_context: Json | null
          unlocked_at: string | null
          user_id: string | null
        }
        Insert: {
          achievement_id?: number | null
          celebration_shown?: boolean | null
          id?: number
          progress?: Json | null
          progress_at_unlock?: number | null
          unlock_context?: Json | null
          unlocked_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievement_id?: number | null
          celebration_shown?: boolean | null
          id?: number
          progress?: Json | null
          progress_at_unlock?: number | null
          unlock_context?: Json | null
          unlocked_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_analytics_cache: {
        Row: {
          average_workout_duration: number | null
          cache_updated_at: string | null
          created_at: string | null
          current_streak: number | null
          favorite_exercises: Json | null
          last_workout_date: string | null
          longest_streak: number | null
          monthly_stats: Json | null
          personal_records_count: number | null
          total_duration_minutes: number | null
          total_exercises: number | null
          total_reps: number | null
          total_sets: number | null
          total_volume_kg: number | null
          total_workouts: number | null
          user_id: string
          weekly_stats: Json | null
          yearly_stats: Json | null
        }
        Insert: {
          average_workout_duration?: number | null
          cache_updated_at?: string | null
          created_at?: string | null
          current_streak?: number | null
          favorite_exercises?: Json | null
          last_workout_date?: string | null
          longest_streak?: number | null
          monthly_stats?: Json | null
          personal_records_count?: number | null
          total_duration_minutes?: number | null
          total_exercises?: number | null
          total_reps?: number | null
          total_sets?: number | null
          total_volume_kg?: number | null
          total_workouts?: number | null
          user_id: string
          weekly_stats?: Json | null
          yearly_stats?: Json | null
        }
        Update: {
          average_workout_duration?: number | null
          cache_updated_at?: string | null
          created_at?: string | null
          current_streak?: number | null
          favorite_exercises?: Json | null
          last_workout_date?: string | null
          longest_streak?: number | null
          monthly_stats?: Json | null
          personal_records_count?: number | null
          total_duration_minutes?: number | null
          total_exercises?: number | null
          total_reps?: number | null
          total_sets?: number | null
          total_volume_kg?: number | null
          total_workouts?: number | null
          user_id?: string
          weekly_stats?: Json | null
          yearly_stats?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "user_analytics_cache_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_analytics_cache_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_measurements: {
        Row: {
          created_at: string | null
          id: string
          is_estimated: boolean | null
          measured_at: string | null
          measurement_context: string | null
          measurement_type_id: string
          notes: string | null
          photo_url: string | null
          updated_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_estimated?: boolean | null
          measured_at?: string | null
          measurement_context?: string | null
          measurement_type_id: string
          notes?: string | null
          photo_url?: string | null
          updated_at?: string | null
          user_id: string
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          is_estimated?: boolean | null
          measured_at?: string | null
          measurement_context?: string | null
          measurement_type_id?: string
          notes?: string | null
          photo_url?: string | null
          updated_at?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_measurements_measurement_type_id_fkey"
            columns: ["measurement_type_id"]
            isOneToOne: false
            referencedRelation: "measurement_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_measurements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_measurements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_privacy_settings: {
        Row: {
          achievement_visibility: string | null
          activity_feed_enabled: boolean | null
          allow_challenge_invites: boolean | null
          allow_friend_requests: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          profile_visibility: string | null
          push_notifications: boolean | null
          show_online_status: boolean | null
          updated_at: string | null
          user_id: string
          workout_visibility: string | null
        }
        Insert: {
          achievement_visibility?: string | null
          activity_feed_enabled?: boolean | null
          allow_challenge_invites?: boolean | null
          allow_friend_requests?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          profile_visibility?: string | null
          push_notifications?: boolean | null
          show_online_status?: boolean | null
          updated_at?: string | null
          user_id: string
          workout_visibility?: string | null
        }
        Update: {
          achievement_visibility?: string | null
          activity_feed_enabled?: boolean | null
          allow_challenge_invites?: boolean | null
          allow_friend_requests?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          profile_visibility?: string | null
          push_notifications?: boolean | null
          show_online_status?: boolean | null
          updated_at?: string | null
          user_id?: string
          workout_visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_privacy_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_privacy_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          cover_photo_url: string | null
          created_at: string | null
          display_name: string | null
          fitness_goals: string[] | null
          fitness_level: string | null
          follower_count: number | null
          following_count: number | null
          gender: string | null
          id: string
          is_private: boolean | null
          is_trainer: boolean | null
          is_verified: boolean | null
          location: string | null
          notification_settings: Json | null
          post_count: number | null
          preferred_workout_types: string[] | null
          privacy_settings: Json | null
          social_media_links: Json | null
          trainer_certification: string | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          display_name?: string | null
          fitness_goals?: string[] | null
          fitness_level?: string | null
          follower_count?: number | null
          following_count?: number | null
          gender?: string | null
          id: string
          is_private?: boolean | null
          is_trainer?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          notification_settings?: Json | null
          post_count?: number | null
          preferred_workout_types?: string[] | null
          privacy_settings?: Json | null
          social_media_links?: Json | null
          trainer_certification?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          display_name?: string | null
          fitness_goals?: string[] | null
          fitness_level?: string | null
          follower_count?: number | null
          following_count?: number | null
          gender?: string | null
          id?: string
          is_private?: boolean | null
          is_trainer?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          notification_settings?: Json | null
          post_count?: number | null
          preferred_workout_types?: string[] | null
          privacy_settings?: Json | null
          social_media_links?: Json | null
          trainer_certification?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_relationships: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
          relationship_type: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
          relationship_type?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
          relationship_type?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_relationships_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_relationships_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_relationships_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_relationships_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          challenge_id: string | null
          claimed_at: string | null
          created_at: string | null
          earned_at: string | null
          expiry_date: string | null
          id: string
          is_claimed: boolean | null
          max_usage: number | null
          metadata: Json | null
          reward_id: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          claimed_at?: string | null
          created_at?: string | null
          earned_at?: string | null
          expiry_date?: string | null
          id?: string
          is_claimed?: boolean | null
          max_usage?: number | null
          metadata?: Json | null
          reward_id: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          claimed_at?: string | null
          created_at?: string | null
          earned_at?: string | null
          expiry_date?: string | null
          id?: string
          is_claimed?: boolean | null
          max_usage?: number | null
          metadata?: Json | null
          reward_id?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "community_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "challenge_rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      workout_analytics: {
        Row: {
          analysis_date: string | null
          average_intensity: number | null
          created_at: string | null
          estimated_calories: number | null
          exercise_variety_score: number | null
          fatigue_indicators: Json | null
          form_consistency_score: number | null
          id: string
          muscle_group_distribution: Json | null
          performance_metrics: Json | null
          rest_efficiency_score: number | null
          total_volume_kg: number | null
          training_stress_score: number | null
          user_id: string
          volume_load: number | null
          workout_efficiency_score: number | null
          workout_session_id: string
        }
        Insert: {
          analysis_date?: string | null
          average_intensity?: number | null
          created_at?: string | null
          estimated_calories?: number | null
          exercise_variety_score?: number | null
          fatigue_indicators?: Json | null
          form_consistency_score?: number | null
          id?: string
          muscle_group_distribution?: Json | null
          performance_metrics?: Json | null
          rest_efficiency_score?: number | null
          total_volume_kg?: number | null
          training_stress_score?: number | null
          user_id: string
          volume_load?: number | null
          workout_efficiency_score?: number | null
          workout_session_id: string
        }
        Update: {
          analysis_date?: string | null
          average_intensity?: number | null
          created_at?: string | null
          estimated_calories?: number | null
          exercise_variety_score?: number | null
          fatigue_indicators?: Json | null
          form_consistency_score?: number | null
          id?: string
          muscle_group_distribution?: Json | null
          performance_metrics?: Json | null
          rest_efficiency_score?: number | null
          total_volume_kg?: number | null
          training_stress_score?: number | null
          user_id?: string
          volume_load?: number | null
          workout_efficiency_score?: number | null
          workout_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "workout_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "workout_analytics_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          completed: boolean | null
          created_at: string | null
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          rest_time_seconds: number | null
          target_duration_seconds: number | null
          target_reps: number | null
          target_sets: number | null
          target_weight_kg: number | null
          template_id: string | null
          updated_at: string | null
          workout_session_id: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          exercise_id: string
          id?: string
          notes?: string | null
          order_index?: number
          rest_time_seconds?: number | null
          target_duration_seconds?: number | null
          target_reps?: number | null
          target_sets?: number | null
          target_weight_kg?: number | null
          template_id?: string | null
          updated_at?: string | null
          workout_session_id?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          rest_time_seconds?: number | null
          target_duration_seconds?: number | null
          target_reps?: number | null
          target_sets?: number | null
          target_weight_kg?: number | null
          template_id?: string | null
          updated_at?: string | null
          workout_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["exercise_id"]
          },
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          calories_burned: number | null
          completed_at: string | null
          created_at: string | null
          duration_seconds: number | null
          energy_level: number | null
          id: string
          location: string | null
          mood_rating: number | null
          name: string
          notes: string | null
          started_at: string | null
          status: string | null
          template_id: string | null
          total_reps: number | null
          total_sets: number | null
          total_volume_kg: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          energy_level?: number | null
          id?: string
          location?: string | null
          mood_rating?: number | null
          name: string
          notes?: string | null
          started_at?: string | null
          status?: string | null
          template_id?: string | null
          total_reps?: number | null
          total_sets?: number | null
          total_volume_kg?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          energy_level?: number | null
          id?: string
          location?: string | null
          mood_rating?: number | null
          name?: string
          notes?: string | null
          started_at?: string | null
          status?: string | null
          template_id?: string | null
          total_reps?: number | null
          total_sets?: number | null
          total_volume_kg?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "workout_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      workout_shares: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          like_count: number | null
          share_type: string | null
          share_url: string | null
          title: string | null
          updated_at: string | null
          user_id: string
          view_count: number | null
          workout_session_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          like_count?: number | null
          share_type?: string | null
          share_url?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          view_count?: number | null
          workout_session_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          like_count?: number | null
          share_type?: string | null
          share_url?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
          workout_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "workout_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "workout_shares_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_streaks: {
        Row: {
          current_streak: number | null
          id: number
          last_workout_date: string | null
          longest_streak: number | null
          streak_start_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          current_streak?: number | null
          id?: number
          last_workout_date?: string | null
          longest_streak?: number | null
          streak_start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          current_streak?: number | null
          id?: number
          last_workout_date?: string | null
          longest_streak?: number | null
          streak_start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_templates: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          estimated_duration_minutes: number | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "workout_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string | null
          creator_id: string | null
          description: string | null
          difficulty_level: string | null
          estimated_duration_minutes: number | null
          id: number
          is_public: boolean | null
          is_template: boolean | null
          name: string
          updated_at: string | null
          workout_type: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_duration_minutes?: number | null
          id?: number
          is_public?: boolean | null
          is_template?: boolean | null
          name: string
          updated_at?: string | null
          workout_type?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_duration_minutes?: number | null
          id?: number
          is_public?: boolean | null
          is_template?: boolean | null
          name?: string
          updated_at?: string | null
          workout_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workouts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      challenge_leaderboards: {
        Row: {
          challenge_id: string | null
          challenge_status: string | null
          challenge_title: string | null
          challenge_type: string | null
          completed_at: string | null
          completion_percentage: number | null
          current_progress: number | null
          difficulty: string | null
          end_date: string | null
          is_completed: boolean | null
          joined_at: string | null
          rank_position: number | null
          reward_points: number | null
          target_unit: string | null
          target_value: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "community_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "exercise_performance_trends"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "challenge_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      database_health_summary: {
        Row: {
          completed_records: number | null
          latest_record: string | null
          table_name: string | null
          total_records: number | null
        }
        Relationships: []
      }
      exercise_performance_trends: {
        Row: {
          avg_reps: number | null
          avg_weight: number | null
          exercise_id: string | null
          exercise_name: string | null
          first_performed: string | null
          last_performed: string | null
          max_weight: number | null
          progression_rate_per_day: number | null
          total_reps: number | null
          total_sets: number | null
          user_id: string | null
          workout_count: number | null
        }
        Relationships: []
      }
      user_progress_summary: {
        Row: {
          avg_workout_duration: number | null
          first_workout_date: string | null
          last_workout_date: string | null
          total_reps: number | null
          total_volume_kg: number | null
          total_workouts: number | null
          unique_exercises: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      are_users_friends: {
        Args: { user1_id: string; user2_id: string }
        Returns: boolean
      }
      calculate_achievement_progress: {
        Args: { p_user_id: string; p_achievement_id: number }
        Returns: number
      }
      calculate_challenge_progress: {
        Args: { p_user_id: string; p_challenge_id: string }
        Returns: number
      }
      calculate_one_rep_max: {
        Args: { weight: number; reps: number }
        Returns: number
      }
      calculate_user_analytics: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      calculate_workout_analytics: {
        Args: { p_workout_session_id: string }
        Returns: undefined
      }
      cleanup_expired_backups: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_data: {
        Args: { days_to_keep?: number }
        Returns: undefined
      }
      get_performance_metrics: {
        Args: Record<PropertyKey, never>
        Returns: {
          metric_name: string
          metric_value: string
          description: string
        }[]
      }
      get_user_activity_feed: {
        Args: { p_user_id: string; p_limit?: number; p_offset?: number }
        Returns: {
          id: string
          actor_id: string
          activity_type: string
          object_type: string
          object_id: string
          metadata: Json
          created_at: string
        }[]
      }
      join_challenge: {
        Args: { p_user_id: string; p_challenge_id: string }
        Returns: boolean
      }
      refresh_analytics_caches: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      run_database_optimization: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_challenge_rankings: {
        Args: { p_challenge_id: string }
        Returns: undefined
      }
      update_comment_engagement_counts: {
        Args: { p_comment_id: string }
        Returns: undefined
      }
      update_goal_progress: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_leaderboard_rankings: {
        Args: { leaderboard_uuid: string }
        Returns: undefined
      }
      update_post_engagement_counts: {
        Args: { p_post_id: string }
        Returns: undefined
      }
      update_table_statistics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_team_scores: {
        Args: { team_uuid: string }
        Returns: undefined
      }
      update_user_achievement_stats: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      update_workout_streak: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      validate_workout_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          issue_type: string
          issue_count: number
          description: string
        }[]
      }
    }
    Enums: {
      photo_category_enum: "progress" | "before" | "after" | "milestone"
      photo_type_enum: "front" | "side" | "back" | "custom"
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
      photo_category_enum: ["progress", "before", "after", "milestone"],
      photo_type_enum: ["front", "side", "back", "custom"],
    },
  },
} as const

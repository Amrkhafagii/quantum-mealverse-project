// Import the base Database type
import type { Database as SupabaseDatabase } from "@/integrations/supabase/types";
import { Json } from "@/integrations/supabase/types";

// Define our extensions to the Database type
export interface DatabaseExtensions {
  public: {
    Tables: {
      workout_plans: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          goal: string;
          frequency: number;
          difficulty: string;
          duration_weeks: number;
          created_at: string;
          updated_at: string;
          workout_days: Json; // JSON structure
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          goal: string;
          frequency: number;
          difficulty: string;
          duration_weeks: number;
          created_at?: string;
          updated_at?: string;
          workout_days: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          goal?: string;
          frequency?: number;
          difficulty?: string;
          duration_weeks?: number;
          created_at?: string;
          updated_at?: string;
          workout_days?: Json;
        };
      };
      workout_logs: {
        Row: {
          id: string;
          user_id: string;
          workout_plan_id: string;
          date: string;
          duration: number;
          calories_burned: number | null;
          notes: string | null;
          completed_exercises: any;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_plan_id: string;
          date?: string;
          duration: number;
          calories_burned?: number | null;
          notes?: string | null;
          completed_exercises: any;
        };
        Update: {
          id?: string;
          user_id?: string;
          workout_plan_id?: string;
          date?: string;
          duration?: number;
          calories_burned?: number | null;
          notes?: string | null;
          completed_exercises?: any;
        };
      };
      workout_history: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          workout_log_id: string;
          workout_plan_name: string;
          workout_day_name: string;
          duration: number;
          exercises_completed: number;
          total_exercises: number;
          calories_burned: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          workout_log_id: string;
          workout_plan_name: string;
          workout_day_name: string;
          duration: number;
          exercises_completed: number;
          total_exercises: number;
          calories_burned?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          workout_log_id?: string;
          workout_plan_name?: string;
          workout_day_name?: string;
          duration?: number;
          exercises_completed?: number;
          total_exercises?: number;
          calories_burned?: number | null;
        };
      };
      user_streaks: {
        Row: {
          id: string;
          user_id: string;
          currentstreak: number;
          longeststreak: number;
          last_activity_date: string;
          streak_type: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          currentstreak?: number;
          longeststreak?: number;
          last_activity_date: string;
          streak_type: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          currentstreak?: number;
          longeststreak?: number;
          last_activity_date?: string;
          streak_type?: string;
        };
      };
      workout_schedules: {
        Row: {
          id: string;
          user_id: string;
          workout_plan_id: string;
          start_date: string;
          end_date: string | null;
          days_of_week: number[];
          preferred_time: string | null;
          active: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_plan_id: string;
          start_date: string;
          end_date?: string | null;
          days_of_week: number[];
          preferred_time?: string | null;
          active?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          workout_plan_id?: string;
          start_date?: string;
          end_date?: string | null;
          days_of_week?: number[];
          preferred_time?: string | null;
          active?: boolean;
        };
      };
      user_measurements: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          weight: number;
          body_fat?: number;
          chest?: number;
          waist?: number;
          hips?: number;
          arms?: number;
          legs?: number;
          notes?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          weight: number; // This is required
          body_fat?: number;
          chest?: number;
          waist?: number;
          hips?: number;
          arms?: number;
          legs?: number;
          notes?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          weight?: number;
          body_fat?: number;
          chest?: number;
          waist?: number;
          hips?: number;
          arms?: number;
          legs?: number;
          notes?: string;
        };
      };
    };
  };
}

// Instead of using interface augmentation, create a merged type
export type MergedDatabase = SupabaseDatabase & DatabaseExtensions;

// Export a helper type to use in supabase client
export type SupabaseSchema = MergedDatabase;


import React from 'react';

// Import the base Database type
import type { Database as SupabaseDatabase } from "@/integrations/supabase/types";
import { Json } from "@/integrations/supabase/types";

// Define extensions to the Database type
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
          completed_exercises: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_plan_id: string;
          date?: string;
          duration: number;
          calories_burned?: number | null;
          notes?: string | null;
          completed_exercises: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          workout_plan_id?: string;
          date?: string;
          duration?: number;
          calories_burned?: number | null;
          notes?: string | null;
          completed_exercises?: Json;
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
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          dietary_restrictions: string[] | null;
          created_at: string | null;
          updated_at: string | null;
          calorie_target: number | null;
          protein_target: number | null;
          carbs_target: number | null;
          fat_target: number | null;
          allergies: string[] | null;
          currency: string;
          location_tracking_enabled: boolean | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          dietary_restrictions?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
          calorie_target?: number | null;
          protein_target?: number | null;
          carbs_target?: number | null;
          fat_target?: number | null;
          allergies?: string[] | null;
          currency?: string;
          location_tracking_enabled?: boolean | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          dietary_restrictions?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
          calorie_target?: number | null;
          protein_target?: number | null;
          carbs_target?: number | null;
          fat_target?: number | null;
          allergies?: string[] | null;
          currency?: string;
          location_tracking_enabled?: boolean | null;
        };
      };
    };
  };
}

// Use type merging instead of interface extension to avoid conflicts
export type MergedDatabase = {
  public: SupabaseDatabase['public'] & DatabaseExtensions['public'];
};

// Export a helper type to use in supabase client
export type SupabaseSchema = MergedDatabase;

// Create and export a component for the Workouts page
const WorkoutsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-quantum-cyan mb-8">Workouts</h1>
      <div className="bg-quantum-darkBlue/30 border border-quantum-cyan/20 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Workout Management</h2>
        <p className="text-gray-300">
          Your workout management interface is coming soon. Here you'll be able to:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-300">
          <li>View and manage workout plans</li>
          <li>Track your workout history</li>
          <li>Schedule upcoming workouts</li>
          <li>Get personalized workout recommendations</li>
        </ul>
      </div>
    </div>
  );
};

// Add default export for the component
export default WorkoutsPage;


import { WorkoutDay, WorkoutSchedule } from '@/types/fitness';
import { Json } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

/**
 * Converts raw database data to properly typed workout days
 */
export const fromSupabaseJson = (jsonData: Json): any => {
  if (typeof jsonData === 'string') {
    try {
      return JSON.parse(jsonData);
    } catch (e) {
      console.error('Error parsing JSON data:', e);
      return [];
    }
  }
  return jsonData;
};

/**
 * Converts workout days to format suitable for Supabase storage
 */
export const toSupabaseJson = (data: WorkoutDay[]): Json => {
  return data as Json;
};

/**
 * Formats a workout log for Supabase insertion
 */
export const formatWorkoutLogForSupabase = (workoutLog: any): any => {
  return {
    ...workoutLog,
    completed_exercises: JSON.stringify(workoutLog.completed_exercises)
  };
};

/**
 * Formats schedule data from the database into the WorkoutSchedule interface
 */
export const formatScheduleData = (schedule: any): WorkoutSchedule => {
  return {
    id: schedule.id,
    user_id: schedule.user_id,
    workout_plan_id: schedule.workout_plan_id,
    days_of_week: Array.isArray(schedule.days_of_week) ? schedule.days_of_week : [],
    day_of_week: schedule.day_of_week || '',
    time: schedule.time || schedule.preferred_time || '',
    preferred_time: schedule.preferred_time || '',
    reminder: schedule.reminder || false,
    start_date: schedule.start_date,
    end_date: schedule.end_date,
    active: schedule.active || false,
    created_at: schedule.created_at || undefined,
    updated_at: schedule.updated_at || undefined
  };
};

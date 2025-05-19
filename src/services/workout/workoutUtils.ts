
import { WorkoutSchedule } from '@/types/fitness';

/**
 * Converts nested objects to JSON strings for Supabase storage
 */
export const toSupabaseJson = (data: any): any => {
  if (!data) return null;
  
  // If it's an array, process each item
  if (Array.isArray(data)) {
    return data;
  }
  
  // For objects, stringify them
  if (typeof data === 'object') {
    return JSON.stringify(data);
  }
  
  return data;
};

/**
 * Format database data to match the WorkoutSchedule type
 */
export const formatScheduleData = (data: any): WorkoutSchedule => {
  if (!data) return null;
  
  return {
    id: data.id,
    user_id: data.user_id,
    workout_plan_id: data.workout_plan_id,
    day_of_week: data.day_of_week,
    days_of_week: Array.isArray(data.days_of_week) ? data.days_of_week : [],
    time: data.time,
    preferred_time: data.preferred_time,
    reminder: data.reminder,
    start_date: data.start_date,
    end_date: data.end_date,
    active: data.active ?? true
  };
};

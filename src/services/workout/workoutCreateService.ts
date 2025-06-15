import { supabase } from '@/integrations/supabase/client';

export const createWorkoutSchedule = async (userId: string, scheduleData: any) => {
  try {
    const scheduleToInsert = {
      workout_schedules_user_id: userId, // Use correct database field name
      workout_plan_id: scheduleData.workout_plan_id,
      name: scheduleData.name || 'My Workout Schedule',
      days_of_week: scheduleData.days_of_week,
      preferred_time: scheduleData.preferred_time,
      start_date: scheduleData.start_date,
      end_date: scheduleData.end_date,
      is_active: scheduleData.is_active !== false,
      reminder_enabled: scheduleData.reminder_enabled || false,
      reminder_minutes_before: scheduleData.reminder_minutes_before || 30
    };

    const { data, error } = await supabase
      .from('workout_schedules')
      .insert(scheduleToInsert)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating workout schedule:', error);
    throw error;
  }
};

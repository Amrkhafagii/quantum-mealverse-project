
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutHistoryItem, UserWorkoutStats, WorkoutPlan, WorkoutSchedule, WorkoutLog } from '@/types/fitness';

export const useWorkoutData = () => {
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [schedules, setSchedules] = useState<WorkoutSchedule[]>([]);
  const [workoutStats, setWorkoutStats] = useState<UserWorkoutStats>({
    total_workouts: 0,
    streak_days: 0,
    longest_streak: 0,
    total_calories_burned: 0,
    total_duration_minutes: 0,
    most_active_day: 'N/A'
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkoutHistory = async (userId?: string) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('workout_history')
        .select('*')
        .eq('workout_history_user_id', userId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      // Map database fields to WorkoutHistoryItem type
      const mappedHistory: WorkoutHistoryItem[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.workout_history_user_id,
        workout_log_id: item.workout_log_id,
        date: item.date,
        workout_plan_name: item.workout_plan_name,
        workout_day_name: item.workout_day_name,
        exercises_completed: item.exercises_completed,
        total_exercises: item.total_exercises,
        duration: item.duration,
        calories_burned: item.calories_burned,
      }));
      
      setHistory(mappedHistory);
    } catch (error) {
      console.error('Error fetching workout history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkoutPlans = async (userId?: string) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('workout_plans_user_id', userId);
      
      if (error) throw error;
      
      // Map database fields to WorkoutPlan type
      const mappedPlans: WorkoutPlan[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.workout_plans_user_id,
        name: item.name,
        description: item.description,
        goal: item.goal,
        difficulty: item.difficulty,
        frequency: item.frequency,
        duration_weeks: item.duration_weeks,
        workout_days: typeof item.workout_days === 'string' ? JSON.parse(item.workout_days) : item.workout_days,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
      
      setWorkoutPlans(mappedPlans);
    } catch (error) {
      console.error('Error fetching workout plans:', error);
    }
  };

  const fetchWorkoutSchedules = async (userId?: string) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('workout_schedules')
        .select('*')
        .eq('workout_schedules_user_id', userId);
      
      if (error) throw error;
      
      // Map database fields to WorkoutSchedule type
      const mappedSchedules: WorkoutSchedule[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.workout_schedules_user_id,
        workout_plan_id: item.workout_plan_id,
        days_of_week: item.days_of_week,
        start_date: item.start_date,
        end_date: item.end_date,
        preferred_time: item.preferred_time,
        active: item.is_active,
      }));
      
      setSchedules(mappedSchedules);
    } catch (error) {
      console.error('Error fetching workout schedules:', error);
    }
  };

  const fetchWorkoutStats = async (userId?: string) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('user_workout_stats')
        .select('*')
        .eq('user_workout_stats_user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      if (data) {
        setWorkoutStats({
          total_workouts: data.total_workouts || 0,
          streak_days: data.streak_days || 0,
          longest_streak: data.streak_days || 0, // Use streak_days as fallback for longest_streak
          total_calories_burned: data.calories_burned || 0, // Map from calories_burned
          total_duration_minutes: data.total_time || 0, // Map from total_time
          most_active_day: data.most_active_day || 'N/A'
        });
      }
    } catch (error) {
      console.error('Error fetching workout stats:', error);
    }
  };

  const logWorkout = async (workoutLog: WorkoutLog): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('workout_logs')
        .insert([{
          workout_logs_user_id: workoutLog.user_id,
          workout_plan_id: workoutLog.workout_plan_id,
          date: workoutLog.date,
          duration: workoutLog.duration,
          calories_burned: workoutLog.calories_burned,
          notes: workoutLog.notes,
          completed_exercises: JSON.stringify(workoutLog.completed_exercises)
        }]);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error logging workout:', error);
      return false;
    }
  };

  useEffect(() => {
    // Mock data for now since we don't have user context here
    setHistory([]);
    setWorkoutStats({
      total_workouts: 0,
      streak_days: 0,
      longest_streak: 0,
      total_calories_burned: 0,
      total_duration_minutes: 0,
      most_active_day: 'N/A'
    });
    setIsLoading(false);
  }, []);

  return {
    history,
    workoutPlans,
    schedules,
    workoutStats,
    isLoading,
    fetchWorkoutHistory,
    fetchWorkoutPlans,
    fetchWorkoutSchedules,
    fetchWorkoutStats,
    logWorkout
  };
};

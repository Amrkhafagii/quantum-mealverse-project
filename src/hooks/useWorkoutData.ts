
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
      setHistory(data || []);
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
      setWorkoutPlans(data || []);
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
      setSchedules(data || []);
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
          longest_streak: data.longest_streak || 0,
          total_calories_burned: data.total_calories_burned || 0,
          total_duration_minutes: data.total_duration_minutes || 0,
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

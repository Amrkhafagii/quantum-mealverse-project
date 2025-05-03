
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  WorkoutPlan, 
  WorkoutSchedule, 
  WorkoutLog, 
  WorkoutHistoryItem, 
  UserWorkoutStats,
  WorkoutDay
} from '@/types/fitness';
import { useToast } from '@/hooks/use-toast';
import { normalizeWorkoutPlan } from '@/utils/fitnessUtils';
import { useAuth } from '@/hooks/useAuth';

export function useWorkoutData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [schedules, setSchedules] = useState<WorkoutSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workoutStats, setWorkoutStats] = useState<UserWorkoutStats>({
    streak: 0,
    total_workouts: 0,
    most_active_day: 'N/A'
  });
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);

  const fetchWorkoutPlans = async (userId?: string) => {
    try {
      setIsLoading(true);
      if (!userId) return;
      
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Parse JSON workout_days and convert to proper WorkoutDay[]
      const parsedPlans: WorkoutPlan[] = data?.map(plan => ({
        ...plan,
        workout_days: typeof plan.workout_days === 'string' 
          ? JSON.parse(plan.workout_days) 
          : Array.isArray(plan.workout_days)
            ? plan.workout_days
            : []
      })) || [];
      
      setWorkoutPlans(parsedPlans);
    } catch (error) {
      console.error('Error fetching workout plans:', error);
      toast({
        title: "Error",
        description: "Failed to load workout plans",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkoutSchedules = async (userId?: string) => {
    try {
      setIsLoading(true);
      if (!userId) return;
      
      const { data, error } = await supabase
        .from('workout_schedules')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Transform the data to match the WorkoutSchedule interface
      const formattedData: WorkoutSchedule[] = (data || []).map(schedule => ({
        id: schedule.id,
        user_id: schedule.user_id,
        workout_plan_id: schedule.workout_plan_id,
        days_of_week: schedule.days_of_week || [],
        day_of_week: schedule.day_of_week || '',
        time: schedule.time || schedule.preferred_time || '',
        preferred_time: schedule.preferred_time || '',
        reminder: schedule.reminder || false,
        start_date: schedule.start_date,
        end_date: schedule.end_date,
        active: schedule.active,
        created_at: schedule.created_at || undefined,
        updated_at: schedule.updated_at || undefined
      }));
      
      setSchedules(formattedData);
    } catch (error) {
      console.error('Error fetching workout schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkoutHistory = async (userId?: string) => {
    try {
      setIsLoading(true);
      if (!userId) return;
      
      const { data, error } = await supabase
        .from('workout_history')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching workout history:', error);
      toast({
        title: "Error",
        description: "Failed to load workout history",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkoutStats = async (userId?: string) => {
    try {
      setIsLoading(true);
      if (!userId) return;
      
      // Get the streak from user_streaks
      const { data: streakData, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('streak_type', 'workout')
        .single();
        
      if (streakError && streakError.code !== 'PGRST116') throw streakError;
      
      // Count the total workouts
      const { count, error: countError } = await supabase
        .from('workout_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (countError) throw countError;
      
      // Get the most active day
      const { data: historyData, error: historyError } = await supabase
        .from('workout_history')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30);
        
      if (historyError) throw historyError;
      
      // Calculate the most active day
      const dayCountMap: Record<string, number> = {};
      historyData?.forEach(workout => {
        const day = new Date(workout.date).toLocaleDateString('en-US', { weekday: 'long' });
        dayCountMap[day] = (dayCountMap[day] || 0) + 1;
      });
      
      let mostActiveDay = 'N/A';
      let maxCount = 0;
      
      Object.entries(dayCountMap).forEach(([day, count]) => {
        if (count > maxCount) {
          mostActiveDay = day;
          maxCount = count;
        }
      });
      
      setWorkoutStats({
        streak: streakData?.currentstreak || 0,
        total_workouts: count || 0,
        most_active_day: mostActiveDay
      });
      
      setHistory(historyData || []);
    } catch (error) {
      console.error('Error fetching workout stats:', error);
      toast({
        title: "Error",
        description: "Failed to load workout statistics",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logWorkout = async (workoutLog: WorkoutLog) => {
    try {
      setIsLoading(true);
      
      // Make sure user_id is always provided
      if (!workoutLog.user_id) {
        throw new Error("User ID is required for workout logs");
      }
      
      // Convert the completed_exercises to a JSON string for storage
      const dbWorkoutLog = {
        user_id: workoutLog.user_id,
        workout_plan_id: workoutLog.workout_plan_id,
        date: workoutLog.date,
        duration: workoutLog.duration,
        calories_burned: workoutLog.calories_burned,
        notes: workoutLog.notes,
        completed_exercises: JSON.stringify(workoutLog.completed_exercises)
      };
      
      const { data, error } = await supabase
        .from('workout_logs')
        .insert(dbWorkoutLog)
        .select()
        .single();
        
      if (error) throw error;
      
      // Refresh workout stats
      if (workoutLog.user_id) {
        fetchWorkoutStats(workoutLog.user_id);
      }
      
      toast({
        title: "Success",
        description: "Workout logged successfully",
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error logging workout:', error);
      toast({
        title: "Error",
        description: "Failed to log workout",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    workoutPlans,
    schedules,
    workoutStats,
    history,
    isLoading,
    fetchWorkoutPlans,
    fetchWorkoutSchedules,
    fetchWorkoutStats,
    fetchWorkoutHistory,
    logWorkout
  };
}

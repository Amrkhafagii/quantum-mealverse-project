
import { useState } from 'react';
import { 
  WorkoutPlan, 
  WorkoutSchedule, 
  WorkoutLog, 
  WorkoutHistoryItem, 
  UserWorkoutStats
} from '@/types/fitness';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import * as workoutService from '@/services/workout';
import { getWorkoutStats } from '@/services/workout/workoutLogService';
import { supabase } from '@/integrations/supabase/client';

export function useWorkoutData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [schedules, setSchedules] = useState<WorkoutSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workoutStats, setWorkoutStats] = useState<UserWorkoutStats>({
    user_id: '',
    streak: 0,
    total_workouts: 0,
    most_active_day: 'N/A',
    streak_days: 0,
    longest_streak: 0,
    total_calories_burned: 0,
    total_duration_minutes: 0
  });
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);

  const fetchWorkoutPlans = async (userId?: string) => {
    try {
      setIsLoading(true);
      const authUserId = userId || user?.id;
      if (!authUserId) return;
      
      const data = await workoutService.fetchWorkoutPlans(authUserId);
      setWorkoutPlans(data);
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
      const authUserId = userId || user?.id;
      if (!authUserId) return;
      
      const data = await workoutService.fetchWorkoutSchedules(authUserId);
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching workout schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkoutHistory = async (userId?: string) => {
    try {
      setIsLoading(true);
      const authUserId = userId || user?.id;
      if (!authUserId) return;
      
      const data = await workoutService.fetchWorkoutHistory(authUserId);
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
      const authUserId = userId || user?.id;
      if (!authUserId) return;
      
      // Get workout stats from the new table using auth UUID
      const stats = await getWorkoutStats(authUserId);
      
      // Get the most active day from workout history using auth UUID
      const { data: historyData, error: historyError } = await supabase
        .from('workout_history')
        .select('*')
        .eq('user_id', authUserId)
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
      
      // Handle different response formats from getWorkoutStats
      const caloriesBurned = (stats && 'calories_burned' in stats) 
        ? stats.calories_burned 
        : (stats && 'total_calories_burned' in stats) 
          ? stats.total_calories_burned 
          : 0;
          
      const totalTime = (stats && 'total_time' in stats) 
        ? stats.total_time 
        : (stats && 'total_duration_minutes' in stats) 
          ? stats.total_duration_minutes 
          : 0;
      
      setWorkoutStats({
        user_id: authUserId,
        streak: stats?.streak_days || 0,
        total_workouts: stats?.total_workouts || 0,
        most_active_day: mostActiveDay,
        streak_days: stats?.streak_days || 0,
        longest_streak: stats?.streak_days || 0,
        total_calories_burned: caloriesBurned,
        total_duration_minutes: totalTime
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
      
      // Ensure user_id is always the authenticated user's UUID
      const logWithAuthUserId = {
        ...workoutLog,
        user_id: workoutLog.user_id || user?.id
      };
      
      if (!logWithAuthUserId.user_id) {
        throw new Error("User ID is required for workout logs");
      }
      
      const success = await workoutService.logWorkout(logWithAuthUserId);
      
      if (success) {
        // Refresh workout stats and history using auth UUID
        await fetchWorkoutStats(logWithAuthUserId.user_id);
        await fetchWorkoutHistory(logWithAuthUserId.user_id);
        
        toast({
          title: "Success",
          description: "Workout logged successfully! Check your achievements.",
        });
        
        return { success: true, data: logWithAuthUserId };
      } else {
        throw new Error("Failed to log workout");
      }
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

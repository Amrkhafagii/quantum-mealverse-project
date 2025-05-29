
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
    streak: 0,
    total_workouts: 0,
    most_active_day: 'N/A'
  });
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);

  const fetchWorkoutPlans = async (userId?: string) => {
    try {
      setIsLoading(true);
      if (!userId) return;
      
      const data = await workoutService.fetchWorkoutPlans(userId);
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
      if (!userId) return;
      
      const data = await workoutService.fetchWorkoutSchedules(userId);
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
      if (!userId) return;
      
      const data = await workoutService.fetchWorkoutHistory(userId);
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
      
      // Get workout stats from the new table
      const stats = await getWorkoutStats(userId);
      
      // Get the most active day from workout history
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
        streak: stats.streak_days || 0,
        total_workouts: stats.total_workouts || 0,
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
      
      const success = await workoutService.logWorkout(workoutLog);
      
      if (success) {
        // Refresh workout stats and history
        if (workoutLog.user_id) {
          await fetchWorkoutStats(workoutLog.user_id);
          await fetchWorkoutHistory(workoutLog.user_id);
        }
        
        toast({
          title: "Success",
          description: "Workout logged successfully! Check your achievements.",
        });
        
        return { success: true, data: workoutLog };
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

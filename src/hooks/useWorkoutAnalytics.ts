import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface WorkoutGoal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  target_date: string;
  status: 'active' | 'completed' | 'failed';
  goal_type: 'calories' | 'duration' | 'frequency';
  created_at: string;
  updated_at: string;
  unit?: string;
}

export interface WorkoutStats {
  id: string;
  user_id: string;
  total_workouts: number;
  total_time: number;
  calories_burned: number;
  last_workout_date: string | null;
  most_active_day: string | null;
  streak_days: number;
  created_at: string;
  updated_at: string;
}

export const useWorkoutAnalytics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<WorkoutGoal[]>([]);
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWorkoutGoals = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data: dataFromDB, error } = await supabase
        .from('fitness_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // When mapping DB object to WorkoutGoal, remove fitness_goals_user_id:
      const mappedGoals = (dataFromDB as any[]).map(item => ({
        id: item.id,
        user_id: item.user_id, // Map database field to app model if needed, or set directly.
        description: item.description,
        target_value: item.target_value,
        current_value: item.current_value,
        target_date: item.target_date,
        status: item.status,
        goal_type: item.goal_type,
        created_at: item.created_at,
        updated_at: item.updated_at,
        title: item.title,
        unit: item.unit,
      }));

      setGoals(mappedGoals);
    } catch (error) {
      console.error('Error fetching workout goals:', error);
      toast({
        title: "Error",
        description: "Failed to load workout goals",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addWorkoutGoal = async (newGoal: Omit<WorkoutGoal, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('fitness_goals')
        .insert([
          {
            ...newGoal,
            user_id: user.id,
          },
        ]);

      if (error) {
        throw error;
      }

      await fetchWorkoutGoals(); // Refresh goals after adding
      toast({
        title: "Success",
        description: "Workout goal added successfully!",
      });
    } catch (error) {
      console.error('Error adding workout goal:', error);
      toast({
        title: "Error",
        description: "Failed to add workout goal",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateWorkoutGoal = async (goalId: string, updates: Partial<Omit<WorkoutGoal, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('fitness_goals')
        .update(updates)
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      await fetchWorkoutGoals(); // Refresh goals after updating
      toast({
        title: "Success",
        description: "Workout goal updated successfully!",
      });
    } catch (error) {
      console.error('Error updating workout goal:', error);
      toast({
        title: "Error",
        description: "Failed to update workout goal",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWorkoutGoal = async (goalId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('fitness_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      await fetchWorkoutGoals(); // Refresh goals after deleting
      toast({
        title: "Success",
        description: "Workout goal deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting workout goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete workout goal",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkoutStats = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_workout_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw error;
      }

      setStats(data || null);
    } catch (error) {
      console.error('Error fetching workout stats:', error);
      toast({
        title: "Error",
        description: "Failed to load workout stats",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWorkoutGoals();
      fetchWorkoutStats();
    }
  }, [user]);

  return {
    goals,
    stats,
    isLoading,
    fetchWorkoutGoals,
    addWorkoutGoal,
    updateWorkoutGoal,
    deleteWorkoutGoal,
    fetchWorkoutStats,
  };
};


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

// Map only allowed types for goal_type in the UI/app layer
export type AllowedGoalType = 
  | 'weight_loss'
  | 'weight_gain'
  | 'muscle_gain'
  | 'endurance'
  | 'strength'
  | 'general_fitness';

export interface WorkoutGoal {
  id: string;
  user_id: string; // app-level, mapped from fitness_goals_user_id
  title: string; // app-level, mapped from name
  description: string;
  target_value: number;
  current_value: number;
  target_date: string;
  status: 'active' | 'completed' | 'failed';
  goal_type: AllowedGoalType;
  created_at: string;
  updated_at: string;
  unit?: string;
  is_active: boolean;
}

export interface WorkoutStats {
  id: string;
  user_id: string; // app-level, mapped from user_workout_stats_user_id
  total_workouts: number;
  total_time: number;
  calories_burned: number;
  last_workout_date: string | null;
  most_active_day: string | null;
  streak_days: number;
  created_at: string;
  updated_at: string;
}

const allowedGoalTypeFallback: AllowedGoalType = 'general_fitness';

// Util to validate/convert database goal_type field to app type
const mapGoalType = (goal_type: any): AllowedGoalType => {
  if (
    goal_type === 'weight_loss' ||
    goal_type === 'weight_gain' ||
    goal_type === 'muscle_gain' ||
    goal_type === 'endurance' ||
    goal_type === 'strength' ||
    goal_type === 'general_fitness'
  ) {
    return goal_type;
  }
  return allowedGoalTypeFallback;
};

export const useWorkoutAnalytics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<WorkoutGoal[]>([]);
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // --- GET ---
  const fetchWorkoutGoals = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: dataFromDB, error } = await supabase
        .from('fitness_goals')
        .select('*')
        .eq('fitness_goals_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map DB fields -> WorkoutGoal
      const mappedGoals: WorkoutGoal[] = (dataFromDB as any[]).map((item) => ({
        id: item.id,
        user_id: item.fitness_goals_user_id,
        title: item.name ?? '', // from 'name' not 'title'
        description: item.description ?? '',
        target_value: item.target_value ?? 0,
        current_value: item.current_value ?? 0,
        target_date: item.target_date ?? '',
        status: item.status as 'active' | 'completed' | 'failed',
        goal_type: mapGoalType(item.goal_type),
        created_at: item.created_at ?? '',
        updated_at: item.updated_at ?? '',
        unit: item.unit,
        is_active: (item.status === 'active'),
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

  // --- CREATE ---
  const createGoal = async (
    newGoal: Omit<WorkoutGoal, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'is_active'>
  ) => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Database expects fitness_goals_user_id, name, NOT user_id, title.
      const toInsert = {
        fitness_goals_user_id: user.id,
        name: newGoal.title,
        description: newGoal.description,
        target_value: newGoal.target_value,
        current_value: newGoal.current_value,
        target_date: newGoal.target_date,
        status: 'active',
        goal_type: newGoal.goal_type,
        unit: newGoal.unit,
      };

      const { error } = await supabase
        .from('fitness_goals')
        .insert([toInsert]);

      if (error) throw error;

      await fetchWorkoutGoals();
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

  // --- UPDATE ---
  const updateGoal = async (
    goalId: string,
    updates: Partial<Omit<WorkoutGoal, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'is_active'>>
  ) => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Remap property keys for Supabase; update only present values.
      const dbUpdates: Record<string, any> = {};
      if ('title' in updates) dbUpdates.name = updates.title;
      if ('description' in updates) dbUpdates.description = updates.description;
      if ('target_value' in updates) dbUpdates.target_value = updates.target_value;
      if ('current_value' in updates) dbUpdates.current_value = updates.current_value;
      if ('target_date' in updates) dbUpdates.target_date = updates.target_date;
      if ('status' in updates) dbUpdates.status = updates.status;
      if ('goal_type' in updates) dbUpdates.goal_type = updates.goal_type;
      if ('unit' in updates) dbUpdates.unit = updates.unit;

      const { error } = await supabase
        .from('fitness_goals')
        .update(dbUpdates)
        .eq('id', goalId)
        .eq('fitness_goals_user_id', user.id);

      if (error) throw error;

      await fetchWorkoutGoals();
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

  // --- DELETE ---
  const deleteGoal = async (goalId: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('fitness_goals')
        .delete()
        .eq('id', goalId)
        .eq('fitness_goals_user_id', user.id);

      if (error) throw error;

      await fetchWorkoutGoals();
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

  // --- GET STATS ---
  const fetchWorkoutStats = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_workout_stats')
        .select('*')
        .eq('user_workout_stats_user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setStats({
          id: data.id,
          user_id: data.user_workout_stats_user_id, // <- fix property name
          total_workouts: data.total_workouts,
          total_time: data.total_time,
          calories_burned: data.calories_burned,
          last_workout_date: data.last_workout_date,
          most_active_day: data.most_active_day,
          streak_days: data.streak_days,
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      } else {
        setStats(null);
      }
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
    // eslint-disable-next-line
  }, [user]);

  return {
    goals,
    stats,
    isLoading,
    fetchWorkoutGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    fetchWorkoutStats,
  };
};

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
  user_id: string;
  title: string;
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

      // Map DB result -> WorkoutGoal
      const mappedGoals: WorkoutGoal[] = (dataFromDB as any[]).map((item) => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title ?? item.name ?? '', // tolerate db 'name'
        description: item.description ?? '',
        target_value: item.target_value ?? 0,
        current_value: item.current_value ?? 0,
        target_date: item.target_date ?? '',
        status: item.status as 'active' | 'completed' | 'failed',
        goal_type: mapGoalType(item.goal_type),
        created_at: item.created_at ?? '',
        updated_at: item.updated_at ?? '',
        unit: item.unit,
        is_active: (item.status === 'active') // can be improved, but fits filter logic
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

  // Renamed to createGoal (not addWorkoutGoal), and adapted for new strict shape.
  const createGoal = async (
    newGoal: Omit<WorkoutGoal, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'is_active'>
  ) => {
    if (!user) return;

    try {
      setIsLoading(true);
      // Only insert allowed fields
      const { error } = await supabase
        .from('fitness_goals')
        .insert([
          {
            ...newGoal,
            user_id: user.id,
            status: 'active',
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

  // Renamed to updateGoal, check for allowed updates
  const updateGoal = async (
    goalId: string,
    updates: Partial<Omit<WorkoutGoal, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'is_active'>>
  ) => {
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

  // Renamed to deleteGoal
  const deleteGoal = async (goalId: string) => {
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

  // Stats -- leave unchanged except for typing result (fix recursion)
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

      if (data) {
        setStats({
          id: data.id,
          user_id: data.user_id,
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

  // EXPLICITLY export only what clients/components are *expecting*:
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

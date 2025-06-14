import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { WorkoutGoal } from '@/types/fitness/analytics';
import { supabase } from '@/integrations/supabase/client';

interface WorkoutGoalDBRow {
  created_at: string;
  current_value: number;
  description: string;
  goal_type: string;
  id: string;
  is_active: boolean;
  target_date: string;
  target_value: number;
  title: string;
  unit: string;
  updated_at: string;
  workout_goals_user_id: string;
  user_id?: string; // Add user_id optional field, but always inject below!
}

interface PerformanceMetrics {
  totalWorkouts: number;
  totalVolume: number;
  averageDuration: number;
  strongestExercise: string;
}

interface ProgressChartData {
  date: string;
  value: number;
}

// Allowed goal_type values for WorkoutGoal
const allowedGoalTypes: WorkoutGoal['goal_type'][] = [
  "weight_loss", "weight_gain", "muscle_gain", "endurance", "strength", "general_fitness"
];

export function useWorkoutAnalytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<WorkoutGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [exerciseProgress, setExerciseProgress] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});

  const fetchGoals = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('workout_goals')
        .select('*')
        .eq('workout_goals_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Explicitly map DB fields to WorkoutGoal, with required user_id and valid goal_type
      const typedGoals: WorkoutGoal[] = (data as WorkoutGoalDBRow[] || []).map(goal => ({
        id: goal.id,
        fitness_goals_user_id: goal.workout_goals_user_id ?? user.id,
        user_id: user.id, // ensure user_id is present
        description: goal.description,
        target_value: goal.target_value,
        current_value: goal.current_value,
        target_date: goal.target_date,
        status: (goal.is_active ? "active" : "not_started"),
        goal_type: allowedGoalTypes.includes(goal.goal_type as WorkoutGoal['goal_type'])
          ? (goal.goal_type as WorkoutGoal['goal_type'])
          : "general_fitness",
        created_at: goal.created_at,
        updated_at: goal.updated_at,
        title: goal.title || '',
        unit: goal.unit || '',
      }));
      setGoals(typedGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: "Error",
        description: "Failed to load goals",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createGoal = async (
    goalData: Omit<WorkoutGoal, 'id' | 'fitness_goals_user_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!user) return;
    try {
      // Define only columns present in the DB
      const insertObj = {
        ...goalData,
        workout_goals_user_id: user.id,
        title: goalData.title || '',
        unit: goalData.unit || '',
      };
      const { data, error } = await supabase
        .from('workout_goals')
        .insert(insertObj)
        .select()
        .single();

      if (error) throw error;

      const newGoalType = allowedGoalTypes.includes(data.goal_type as WorkoutGoal['goal_type'])
        ? (data.goal_type as WorkoutGoal['goal_type'])
        : "general_fitness";

      // Map result to WorkoutGoal type (with required user_id and allowed goal_type)
      const typedGoal: WorkoutGoal = {
        id: data.id,
        fitness_goals_user_id: data.workout_goals_user_id ?? user.id,
        user_id: user.id, // ensure user_id is present
        description: data.description,
        target_value: data.target_value,
        current_value: data.current_value,
        target_date: data.target_date,
        status: (data.is_active ? "active" : "not_started"),
        goal_type: newGoalType,
        created_at: data.created_at,
        updated_at: data.updated_at,
        title: data.title || '',
        unit: data.unit || '',
      };
      setGoals(prev => [typedGoal, ...prev]);
      toast({
        title: "Success",
        description: "Goal created successfully",
      });
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive"
      });
    }
  };

  const updateGoal = async (
    goalId: string,
    goalData: Omit<WorkoutGoal, 'id' | 'fitness_goals_user_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!user) return;
    try {
      const updateObj = {
        ...goalData,
        title: goalData.title || '',
        unit: goalData.unit || '',
      };
      const { data, error } = await supabase
        .from('workout_goals')
        .update(updateObj)
        .eq('id', goalId)
        .eq('workout_goals_user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const newGoalType = allowedGoalTypes.includes(data.goal_type as WorkoutGoal['goal_type'])
        ? (data.goal_type as WorkoutGoal['goal_type'])
        : "general_fitness";

      const typedGoal: WorkoutGoal = {
        id: data.id,
        fitness_goals_user_id: data.workout_goals_user_id ?? user.id,
        user_id: user.id, // ensure user_id is present
        description: data.description,
        target_value: data.target_value,
        current_value: data.current_value,
        target_date: data.target_date,
        status: (data.is_active ? "active" : "not_started"),
        goal_type: newGoalType,
        created_at: data.created_at,
        updated_at: data.updated_at,
        title: data.title || '',
        unit: data.unit || '',
      };

      setGoals(prev => prev.map(goal => 
        goal.id === goalId ? typedGoal : goal
      ));
      toast({
        title: "Success",
        description: "Goal updated successfully",
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive"
      });
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('workout_goals')
        .delete()
        .eq('id', goalId)
        .eq('workout_goals_user_id', user.id);

      if (error) throw error;

      setGoals(prev => prev.filter(goal => goal.id !== goalId));
      toast({
        title: "Success",
        description: "Goal deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive"
      });
    }
  };

  const fetchExerciseProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('exercise_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_date', { ascending: false });

      if (error) throw error;
      setExerciseProgress(data || []);
    } catch (error) {
      console.error('Error fetching exercise progress:', error);
    }
  };

  const getPerformanceMetrics = (): PerformanceMetrics => {
    const totalWorkouts = exerciseProgress.length;
    const totalVolume = exerciseProgress.reduce((sum, ep) => sum + (ep.total_volume || 0), 0);
    const averageDuration = 45; // Mock data for now

    const strongestExercise = exerciseProgress.reduce((strongest, current) => {
      return (current.max_weight || 0) > (strongest?.max_weight || 0) ? current : strongest;
    }, exerciseProgress[0] || {})?.exercise_name || 'None';

    return {
      totalWorkouts,
      totalVolume,
      averageDuration,
      strongestExercise
    };
  };

  const getProgressChartData = (type: 'weekly_volume' | 'weekly_frequency'): ProgressChartData[] => {
    // Mock implementation for now
    const mockData: ProgressChartData[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      mockData.push({
        date: date.toISOString(),
        value: Math.floor(Math.random() * 100) + 50
      });
    }

    return mockData;
  };

  const updateAnalytics = async () => {
    if (!user) return;

    try {
      await fetchExerciseProgress();

      // Update analytics data
      setAnalytics({
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGoals();
      fetchExerciseProgress();
    }
  }, [user]);

  return {
    goals,
    isLoading,
    exerciseProgress,
    analytics,
    createGoal,
    updateGoal,
    deleteGoal,
    getPerformanceMetrics,
    getProgressChartData,
    updateAnalytics,
    refetch: fetchGoals
  };
}


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { WorkoutGoal, WorkoutAnalytics, ExerciseProgress, ProgressChartData, WorkoutPerformanceMetrics } from '@/types/fitness/analytics';

export function useWorkoutAnalytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<WorkoutGoal[]>([]);
  const [analytics, setAnalytics] = useState<WorkoutAnalytics[]>([]);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGoals = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('workout_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: "Error",
        description: "Failed to load workout goals",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async (timeframe: 'week' | 'month' | 'year' = 'month') => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const daysBack = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const { data, error } = await supabase
        .from('workout_analytics')
        .select('*')
        .eq('user_id', user.id)
        .gte('metric_date', startDate.toISOString().split('T')[0])
        .order('metric_date', { ascending: true });

      if (error) throw error;
      setAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExerciseProgress = async (exerciseName?: string, limit: number = 50) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      let query = supabase
        .from('exercise_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_date', { ascending: false })
        .limit(limit);

      if (exerciseName) {
        query = query.eq('exercise_name', exerciseName);
      }

      const { data, error } = await query;

      if (error) throw error;
      setExerciseProgress(data || []);
    } catch (error) {
      console.error('Error fetching exercise progress:', error);
      toast({
        title: "Error",
        description: "Failed to load exercise progress",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createGoal = async (goalData: Omit<WorkoutGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('workout_goals')
        .insert([{ ...goalData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Goal created successfully!"
      });

      fetchGoals();
      return data;
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<WorkoutGoal>) => {
    try {
      const { error } = await supabase
        .from('workout_goals')
        .update(updates)
        .eq('id', goalId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Goal updated successfully!"
      });

      fetchGoals();
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
    try {
      const { error } = await supabase
        .from('workout_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Goal deleted successfully!"
      });

      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive"
      });
    }
  };

  const getProgressChartData = (metricType: string): ProgressChartData[] => {
    return analytics
      .filter(a => a.metric_type === metricType)
      .map(a => ({
        date: a.metric_date,
        value: a.metric_value,
        label: metricType
      }));
  };

  const getPerformanceMetrics = (): WorkoutPerformanceMetrics => {
    const volumeData = analytics.filter(a => a.metric_type === 'weekly_volume');
    const frequencyData = analytics.filter(a => a.metric_type === 'weekly_frequency');
    
    const totalVolume = volumeData.reduce((sum, d) => sum + d.metric_value, 0);
    const totalWorkouts = frequencyData.reduce((sum, d) => sum + d.metric_value, 0);
    const averageDuration = totalWorkouts > 0 ? 45 : 0; // Default estimation
    
    // Find strongest exercise from progress data
    const exerciseMaxes = exerciseProgress.reduce((acc, progress) => {
      if (!acc[progress.exercise_name] || (progress.one_rep_max || 0) > (acc[progress.exercise_name] || 0)) {
        acc[progress.exercise_name] = progress.one_rep_max || 0;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const strongestExercise = Object.entries(exerciseMaxes)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'No data';
    
    return {
      totalWorkouts,
      totalVolume,
      averageDuration,
      strongestExercise,
      improvementRate: 0, // Calculate based on progress trends
      consistencyScore: 0 // Calculate based on frequency consistency
    };
  };

  const updateAnalytics = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('update_workout_analytics', {
        p_user_id: user.id
      });

      if (error) throw error;
      
      // Refresh analytics data
      fetchAnalytics();
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGoals();
      fetchAnalytics();
      fetchExerciseProgress();
    }
  }, [user]);

  return {
    goals,
    analytics,
    exerciseProgress,
    isLoading,
    fetchGoals,
    fetchAnalytics,
    fetchExerciseProgress,
    createGoal,
    updateGoal,
    deleteGoal,
    getProgressChartData,
    getPerformanceMetrics,
    updateAnalytics
  };
}

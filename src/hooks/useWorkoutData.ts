
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  WorkoutPlan,
  WorkoutLog,
  WorkoutHistoryItem,
  UserWorkoutStats,
  WorkoutSchedule
} from '@/types/fitness';
import {
  getWorkoutPlans,
  getWorkoutHistory,
  getWorkoutStats,
  saveWorkoutPlan,
  logWorkout,
  getWorkoutSchedule,
  createWorkoutSchedule
} from '@/services/workoutService';

export const useWorkoutData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [stats, setStats] = useState<UserWorkoutStats | null>(null);
  const [schedules, setSchedules] = useState<WorkoutSchedule[]>([]);
  const [loading, setLoading] = useState<{
    plans: boolean;
    history: boolean;
    stats: boolean;
    schedules: boolean;
  }>({
    plans: false,
    history: false,
    stats: false,
    schedules: false
  });
  const [error, setError] = useState<{
    plans: string | null;
    history: string | null;
    stats: string | null;
    schedules: string | null;
  }>({
    plans: null,
    history: null,
    stats: null,
    schedules: null
  });

  // Load all workout plans for the user
  const loadWorkoutPlans = async () => {
    if (!user) return;

    setLoading(prev => ({ ...prev, plans: true }));
    setError(prev => ({ ...prev, plans: null }));

    try {
      const { data, error } = await getWorkoutPlans(user.id);

      if (error) {
        throw error;
      }

      setPlans(data || []);
    } catch (err: any) {
      console.error('Error loading workout plans:', err);
      setError(prev => ({ ...prev, plans: err.message || 'Failed to load workout plans' }));
      toast({
        title: 'Error',
        description: 'Failed to load workout plans',
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, plans: false }));
    }
  };

  // Load workout history
  const loadWorkoutHistory = async (dateFilter?: string) => {
    if (!user) return;

    setLoading(prev => ({ ...prev, history: true }));
    setError(prev => ({ ...prev, history: null }));

    try {
      const { data, error } = await getWorkoutHistory(user.id, dateFilter);

      if (error) {
        throw error;
      }

      setHistory(data || []);
    } catch (err: any) {
      console.error('Error loading workout history:', err);
      setError(prev => ({ ...prev, history: err.message || 'Failed to load workout history' }));
      toast({
        title: 'Error',
        description: 'Failed to load workout history',
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, history: false }));
    }
  };

  // Load workout stats
  const loadWorkoutStats = async () => {
    if (!user) return;

    setLoading(prev => ({ ...prev, stats: true }));
    setError(prev => ({ ...prev, stats: null }));

    try {
      const { data, error } = await getWorkoutStats(user.id);

      if (error) {
        throw error;
      }

      setStats(data);
    } catch (err: any) {
      console.error('Error loading workout stats:', err);
      setError(prev => ({ ...prev, stats: err.message || 'Failed to load workout statistics' }));
      toast({
        title: 'Error',
        description: 'Failed to load workout statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // Load workout schedules
  const loadWorkoutSchedules = async () => {
    if (!user) return;

    setLoading(prev => ({ ...prev, schedules: true }));
    setError(prev => ({ ...prev, schedules: null }));

    try {
      const { data, error } = await getWorkoutSchedule(user.id);

      if (error) {
        throw error;
      }

      setSchedules(data || []);
    } catch (err: any) {
      console.error('Error loading workout schedules:', err);
      setError(prev => ({ ...prev, schedules: err.message || 'Failed to load workout schedules' }));
      toast({
        title: 'Error',
        description: 'Failed to load workout schedules',
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, schedules: false }));
    }
  };

  // Save a workout plan
  const handleSaveWorkoutPlan = async (plan: WorkoutPlan) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to save workout plans',
        variant: 'destructive',
      });
      return null;
    }

    try {
      // Ensure the user ID is set
      plan.user_id = user.id;
      
      const { data, error } = await saveWorkoutPlan(plan);

      if (error) {
        throw error;
      }

      // Refresh the plans list
      loadWorkoutPlans();
      
      toast({
        title: 'Success',
        description: 'Workout plan saved successfully',
      });

      return data;
    } catch (err: any) {
      console.error('Error saving workout plan:', err);
      toast({
        title: 'Error',
        description: 'Failed to save workout plan',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Log a completed workout
  const handleLogWorkout = async (log: WorkoutLog) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to save workout data',
        variant: 'destructive',
      });
      return null;
    }

    try {
      // Ensure the user ID is set
      log.user_id = user.id;
      
      const { data, error } = await logWorkout(log);

      if (error) {
        throw error;
      }

      // Refresh the history and stats
      loadWorkoutHistory();
      loadWorkoutStats();
      
      toast({
        title: 'Success',
        description: 'Workout logged successfully',
      });

      return data;
    } catch (err: any) {
      console.error('Error logging workout:', err);
      toast({
        title: 'Error',
        description: 'Failed to log workout',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Create a workout schedule
  const handleCreateSchedule = async (schedule: WorkoutSchedule) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to create workout schedules',
        variant: 'destructive',
      });
      return null;
    }

    try {
      // Ensure the user ID is set
      schedule.user_id = user.id;
      
      const { data, error } = await createWorkoutSchedule(schedule);

      if (error) {
        throw error;
      }

      // Refresh the schedules
      loadWorkoutSchedules();
      
      toast({
        title: 'Success',
        description: 'Workout schedule created successfully',
      });

      return data;
    } catch (err: any) {
      console.error('Error creating workout schedule:', err);
      toast({
        title: 'Error',
        description: 'Failed to create workout schedule',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Load data initially when user is authenticated
  useEffect(() => {
    if (user) {
      loadWorkoutPlans();
      loadWorkoutHistory();
      loadWorkoutStats();
      loadWorkoutSchedules();
    }
  }, [user]);

  return {
    plans,
    history,
    stats,
    schedules,
    loading,
    error,
    loadWorkoutPlans,
    loadWorkoutHistory,
    loadWorkoutStats,
    loadWorkoutSchedules,
    saveWorkoutPlan: handleSaveWorkoutPlan,
    logWorkout: handleLogWorkout,
    createSchedule: handleCreateSchedule
  };
};

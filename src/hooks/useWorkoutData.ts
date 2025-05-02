
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import {
  getUserWorkoutPlans,
  getUserWorkoutHistory,
  getUserWorkoutStats,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  logWorkout,
  getUserWorkoutSchedules,
  createWorkoutSchedule
} from '@/services/workoutService';
import { WorkoutPlan, UserWorkoutStats, WorkoutHistoryItem } from '@/types/fitness';

export const useWorkoutData = () => {
  const { user } = useAuth();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [workoutStats, setWorkoutStats] = useState<UserWorkoutStats | null>(null);
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState({
    plans: false,
    stats: false,
    history: false
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchWorkoutPlans();
      fetchWorkoutStats();
    }
  }, [user]);

  const fetchWorkoutPlans = async () => {
    if (!user?.id) return;
    setIsLoading(prev => ({ ...prev, plans: true }));
    try {
      const plans = await getUserWorkoutPlans(user.id);
      setWorkoutPlans(plans);
    } catch (error: any) {
      setError(error.message || 'Failed to load workout plans');
    } finally {
      setIsLoading(prev => ({ ...prev, plans: false }));
    }
  };

  const fetchWorkoutStats = async () => {
    if (!user?.id) return;
    setIsLoading(prev => ({ ...prev, stats: true }));
    
    try {
      const stats = await getUserWorkoutStats(user.id);
      if (stats) {
        setWorkoutStats(stats);
      }
    } catch (error) {
      console.error('Error fetching workout stats:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, stats: false }));
    }
  };

  const loadWorkoutHistory = async () => {
    if (!user?.id) return;
    setIsLoading(prev => ({ ...prev, history: true }));
    try {
      const historyData = await getUserWorkoutHistory(user.id);
      setHistory(historyData);
    } catch (error: any) {
      setError(error.message || 'Failed to load workout history');
    } finally {
      setIsLoading(prev => ({ ...prev, history: false }));
    }
  };

  const addWorkoutPlan = async (planData: any) => {
    if (!user?.id) return;
    try {
      const newPlan = await createWorkoutPlan({ ...planData, user_id: user.id });
      if (newPlan) {
        setWorkoutPlans(prevPlans => [...prevPlans, newPlan]);
      }
      return newPlan;
    } catch (error: any) {
      setError(error.message || 'Failed to add workout plan');
      throw error;
    }
  };

  const updatePlan = async (planId: string, planData: any) => {
    try {
      const updatedPlan = await updateWorkoutPlan(planId, planData);
      if (updatedPlan) {
        setWorkoutPlans(prevPlans =>
          prevPlans.map(plan => (plan.id === planId ? updatedPlan : plan))
        );
      }
      return updatedPlan;
    } catch (error: any) {
      setError(error.message || 'Failed to update workout plan');
      throw error;
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      await deleteWorkoutPlan(planId);
      setWorkoutPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
    } catch (error: any) {
      setError(error.message || 'Failed to delete workout plan');
      throw error;
    }
  };
  
  const logWorkoutSession = async (workoutData: any) => {
    if (!user?.id) return;
    try {
      const result = await logWorkout({
        ...workoutData,
        user_id: user.id
      });
      
      // Refresh stats and history after logging workout
      fetchWorkoutStats();
      loadWorkoutHistory();
      
      return result;
    } catch (error: any) {
      setError(error.message || 'Failed to log workout');
      throw error;
    }
  };

  return {
    workoutPlans,
    workoutStats,
    history,
    isLoading,
    error,
    fetchWorkoutPlans,
    loadWorkoutHistory,
    addWorkoutPlan,
    updatePlan,
    deletePlan,
    logWorkout: logWorkoutSession,
  };
};

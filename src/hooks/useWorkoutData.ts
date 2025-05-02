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
import { WorkoutPlan, UserWorkoutStats } from '@/types/fitness';

export const useWorkoutData = () => {
  const { user } = useAuth();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [workoutStats, setWorkoutStats] = useState<UserWorkoutStats | null>(null);
  const [isLoading, setIsLoading] = useState({
    plans: false,
    stats: false,
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

  // Update the fetchWorkoutStats function to use correct signature
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

  const addWorkoutPlan = async (planData: any) => {
    if (!user?.id) return;
    try {
      const newPlan = await createWorkoutPlan({ ...planData, user_id: user.id });
      if (newPlan) {
        setWorkoutPlans(prevPlans => [...prevPlans, newPlan]);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to add workout plan');
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
    } catch (error: any) {
      setError(error.message || 'Failed to update workout plan');
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      await deleteWorkoutPlan(planId);
      setWorkoutPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
    } catch (error: any) {
      setError(error.message || 'Failed to delete workout plan');
    }
  };

  return {
    workoutPlans,
    workoutStats,
    isLoading,
    error,
    fetchWorkoutPlans,
    addWorkoutPlan,
    updatePlan,
    deletePlan,
  };
};

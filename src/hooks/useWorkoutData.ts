
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import {
  getUserWorkoutPlans,
  getUserWorkoutHistory,
  getUserWorkoutStats,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  logWorkout as logWorkoutService,
  getUserWorkoutSchedules,
  createWorkoutSchedule
} from '@/services/workoutService';
import { WorkoutPlan, UserWorkoutStats, WorkoutHistoryItem, WorkoutLog, WorkoutSchedule } from '@/types/fitness';

export const useWorkoutData = () => {
  const { user } = useAuth();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [schedules, setSchedules] = useState<WorkoutSchedule[]>([]);
  const [workoutStats, setWorkoutStats] = useState<UserWorkoutStats | null>(null);
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState({
    plans: false,
    stats: false,
    history: false,
    schedules: false
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchWorkoutPlans();
      fetchWorkoutStats();
      fetchWorkoutSchedules();
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

  const fetchWorkoutSchedules = async () => {
    if (!user?.id) return;
    setIsLoading(prev => ({ ...prev, schedules: true }));
    try {
      const schedulesData = await getUserWorkoutSchedules(user.id);
      setSchedules(schedulesData || []);
    } catch (error: any) {
      setError(error.message || 'Failed to load workout schedules');
    } finally {
      setIsLoading(prev => ({ ...prev, schedules: false }));
    }
  };

  const loadWorkoutHistory = async () => {
    if (!user?.id) return;
    setIsLoading(prev => ({ ...prev, history: true }));
    try {
      const historyData = await getUserWorkoutHistory(user.id);
      
      // Convert to WorkoutHistoryItem format if necessary
      const formattedHistory: WorkoutHistoryItem[] = historyData.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        date: item.date,
        workout_log_id: item.id,
        workout_plan_name: item.workout_plan_id || 'Unknown',
        workout_day_name: item.workout_day_name || 'Unknown',
        duration: item.duration,
        exercises_completed: Array.isArray(item.completed_exercises) ? item.completed_exercises.length : 0,
        total_exercises: Array.isArray(item.completed_exercises) ? item.completed_exercises.length : 0,
        calories_burned: item.calories_burned || 0
      }));
      
      setHistory(formattedHistory);
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
        setWorkoutPlans(prevPlans => [...prevPlans, newPlan] as WorkoutPlan[]);
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
          prevPlans.map(plan => (plan.id === planId ? updatedPlan : plan)) as WorkoutPlan[]
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
  
  const logWorkout = async (workoutData: WorkoutLog) => {
    if (!user?.id) return;
    try {
      const result = await logWorkoutService({
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
    schedules,
    workoutStats,
    history,
    isLoading,
    error,
    fetchWorkoutPlans,
    loadWorkoutHistory,
    addWorkoutPlan,
    updatePlan,
    deletePlan,
    logWorkout,
    fetchWorkoutSchedules,
  };
};

import { useState, useEffect } from 'react';
import { 
  getWorkoutAnalytics, 
  getUserStreak, 
  getUserPersonalRecords,
  WorkoutSession,
  WorkoutStreak 
} from '@/lib/supabase';

interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number;
  totalCalories: number;
  averageDuration: number;
  averageCalories: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  longestSession: number;
  shortestSession: number;
}

interface ProgressData {
  workoutSessions: WorkoutSession[];
  streak: WorkoutStreak | null;
  stats: WorkoutStats;
  personalRecordsCount: number;
  weeklyProgress: number[];
  monthlyProgress: number[];
  loading: boolean;
  error: string | null;
}

export function useWorkoutAnalytics(userId: string | null) {
  const [data, setData] = useState<ProgressData>({
    workoutSessions: [],
    streak: null,
    stats: {
      totalWorkouts: 0,
      totalDuration: 0,
      totalCalories: 0,
      averageDuration: 0,
      averageCalories: 0,
      workoutsThisWeek: 0,
      workoutsThisMonth: 0,
      longestSession: 0,
      shortestSession: 0,
    },
    personalRecordsCount: 0,
    weeklyProgress: [],
    monthlyProgress: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (userId) {
      loadAnalytics();
    }
  }, [userId]);

  const loadAnalytics = async () => {
    if (!userId) return;

    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Get date ranges
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Fetch all data in parallel
      const [
        workoutSessions,
        streak,
        personalRecords,
      ] = await Promise.all([
        getWorkoutAnalytics(userId, thirtyDaysAgo.toISOString()),
        getUserStreak(userId),
        getUserPersonalRecords(userId),
      ]);

      // Calculate statistics
      const completedSessions = workoutSessions.filter(session => session.completed_at);
      const stats = calculateWorkoutStats(completedSessions, sevenDaysAgo, thirtyDaysAgo);
      
      // Calculate progress arrays
      const weeklyProgress = calculateWeeklyProgress(completedSessions);
      const monthlyProgress = calculateMonthlyProgress(completedSessions);

      setData({
        workoutSessions: completedSessions,
        streak,
        stats,
        personalRecordsCount: personalRecords.length,
        weeklyProgress,
        monthlyProgress,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading workout analytics:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load workout analytics',
      }));
    }
  };

  const calculateWorkoutStats = (
    sessions: WorkoutSession[], 
    weekStart: Date, 
    monthStart: Date
  ): WorkoutStats => {
    const totalWorkouts = sessions.length;
    const totalDuration = sessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
    const totalCalories = sessions.reduce((sum, session) => sum + (session.calories_burned || 0), 0);
    
    const workoutsThisWeek = sessions.filter(
      session => new Date(session.started_at) >= weekStart
    ).length;
    
    const workoutsThisMonth = sessions.filter(
      session => new Date(session.started_at) >= monthStart
    ).length;

    const durations = sessions.map(s => s.duration_minutes || 0).filter(d => d > 0);
    const longestSession = durations.length > 0 ? Math.max(...durations) : 0;
    const shortestSession = durations.length > 0 ? Math.min(...durations) : 0;

    return {
      totalWorkouts,
      totalDuration,
      totalCalories,
      averageDuration: totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0,
      averageCalories: totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0,
      workoutsThisWeek,
      workoutsThisMonth,
      longestSession,
      shortestSession,
    };
  };

  const calculateWeeklyProgress = (sessions: WorkoutSession[]): number[] => {
    const progress = new Array(7).fill(0);
    const now = new Date();
    
    sessions.forEach(session => {
      const sessionDate = new Date(session.started_at);
      const daysDiff = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0 && daysDiff < 7) {
        const dayIndex = 6 - daysDiff; // Reverse order so today is last
        progress[dayIndex] += session.duration_minutes || 0;
      }
    });
    
    return progress;
  };

  const calculateMonthlyProgress = (sessions: WorkoutSession[]): number[] => {
    const progress = new Array(30).fill(0);
    const now = new Date();
    
    sessions.forEach(session => {
      const sessionDate = new Date(session.started_at);
      const daysDiff = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0 && daysDiff < 30) {
        const dayIndex = 29 - daysDiff; // Reverse order so today is last
        progress[dayIndex] += session.duration_minutes || 0;
      }
    });
    
    return progress;
  };

  const refreshAnalytics = () => {
    loadAnalytics();
  };

  return {
    ...data,
    refreshAnalytics,
  };
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutHistoryItem, UserWorkoutStats } from '@/types/fitness';

export const useWorkoutData = () => {
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [workoutStats, setWorkoutStats] = useState<UserWorkoutStats>({
    total_workouts: 0,
    streak_days: 0,
    longest_streak: 0,
    total_calories_burned: 0,
    total_duration_minutes: 0,
    most_active_day: 'N/A'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for now since we don't have user context here
    setHistory([]);
    setWorkoutStats({
      total_workouts: 0,
      streak_days: 0,
      longest_streak: 0,
      total_calories_burned: 0,
      total_duration_minutes: 0,
      most_active_day: 'N/A'
    });
    setIsLoading(false);
  }, []);

  return {
    history,
    workoutStats,
    isLoading
  };
};


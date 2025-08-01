import { useState, useEffect } from 'react';
import { useWorkoutAnalytics } from './useWorkoutAnalytics';
import { usePersonalRecords } from './usePersonalRecords';

interface HomeStats {
  workouts: string;
  streak: string;
  personalRecords: string;
  hours: string;
  loading: boolean;
}

export function useHomeStats(userId: string | null): HomeStats {
  const { stats, streak, loading: analyticsLoading } = useWorkoutAnalytics(userId);
  const { personalRecords, loading: recordsLoading } = usePersonalRecords(userId);

  const [homeStats, setHomeStats] = useState<HomeStats>({
    workouts: '0',
    streak: '0',
    personalRecords: '0',
    hours: '0',
    loading: true,
  });

  useEffect(() => {
    if (!analyticsLoading && !recordsLoading) {
      setHomeStats({
        workouts: stats.totalWorkouts.toString(),
        streak: (streak?.current_streak || 0).toString(),
        personalRecords: personalRecords.length.toString(),
        hours: Math.floor(stats.totalDuration / 60).toString(),
        loading: false,
      });
    }
  }, [stats, streak, personalRecords, analyticsLoading, recordsLoading]);

  return homeStats;
}
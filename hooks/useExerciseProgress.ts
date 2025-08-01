import { useState, useEffect } from 'react';
import { supabase, Exercise, PersonalRecord, getExerciseProgress } from '@/lib/supabase';
import { getExercisePersonalRecords } from '@/lib/personalRecords';

interface ExerciseProgressData {
  date: string;
  value: number;
  sessionId: number;
}

interface ExerciseStats {
  totalSessions: number;
  totalSets: number;
  averageReps: number;
  maxWeight: number;
  maxReps: number;
  totalVolume: number;
}

interface ExerciseProgressChartData {
  weightProgress: ExerciseProgressData[];
  repsProgress: ExerciseProgressData[];
  volumeProgress: ExerciseProgressData[];
  durationProgress: ExerciseProgressData[];
}

export function useExerciseProgress(userId: string | null, exerciseId: number | null) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [progressData, setProgressData] = useState<ExerciseProgressChartData>({
    weightProgress: [],
    repsProgress: [],
    volumeProgress: [],
    durationProgress: [],
  });
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [stats, setStats] = useState<ExerciseStats>({
    totalSessions: 0,
    totalSets: 0,
    averageReps: 0,
    maxWeight: 0,
    maxReps: 0,
    totalVolume: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId && exerciseId) {
      loadExerciseProgress();
    }
  }, [userId, exerciseId]);

  const loadExerciseProgress = async () => {
    if (!userId || !exerciseId) return;

    try {
      setLoading(true);
      setError(null);

      // Load exercise details
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', exerciseId)
        .single();

      if (exerciseError) throw exerciseError;
      setExercise(exerciseData);

      // Load exercise progress data
      const exerciseSets = await getExerciseProgress(userId, exerciseId);
      
      // Load personal records
      const records = await getExercisePersonalRecords(userId, exerciseId);
      setPersonalRecords(records);

      // Process the data
      const processedData = processExerciseData(exerciseSets);
      setProgressData(processedData.chartData);
      setStats(processedData.stats);

    } catch (err: any) {
      console.error('Error loading exercise progress:', err);
      setError(err.message || 'Failed to load exercise progress');
    } finally {
      setLoading(false);
    }
  };

  const processExerciseData = (exerciseSets: any[]) => {
    // Group sets by session
    const sessionGroups = new Map<number, any[]>();
    
    exerciseSets.forEach(set => {
      const sessionId = set.session_exercise.session.id;
      if (!sessionGroups.has(sessionId)) {
        sessionGroups.set(sessionId, []);
      }
      sessionGroups.get(sessionId)!.push(set);
    });

    const weightProgress: ExerciseProgressData[] = [];
    const repsProgress: ExerciseProgressData[] = [];
    const volumeProgress: ExerciseProgressData[] = [];
    const durationProgress: ExerciseProgressData[] = [];

    let totalSets = 0;
    let totalReps = 0;
    let maxWeight = 0;
    let maxReps = 0;
    let totalVolume = 0;

    // Process each session
    sessionGroups.forEach((sets, sessionId) => {
      const sessionDate = sets[0]?.session_exercise?.session?.started_at;
      if (!sessionDate) return;

      const date = new Date(sessionDate).toISOString().split('T')[0];
      
      // Calculate session metrics
      const sessionMaxWeight = Math.max(...sets.map(s => s.weight_kg || 0));
      const sessionMaxReps = Math.max(...sets.map(s => s.reps || 0));
      const sessionTotalVolume = sets.reduce((sum, s) => {
        return sum + ((s.weight_kg || 0) * (s.reps || 0));
      }, 0);
      const sessionTotalDuration = sets.reduce((sum, s) => {
        return sum + (s.duration_seconds || 0);
      }, 0);

      // Add to progress arrays
      if (sessionMaxWeight > 0) {
        weightProgress.push({ date, value: sessionMaxWeight, sessionId });
      }
      if (sessionMaxReps > 0) {
        repsProgress.push({ date, value: sessionMaxReps, sessionId });
      }
      if (sessionTotalVolume > 0) {
        volumeProgress.push({ date, value: sessionTotalVolume, sessionId });
      }
      if (sessionTotalDuration > 0) {
        durationProgress.push({ date, value: Math.round(sessionTotalDuration / 60), sessionId });
      }

      // Update totals
      totalSets += sets.length;
      totalReps += sets.reduce((sum, s) => sum + (s.reps || 0), 0);
      maxWeight = Math.max(maxWeight, sessionMaxWeight);
      maxReps = Math.max(maxReps, sessionMaxReps);
      totalVolume += sessionTotalVolume;
    });

    // Sort progress data by date
    const sortByDate = (a: ExerciseProgressData, b: ExerciseProgressData) => 
      new Date(a.date).getTime() - new Date(b.date).getTime();

    weightProgress.sort(sortByDate);
    repsProgress.sort(sortByDate);
    volumeProgress.sort(sortByDate);
    durationProgress.sort(sortByDate);

    const chartData: ExerciseProgressChartData = {
      weightProgress,
      repsProgress,
      volumeProgress,
      durationProgress,
    };

    const stats: ExerciseStats = {
      totalSessions: sessionGroups.size,
      totalSets,
      averageReps: totalSets > 0 ? Math.round(totalReps / totalSets) : 0,
      maxWeight,
      maxReps,
      totalVolume,
    };

    return { chartData, stats };
  };

  const refreshProgress = () => {
    loadExerciseProgress();
  };

  return {
    exercise,
    progressData,
    personalRecords,
    stats,
    loading,
    error,
    refreshProgress,
  };
}
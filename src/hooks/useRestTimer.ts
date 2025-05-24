
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UseRestTimerProps {
  workoutLogId?: string;
  exerciseName: string;
  setNumber: number;
  defaultRestTime?: number;
}

export const useRestTimer = ({
  workoutLogId,
  exerciseName,
  setNumber,
  defaultRestTime = 60
}: UseRestTimerProps) => {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(defaultRestTime);
  const [plannedTime] = useState(defaultRestTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            logRestSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const logRestSession = async () => {
    if (!user || !workoutLogId) return;

    const actualRestTime = plannedTime - timeLeft;
    
    try {
      await supabase.from('rest_timer_sessions').insert({
        user_id: user.id,
        workout_log_id: workoutLogId,
        exercise_name: exerciseName,
        set_number: setNumber,
        planned_rest_seconds: plannedTime,
        actual_rest_seconds: actualRestTime,
        started_at: startTime?.toISOString(),
        completed_at: new Date().toISOString(),
        was_skipped: false
      });
    } catch (error) {
      console.error('Error logging rest session:', error);
    }
  };

  const startTimer = () => {
    if (!startTime) {
      setStartTime(new Date());
    }
    setIsRunning(true);
    setIsComplete(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(plannedTime);
    setIsComplete(false);
    setStartTime(null);
  };

  const adjustTime = (seconds: number) => {
    if (!isRunning) {
      setTimeLeft(prev => Math.max(0, prev + seconds));
    }
  };

  const skipRest = async () => {
    if (user && workoutLogId) {
      try {
        await supabase.from('rest_timer_sessions').insert({
          user_id: user.id,
          workout_log_id: workoutLogId,
          exercise_name: exerciseName,
          set_number: setNumber,
          planned_rest_seconds: plannedTime,
          actual_rest_seconds: plannedTime - timeLeft,
          started_at: startTime?.toISOString(),
          completed_at: new Date().toISOString(),
          was_skipped: true
        });
      } catch (error) {
        console.error('Error logging skipped rest session:', error);
      }
    }

    setIsRunning(false);
    setTimeLeft(0);
    setIsComplete(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    plannedTime,
    isRunning,
    isComplete,
    startTimer,
    pauseTimer,
    resetTimer,
    adjustTime,
    skipRest,
    formatTime,
    progress: ((plannedTime - timeLeft) / plannedTime) * 100
  };
};

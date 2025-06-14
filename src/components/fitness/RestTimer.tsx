
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface RestTimerProps {
  exerciseName: string;
  setNumber: number;
  plannedRestSeconds: number;
  workoutLogId?: string;
  onTimerComplete?: () => void;
}

const RestTimer: React.FC<RestTimerProps> = ({
  exerciseName,
  setNumber,
  plannedRestSeconds,
  workoutLogId,
  onTimerComplete
}) => {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(plannedRestSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      onTimerComplete?.();
      toast.success('Rest time complete!');
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, onTimerComplete]);

  const startTimer = () => {
    setIsRunning(true);
    setStartTime(new Date());
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(plannedRestSeconds);
    setStartTime(null);
  };

  const skipTimer = async () => {
    const actualRestSeconds = plannedRestSeconds - timeLeft;
    await saveRestSession(true, actualRestSeconds);
    setIsRunning(false);
    onTimerComplete?.();
  };

  const completeTimer = async () => {
    const actualRestSeconds = startTime ? 
      Math.floor((new Date().getTime() - startTime.getTime()) / 1000) : 
      plannedRestSeconds;
    await saveRestSession(false, actualRestSeconds);
    setIsRunning(false);
    onTimerComplete?.();
  };

  const saveRestSession = async (wasSkipped: boolean, actualRestSeconds: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('rest_timer_sessions')
        .insert({
          rest_timer_sessions_user_id: user.id, // Updated field name
          exercise_name: exerciseName,
          set_number: setNumber,
          planned_rest_seconds: plannedRestSeconds,
          actual_rest_seconds: actualRestSeconds,
          was_skipped: wasSkipped,
          workout_log_id: workoutLogId,
          started_at: startTime?.toISOString(),
          completed_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving rest session:', error);
      }
    } catch (error) {
      console.error('Error in saveRestSession:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">Rest Timer</h3>
      <p className="text-sm text-gray-600 mb-4">
        {exerciseName} - Set {setNumber}
      </p>
      
      <div className="text-center">
        <div className="text-4xl font-bold mb-4 text-blue-600">
          {formatTime(timeLeft)}
        </div>
        
        <div className="flex gap-2 justify-center">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Start
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Pause
            </button>
          )}
          
          <button
            onClick={resetTimer}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset
          </button>
          
          <button
            onClick={skipTimer}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Skip
          </button>
          
          {timeLeft === 0 && (
            <button
              onClick={completeTimer}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestTimer;

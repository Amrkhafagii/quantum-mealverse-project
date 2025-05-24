
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Plus, Minus, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface RestTimerProps {
  workoutLogId?: string;
  exerciseName: string;
  setNumber: number;
  defaultRestTime?: number;
  onTimerComplete?: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  workoutLogId,
  exerciseName,
  setNumber,
  defaultRestTime = 60,
  onTimerComplete
}) => {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(defaultRestTime);
  const [plannedTime] = useState(defaultRestTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for timer completion sound
    audioRef.current = new Audio('/timer-complete.mp3');
    audioRef.current.preload = 'auto';
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            playCompletionSound();
            logRestSession();
            onTimerComplete?.();
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

  const playCompletionSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

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

  const skipRest = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setIsComplete(true);
    onTimerComplete?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((plannedTime - timeLeft) / plannedTime) * 100;

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-quantum-cyan">Rest Timer</CardTitle>
        <p className="text-sm text-gray-400">
          {exerciseName} - Set {setNumber}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={timeLeft}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`text-6xl font-bold font-mono ${
                isComplete ? 'text-green-400' : timeLeft <= 10 ? 'text-red-400' : 'text-quantum-cyan'
              }`}
            >
              {formatTime(timeLeft)}
            </motion.div>
          </AnimatePresence>
        </div>

        <Progress 
          value={progress} 
          className="h-3" 
        />

        {!isRunning && !isComplete && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustTime(-15)}
              disabled={timeLeft <= 15}
            >
              <Minus className="w-4 h-4" />
              15s
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustTime(15)}
            >
              <Plus className="w-4 h-4" />
              15s
            </Button>
          </div>
        )}

        <div className="flex justify-center gap-2">
          {!isComplete ? (
            <>
              <Button
                onClick={isRunning ? pauseTimer : startTimer}
                className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                onClick={resetTimer}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={skipRest}
                className="text-orange-400 border-orange-400 hover:bg-orange-400/10"
              >
                Skip
              </Button>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="text-green-400 font-semibold mb-2">Rest Complete!</div>
              <Button
                onClick={resetTimer}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Start Next Set
              </Button>
            </motion.div>
          )}
        </div>

        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-gray-400"
          >
            Actual rest time: {formatTime(plannedTime - timeLeft)}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

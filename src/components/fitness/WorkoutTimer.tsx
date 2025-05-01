
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Timer } from 'lucide-react';

interface WorkoutTimerProps {
  onDurationChange: (seconds: number) => void;
  initialDuration?: number;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ 
  onDurationChange,
  initialDuration = 0
}) => {
  const [duration, setDuration] = useState(initialDuration);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerRunning) {
      interval = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          onDurationChange(newDuration);
          return newDuration;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, onDurationChange]);

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-between items-center">
      <Button 
        onClick={toggleTimer}
        className={timerRunning ? "bg-red-500 hover:bg-red-600" : "bg-quantum-cyan hover:bg-quantum-cyan/90"}
      >
        {timerRunning ? "Pause Timer" : "Start Timer"}
      </Button>
      
      <div className="flex items-center space-x-2 text-lg">
        <Timer className="h-5 w-5 text-quantum-cyan" />
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default WorkoutTimer;


import { useState, useEffect } from 'react';

export const useOrderTimer = (expiresAt: string | undefined) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);
  
  useEffect(() => {
    if (!expiresAt) return;
    
    const expiresAtTime = new Date(expiresAt).getTime();
    const FIVE_MINUTES = 5 * 60; // 5 minutes in seconds
    
    const updateTimer = () => {
      const now = Date.now();
      const secondsLeft = Math.max(0, Math.floor((expiresAtTime - now) / 1000));
      setTimeLeft(secondsLeft);
      
      // Calculate progress as percentage of time remaining from 5 minutes
      const progressValue = (secondsLeft / FIVE_MINUTES) * 100;
      setProgress(Math.max(0, Math.min(100, progressValue)));
      
      // Log to help debug
      console.log(`Timer: ${secondsLeft}s left, ${progressValue.toFixed(1)}% remaining`);
    };
    
    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    
    return () => {
      clearInterval(timerInterval);
    };
  }, [expiresAt]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    progress,
    formattedTime: formatTime(timeLeft)
  };
};


import { useState, useEffect } from 'react';

export const useOrderTimer = (expiresAt: string | undefined) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);
  
  useEffect(() => {
    console.log('OrderTimer Hook: Starting useEffect');
    console.log('Expires At:', expiresAt);
    
    if (!expiresAt) {
      console.warn('No expiration time provided');
      return;
    }
    
    try {
      const expiresAtTime = new Date(expiresAt).getTime();
      if (isNaN(expiresAtTime)) {
        console.error('Invalid expiration time format:', expiresAt);
        return;
      }
      
      const FIVE_MINUTES = 5 * 60; // 5 minutes in seconds
      
      const updateTimer = () => {
        const now = Date.now();
        const secondsLeft = Math.max(0, Math.floor((expiresAtTime - now) / 1000));
        setTimeLeft(secondsLeft);
        
        // Calculate progress as percentage of time remaining from 5 minutes
        const progressValue = (secondsLeft / FIVE_MINUTES) * 100;
        setProgress(Math.max(0, Math.min(100, progressValue)));
        
        // Detailed logging
        console.log(`Timer Details:
          - Expires At: ${new Date(expiresAtTime).toISOString()}
          - Current Time: ${new Date(now).toISOString()}
          - Seconds Left: ${secondsLeft}s
          - Progress: ${progressValue.toFixed(1)}%`);
      };
      
      updateTimer();
      const timerInterval = setInterval(updateTimer, 1000);
      
      return () => {
        clearInterval(timerInterval);
      };
    } catch (error) {
      console.error('Error in timer calculation:', error);
    }
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

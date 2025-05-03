import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { calculateRemainingTime, formatTime, calculateProgress } from '@/utils/timer/timerCalculations';

export interface OrderTimerProps {
  updatedAt?: string;
  expiresAt?: string;
  orderId?: string;
  onTimerExpire?: () => void;
}

export const OrderTimer: React.FC<OrderTimerProps> = ({ 
  updatedAt,
  expiresAt,
  orderId,
  onTimerExpire
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(300); // Default to 5 min
  const [progress, setProgress] = useState<number>(100);
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);

  useEffect(() => {
    // If we have an explicit expiry time, use that
    if (expiresAt) {
      const expiresAtDate = new Date(expiresAt);
      const intervalId = setInterval(() => {
        const remainingSeconds = calculateRemainingTime(expiresAtDate, serverTimeOffset);
        setSecondsLeft(remainingSeconds);
        setProgress(calculateProgress(remainingSeconds));
        
        if (remainingSeconds <= 0) {
          clearInterval(intervalId);
          if (onTimerExpire) {
            onTimerExpire();
          }
        }
      }, 1000);
      
      return () => clearInterval(intervalId);
    }
    
    // Otherwise use the updatedAt time + 5 minutes logic
    if (updatedAt) {
      const startTime = new Date(updatedAt);
      const expiresAtDate = new Date(startTime.getTime() + (5 * 60 * 1000)); // 5 minutes
      
      const intervalId = setInterval(() => {
        const remainingSeconds = calculateRemainingTime(expiresAtDate, serverTimeOffset);
        setSecondsLeft(remainingSeconds);
        setProgress(calculateProgress(remainingSeconds));
        
        if (remainingSeconds <= 0) {
          clearInterval(intervalId);
          if (onTimerExpire) {
            onTimerExpire();
          }
        }
      }, 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [updatedAt, expiresAt, serverTimeOffset, onTimerExpire]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Time remaining:</span>
        <span className={secondsLeft < 60 ? "text-red-500 font-semibold" : ""}>
          {formatTime(secondsLeft)}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

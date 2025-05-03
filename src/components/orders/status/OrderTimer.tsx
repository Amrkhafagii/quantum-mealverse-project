import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

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
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  useEffect(() => {
    // If expiresAt is provided, calculate time remaining instead
    if (expiresAt) {
      const expireTime = new Date(expiresAt).getTime();
      
      const calculateTimeRemaining = () => {
        const now = new Date().getTime();
        const remaining = Math.max(0, Math.floor((expireTime - now) / 1000));
        
        setTimeRemaining(remaining);
        
        if (remaining <= 0 && onTimerExpire) {
          onTimerExpire();
        }
      };
      
      calculateTimeRemaining();
      const interval = setInterval(calculateTimeRemaining, 1000);
      
      return () => clearInterval(interval);
    } 
    // Otherwise use updatedAt for elapsed time
    else if (updatedAt) {
      const startTime = new Date(updatedAt).getTime();
      
      const calculateTimeElapsed = () => {
        const now = new Date().getTime();
        setTimeElapsed(Math.floor((now - startTime) / 1000));
      };
      
      calculateTimeElapsed();
      const interval = setInterval(calculateTimeElapsed, 1000);
      
      return () => clearInterval(interval);
    }
  }, [updatedAt, expiresAt, onTimerExpire]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (timeRemaining !== null) {
    // Show remaining time countdown
    return (
      <div className="flex items-center gap-1 text-sm">
        <Clock className="w-3 h-3" />
        <span className={timeRemaining < 30 ? "text-red-500" : "text-gray-400"}>
          Time remaining: {formatTime(timeRemaining)}
        </span>
      </div>
    );
  }
  
  // Show elapsed time
  return (
    <div className="flex items-center gap-1 text-sm text-gray-400">
      <Clock className="w-3 h-3" />
      <span>Time elapsed: {formatTime(timeElapsed)}</span>
    </div>
  );
};


import React, { useState, useEffect } from 'react';

export interface OrderTimerProps {
  estimatedTime: number;
  updatedAt?: string;
  expiresAt?: string;
  orderId?: string;
  onTimerExpire?: () => void;
}

export const OrderTimer: React.FC<OrderTimerProps> = ({ 
  estimatedTime, 
  updatedAt,
  expiresAt,
  orderId,
  onTimerExpire 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(estimatedTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          if (onTimerExpire) {
            onTimerExpire();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [onTimerExpire]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  return (
    <div className="order-timer my-4">
      <h3 className="text-lg font-medium">Estimated Time:</h3>
      <div className="text-2xl font-bold">
        {timeRemaining > 0 ? formatTime(timeRemaining) : "Ready soon!"}
      </div>
    </div>
  );
};

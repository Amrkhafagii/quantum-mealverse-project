
import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { hapticFeedback } from '@/utils/hapticFeedback';

export interface OrderTimerProps {
  estimatedTime?: string | Date;
  updatedAt?: string | Date;
  expiresAt?: string | Date;
  orderId?: string;
  onTimerExpire?: () => Promise<void> | void;
}

export const OrderTimer: React.FC<OrderTimerProps> = ({
  estimatedTime,
  updatedAt,
  expiresAt,
  orderId,
  onTimerExpire
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const { isMobile } = useResponsive();
  
  useEffect(() => {
    const calculateRemainingTime = () => {
      let targetTime: Date | null = null;
      
      // Parse the estimated delivery time if provided
      if (estimatedTime) {
        targetTime = typeof estimatedTime === 'string' ? new Date(estimatedTime) : estimatedTime;
      }
      // Or calculate from expires_at if available
      else if (expiresAt) {
        targetTime = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
      }
      
      if (targetTime) {
        const now = new Date();
        const diff = targetTime.getTime() - now.getTime();
        
        // If expired, trigger callback
        if (diff <= 0 && !isExpired) {
          setIsExpired(true);
          if (onTimerExpire) {
            onTimerExpire();
          }
          
          // Provide haptic feedback when timer expires on mobile
          if (isMobile) {
            hapticFeedback.warning();
          }
          
          return 0;
        }
        
        return Math.max(0, Math.floor(diff / 1000));
      }
      
      return 0;
    };

    // Initial calculation
    setTimeRemaining(calculateRemainingTime());
    
    // Update timer every second
    const intervalId = setInterval(() => {
      setTimeRemaining(calculateRemainingTime());
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [estimatedTime, expiresAt, isExpired, onTimerExpire, isMobile]);
  
  // Format remaining time
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '00:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate percentage for progress bar
  const calculatePercentage = (): number => {
    if (isExpired) return 100;
    
    // Default to 5 minutes if no estimate
    const totalTime = 5 * 60; // 5 minutes in seconds
    return Math.min(100, (1 - (timeRemaining / totalTime)) * 100);
  };
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-quantum-cyan" />
          <span className="text-sm font-medium">
            {isExpired ? 'Expected Time Passed' : 'Expected Time Remaining'}
          </span>
        </div>
        <span className={`font-mono font-bold ${isExpired ? 'text-red-500' : 'text-quantum-cyan'}`}>
          {formatTime(timeRemaining)}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${isExpired ? 'bg-red-500' : 'bg-quantum-cyan'}`}
          style={{ width: `${calculatePercentage()}%` }}
        ></div>
      </div>
      
      {isExpired && (
        <div className="mt-3 text-sm flex items-center text-amber-500">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>The estimated time has passed. Your order is still being processed.</span>
        </div>
      )}
    </div>
  );
};

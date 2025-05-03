
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface OrderTimerProps {
  updatedAt: string;
}

export const OrderTimer: React.FC<OrderTimerProps> = ({ updatedAt }) => {
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  
  useEffect(() => {
    const startTime = new Date(updatedAt).getTime();
    
    const calculateTimeElapsed = () => {
      const now = new Date().getTime();
      setTimeElapsed(Math.floor((now - startTime) / 1000));
    };
    
    calculateTimeElapsed();
    const interval = setInterval(calculateTimeElapsed, 1000);
    
    return () => clearInterval(interval);
  }, [updatedAt]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex items-center gap-1 text-sm text-gray-400">
      <Clock className="w-3 h-3" />
      <span>Time elapsed: {formatTime(timeElapsed)}</span>
    </div>
  );
};

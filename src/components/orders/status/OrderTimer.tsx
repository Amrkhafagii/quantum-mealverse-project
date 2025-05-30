
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface OrderTimerProps {
  expiresAt: Date;
  orderId: string;
  onTimerExpire?: () => void;
}

export const OrderTimer: React.FC<OrderTimerProps> = ({
  expiresAt,
  orderId,
  onTimerExpire
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;
      
      if (difference > 0) {
        setTimeLeft(Math.floor(difference / 1000));
      } else {
        setTimeLeft(0);
        onTimerExpire?.();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onTimerExpire]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (timeLeft <= 0) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Expired
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <Clock className="h-3 w-3" />
      {formatTime(timeLeft)}
    </Badge>
  );
};

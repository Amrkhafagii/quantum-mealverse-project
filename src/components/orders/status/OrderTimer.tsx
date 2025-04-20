
import React from 'react';
import { Clock } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { useOrderTimer } from '@/hooks/useOrderTimer';

interface OrderTimerProps {
  expiresAt?: string;
}

export const OrderTimer: React.FC<OrderTimerProps> = ({ expiresAt }) => {
  const { timeLeft, progress, formattedTime } = useOrderTimer(expiresAt);

  if (!expiresAt) return null;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Restaurant response time:</span>
        </div>
        <span>{formattedTime}</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

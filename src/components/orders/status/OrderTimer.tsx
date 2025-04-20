
import React from 'react';
import { Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useOrderTimer } from '@/hooks/useOrderTimer';

interface OrderTimerProps {
  expiresAt: string;
}

export const OrderTimer: React.FC<OrderTimerProps> = ({ expiresAt }) => {
  const { timeLeft, progress, formattedTime } = useOrderTimer(expiresAt);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Clock className="h-4 w-4" />
        <span>Time remaining for restaurant to respond: {formattedTime}</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

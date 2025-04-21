
import React, { useEffect } from 'react';
import { Clock, Hourglass } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useOrderTimer } from '@/hooks/useOrderTimer';

interface OrderTimerProps {
  expiresAt?: string;
  orderId: string;
  onTimerExpire?: () => void;
}

export const OrderTimer: React.FC<OrderTimerProps> = ({ 
  expiresAt,
  orderId,
  onTimerExpire,
}) => {
  useEffect(() => {
    if (!expiresAt) {
      return;
    }
    // Validate the expiresAt value
    try {
      const date = new Date(expiresAt);
      const timeUntilExpiry = Math.floor((date.getTime() - Date.now()) / 1000);
    } catch (error) {}
  }, [expiresAt, orderId]);

  const { timeLeft, progress, formattedTime } = useOrderTimer(expiresAt, orderId, onTimerExpire);

  if (!expiresAt) {
    return (
      <div className="text-center py-2 text-gray-400">
        <Clock className="h-4 w-4 inline mr-2" />
        <span>Waiting for restaurant assignment...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="h-4 w-4 text-quantum-cyan" />
          <span>Restaurant response timer:</span>
        </div>
        <div className="text-lg font-mono bg-quantum-darkBlue px-3 py-1 rounded-md text-quantum-cyan">
          <Hourglass className="h-4 w-4 inline mr-2 animate-pulse" />
          {formattedTime}
        </div>
      </div>
      <Progress 
        value={progress} 
        className="h-3 bg-gray-800" 
      />
      <p className="text-xs text-gray-500 text-right">
        Time remaining for restaurant to respond
      </p>
    </div>
  );
};

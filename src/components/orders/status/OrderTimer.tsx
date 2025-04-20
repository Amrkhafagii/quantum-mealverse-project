
import React, { useEffect } from 'react';
import { Clock, Hourglass } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useOrderTimer } from '@/hooks/useOrderTimer';

interface OrderTimerProps {
  expiresAt: string | undefined;
  orderId: string | undefined;
  onTimerExpire?: () => void;
}

export const OrderTimer: React.FC<OrderTimerProps> = ({ 
  expiresAt,
  orderId,
  onTimerExpire
}) => {
  useEffect(() => {
    console.log('OrderTimer Component Mounted with:', { 
      expiresAt, 
      orderId,
      currentTime: new Date().toISOString() 
    });
    
    if (!expiresAt) {
      console.warn('No expiration time provided to OrderTimer');
      return;
    }
    
    // Validate the expiresAt value
    try {
      const date = new Date(expiresAt);
      const timeUntilExpiry = Math.floor((date.getTime() - Date.now()) / 1000);
      
      if (isNaN(date.getTime())) {
        console.error('Invalid date format for expiresAt:', expiresAt);
      } else {
        console.log(`Valid expiration time: ${date.toISOString()}, ${timeUntilExpiry}s remaining`);
      }
    } catch (error) {
      console.error('Error parsing expiresAt:', error);
    }
  }, [expiresAt, orderId]);

  const { timeLeft, progress, formattedTime } = useOrderTimer(expiresAt, orderId, onTimerExpire);

  if (!expiresAt) {
    return (
      <div className="text-center py-2 text-gray-400">
        <Clock className="h-4 w-4 inline mr-2" />
        <span>Waiting for response...</span>
      </div>
    );
  }

  // Add debug info in dev environment
  const isDebug = process.env.NODE_ENV === 'development';

  return (
    <div className="space-y-3">
      {isDebug && (
        <div className="text-xs text-gray-500 mb-2">
          <p>Debug: Expires at {expiresAt}</p>
          <p>Debug: Order ID {orderId}</p>
          <p>Debug: Time left {timeLeft}s</p>
        </div>
      )}
      
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

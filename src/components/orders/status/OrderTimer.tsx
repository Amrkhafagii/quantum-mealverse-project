
import React, { useEffect } from 'react';
import { Clock, Hourglass } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useOrderTimer } from '@/hooks/useOrderTimer';
import { toast } from 'sonner';
import { checkExpiredAssignments } from '@/services/orders/webhookService';
import { logApiCall } from '@/services/loggerService';

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
  const { timeLeft, progress, formattedTime, isExpired } = useOrderTimer(
    expiresAt, 
    orderId
  );
  
  // Check for server-side assignment expiration periodically
  useEffect(() => {
    if (orderId && expiresAt) {
      // Initial check when component mounts
      const initialCheck = async () => {
        try {
          await checkExpiredAssignments();
        } catch (error) {
          console.error('Error in initial assignment check:', error);
        }
      };
      
      initialCheck();
      
      // Set up a periodic check
      const checkInterval = setInterval(async () => {
        try {
          // Only do periodic checks if we're still waiting for a response
          if (!isExpired && timeLeft < 60) {
            console.log('Performing periodic check for expired assignments');
            await checkExpiredAssignments();
          }
        } catch (error) {
          console.error('Error in periodic assignment check:', error);
        }
      }, 30000); // Check every 30 seconds
      
      return () => clearInterval(checkInterval);
    }
  }, [orderId, expiresAt, isExpired, timeLeft]);
  
  // When our timer expires, notify the user and trigger refresh
  useEffect(() => {
    if (isExpired && onTimerExpire) {
      toast.info("Restaurant response time expired. Updating order status...");
      onTimerExpire();
    }
  }, [isExpired, onTimerExpire]);

  if (isExpired) {
    return (
      <div className="text-center py-2 text-amber-500">
        <Clock className="h-4 w-4 inline mr-2" />
        <span>Timer expired. Updating status...</span>
      </div>
    );
  }

  if (!expiresAt) {
    return (
      <div className="text-center py-2 text-gray-400">
        <Clock className="h-4 w-4 inline mr-2" />
        <span>Waiting for restaurant assignment...</span>
      </div>
    );
  }

  // Add clear debugging information to help diagnose time-related issues
  const expiryDate = new Date(expiresAt);
  const currentDate = new Date();
  const diffMs = expiryDate.getTime() - currentDate.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  
  console.log(`OrderTimer render for order ${orderId}:`);
  console.log(`- expiresAt: ${expiresAt}`);
  console.log(`- Current time: ${currentDate.toISOString()}`);
  console.log(`- Time difference: ${diffSecs} seconds`);
  console.log(`- timeLeft from hook: ${timeLeft} seconds`);

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


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
  
  // Periodically check for expired assignments at the server level
  useEffect(() => {
    const interval = setInterval(async () => {
      if (orderId) {
        console.log('Periodic expired assignment check for order:', orderId);
        try {
          const result = await checkExpiredAssignments();
          console.log('Periodic check result:', result);
          
          // Log the check in our system
          await logApiCall('periodic-expired-check', { orderId }, result);
          
          if (!result.success) {
            console.warn('Periodic expired check failed:', result.error);
          }
        } catch (error) {
          console.error('Error in periodic expired assignment check:', error);
        }
      }
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [orderId]);
  
  // When our timer expires, notify the user and trigger refresh
  useEffect(() => {
    if (isExpired && onTimerExpire) {
      toast.info("Restaurant response time expired. Updating order status...");
      
      // Force an immediate check for expired assignments
      const forceCheck = async () => {
        console.log('Timer expired - forcing check for expired assignments');
        try {
          const result = await checkExpiredAssignments();
          console.log('Force check result on timer expiry:', result);
          
          // Log the forced check
          await logApiCall('timer-expired-check', { orderId }, result);
        } catch (error) {
          console.error('Error in force check on timer expiry:', error);
        }
        
        // Call the callback regardless of the check result
        onTimerExpire();
      };
      
      forceCheck();
    }
  }, [isExpired, onTimerExpire, orderId]);

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


import React, { useEffect } from 'react';
import { Clock, Hourglass } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useOrderTimer } from '@/hooks/useOrderTimer';
import { toast } from 'sonner';
import { checkExpiredAssignments, forceExpireAssignments } from '@/services/orders/webhookService';
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
  
  // Check for already expired assignments on mount
  useEffect(() => {
    if (orderId && expiresAt) {
      const initialCheck = async () => {
        console.log('Initial expired assignment check for order:', orderId);
        try {
          // Check if the assignment should already be expired (by timestamp)
          const expiryTime = new Date(expiresAt);
          const now = new Date();
          console.log('Expiry time:', expiryTime.toISOString());
          console.log('Current time:', now.toISOString());
          console.log('Time difference (seconds):', Math.floor((expiryTime.getTime() - now.getTime()) / 1000));
          
          if (expiryTime < now) {
            console.log('Assignment appears to be expired by timestamp, forcing expiration');
            const forceResult = await forceExpireAssignments(orderId);
            console.log('Force expiration result:', forceResult);
            
            // Log the force check
            await logApiCall('component-initial-force', { 
              orderId, 
              expiresAt,
              currentTime: now.toISOString()
            }, forceResult);
            
            // Update UI if assignment was expired
            if (forceResult.success && onTimerExpire) {
              toast.info("Restaurant response time expired. Updating order status...");
              onTimerExpire();
            }
          } else {
            console.log('Assignment not yet expired by timestamp. expiresAt:', expiresAt);
          }
        } catch (error) {
          console.error('Error in initial expired assignment check:', error);
        }
      };
      
      initialCheck();
    }
  }, [orderId, expiresAt, onTimerExpire]);
  
  // When our timer expires, notify the user and trigger refresh
  useEffect(() => {
    if (isExpired && onTimerExpire) {
      toast.info("Restaurant response time expired. Updating order status...");
      
      // Force an immediate check for expired assignments
      const forceCheck = async () => {
        console.log('Timer expired - forcing check for expired assignments');
        try {
          // First try direct database modification
          console.log('Attempting direct database update for expired assignments');
          const result = await forceExpireAssignments(orderId);
          console.log('Force expiration result on timer expiry:', result);
          
          // Log the forced check
          await logApiCall('timer-expired-direct-update', { orderId }, result);
          
          // If direct update didn't work, try the webhook
          if (!result.success) {
            console.log('Direct update failed, trying webhook');
            const webhookResult = await checkExpiredAssignments();
            console.log('Webhook check result:', webhookResult);
            
            // Log the webhook approach
            await logApiCall('timer-expired-webhook', { orderId }, webhookResult);
          }
        } catch (error) {
          console.error('Error in force check on timer expiry:', error);
          
          // One last attempt with a short delay
          setTimeout(async () => {
            try {
              console.log('Final attempt to expire assignments');
              const lastResortResult = await forceExpireAssignments(orderId);
              console.log('Final attempt result:', lastResortResult);
              
              // Log the final attempt
              await logApiCall('timer-expired-final-attempt', { orderId }, lastResortResult);
            } catch (finalError) {
              console.error('Final attempt also failed:', finalError);
            }
          }, 1000);
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

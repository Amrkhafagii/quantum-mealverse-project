
import { useEffect } from 'react';
import { forceExpireAssignments, checkExpiredAssignments } from '@/services/orders/webhookService';
import { logApiCall } from '@/services/loggerService';

export const useExpiredAssignments = (
  orderId: string | undefined,
  expiresAt: string | undefined,
  isExpired: boolean,
  onTimerExpire?: () => void
) => {
  // Initial check for expired assignments
  useEffect(() => {
    if (!orderId || !expiresAt) return;

    const initialCheck = async () => {
      console.log('Initial expired assignment check for order:', orderId);
      try {
        const expiryTime = new Date(expiresAt);
        const now = new Date();
        
        if (expiryTime < now) {
          console.log('Assignment appears to be expired by timestamp, forcing expiration');
          const result = await forceExpireAssignments(orderId);
          console.log('Force expiration result:', result);
          
          await logApiCall('initial-expired-force', { 
            orderId, 
            expiresAt,
            currentTime: now.toISOString()
          }, result);
          
          if (result.success && onTimerExpire) {
            onTimerExpire();
          }
        }
      } catch (error) {
        console.error('Error in initial expired assignment check:', error);
      }
    };

    initialCheck();
  }, [orderId, expiresAt, onTimerExpire]);

  // Handle timer expiration
  useEffect(() => {
    if (!orderId || !isExpired || !onTimerExpire) return;

    const handleExpiration = async () => {
      try {
        const result = await forceExpireAssignments(orderId);
        await logApiCall('timer-expired-direct-update', { orderId }, result);
        
        if (!result.success) {
          const webhookResult = await checkExpiredAssignments();
          await logApiCall('timer-expired-webhook', { orderId }, webhookResult);
        }
      } catch (error) {
        console.error('Error handling timer expiration:', error);
        
        setTimeout(async () => {
          try {
            const finalResult = await forceExpireAssignments(orderId);
            await logApiCall('timer-expired-final-attempt', { orderId }, finalResult);
          } catch (finalError) {
            console.error('Final attempt also failed:', finalError);
          }
        }, 2000);
      }
      
      onTimerExpire();
    };

    handleExpiration();
  }, [orderId, isExpired, onTimerExpire]);
};

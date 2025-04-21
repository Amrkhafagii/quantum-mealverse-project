
import { useEffect } from 'react';
import { forceExpireAssignments, checkExpiredAssignments } from '@/services/orders/webhookService';
import { logApiCall } from '@/services/loggerService';

/**
 * This hook handles expired assignment checks.
 * It performs an initial check and handles timer expiration.
 */
export const useExpiredAssignments = (
  orderId: string | undefined,
  expiresAt: string | undefined,
  isExpired: boolean,
  onTimerExpire?: () => void
) => {
  // Initial check for expired assignments - only runs once when component mounts
  useEffect(() => {
    if (!orderId || !expiresAt) return;

    const initialCheck = async () => {
      console.log('Initial expired assignment check for order:', orderId);
      try {
        const expiryTime = new Date(expiresAt);
        const now = new Date();
        
        // This is now mainly for UI consistency - the server will handle actual expiration
        if (expiryTime < now) {
          console.log('Assignment appears to be expired by timestamp, checking server status');
          
          // Call the server to check expired assignments
          await checkExpiredAssignments();
          
          // Log the check
          await logApiCall('initial-expired-check', { 
            orderId, 
            expiresAt,
            currentTime: now.toISOString()
          }, { success: true });
          
          // If the assignment should be expired, refresh UI
          if (onTimerExpire) {
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
        // This function now mainly ensures UI consistency with server state
        // The server should already be updating expired assignments independently
        console.log('Timer expired in UI - verifying with server');
        
        const webhookResult = await checkExpiredAssignments();
        await logApiCall('timer-expired-check', { orderId }, webhookResult);
      } catch (error) {
        console.error('Error handling timer expiration:', error);
      }
      
      // Update UI regardless
      onTimerExpire();
    };

    handleExpiration();
  }, [orderId, isExpired, onTimerExpire]);
};

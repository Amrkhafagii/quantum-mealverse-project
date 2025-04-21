
import { useEffect } from 'react';
import { checkExpiredAssignments } from '@/services/orders/webhookService';
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
        
        // Verify server state if assignment appears to be expired
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

  // Handle timer expiration in UI
  useEffect(() => {
    if (!orderId || !isExpired || !onTimerExpire) return;

    const verifyExpiration = async () => {
      try {
        // Verify with server that assignment is truly expired
        await checkExpiredAssignments();
        await logApiCall('verify-expired-state', { orderId }, { success: true });
      } catch (error) {
        console.error('Error verifying expired state:', error);
      }
      
      // Update UI to reflect expired state
      onTimerExpire();
    };

    verifyExpiration();
  }, [orderId, isExpired, onTimerExpire]);
};

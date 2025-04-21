
import { useEffect } from 'react';
import { logApiCall } from '@/services/loggerService';

/**
 * This hook handles expired assignment checks.
 * It now relies primarily on the server-side cron job for expiration handling.
 */
export const useExpiredAssignments = (
  orderId: string | undefined,
  expiresAt: string | undefined,
  isExpired: boolean,
  onTimerExpire?: () => void
) => {
  // When timer expires in UI, we trigger a refresh
  useEffect(() => {
    if (!orderId || !isExpired || !onTimerExpire) return;

    // Log expired timer state
    const logExpiration = async () => {
      try {
        await logApiCall('timer-expired-client', { 
          orderId, 
          expiresAt,
          timestamp: new Date().toISOString()
        }, { success: true });
      } catch (error) {
        console.error('Error logging timer expiration:', error);
      }
      
      // Update UI to reflect expired state
      onTimerExpire();
    };

    logExpiration();
  }, [orderId, isExpired, onTimerExpire, expiresAt]);
};

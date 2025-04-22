
import { useEffect } from 'react';
import { logApiCall } from '@/services/loggerService';

/**
 * This hook handles expired assignment checks.
 * It relies on the server-side cron job for expiration handling
 * and just updates the UI when expiration occurs.
 */
export const useExpiredAssignments = (
  orderId: string | undefined,
  expiresAt: string | undefined,
  isExpired: boolean,
  onTimerExpire?: () => void
) => {
  // When timer expires in UI, we trigger a refresh but let server handle the DB work
  useEffect(() => {
    if (!orderId || !isExpired || !onTimerExpire) return;

    // Log expired timer state for debugging only
    const logExpiration = async () => {
      try {
        await logApiCall('timer-expired-client', { 
          orderId, 
          expiresAt,
          timestamp: new Date().toISOString(),
          message: 'Client UI timer expired - triggering refresh only'
        }, { success: true });
      } catch (error) {
        console.error('Error logging timer expiration:', error);
      }
      
      // Update UI to reflect expired state, but don't change DB state
      console.log('UI timer expired, refreshing to get the latest server state');
      onTimerExpire();
    };

    logExpiration();
  }, [orderId, isExpired, onTimerExpire, expiresAt]);
};

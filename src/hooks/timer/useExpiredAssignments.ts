
import { useEffect } from 'react';
import { logApiCall } from '@/services/loggerService';

/**
 * This hook handles UI updates when assignments expire.
 * It DOES NOT trigger any database updates - all expiration logic
 * is handled by the server-side cron job.
 */
export const useExpiredAssignments = (
  orderId: string | undefined,
  expiresAt: string | undefined,
  isExpired: boolean,
  onTimerExpire?: () => void
) => {
  // When timer expires in UI, just trigger a UI refresh
  useEffect(() => {
    if (!orderId || !isExpired || !onTimerExpire) return;

    // Just log the expiration and refresh the UI
    const refreshUiOnly = async () => {
      try {
        // Only log the expiration for debugging purposes
        await logApiCall('timer-expired-client', { 
          orderId, 
          expiresAt,
          timestamp: new Date().toISOString(),
          message: 'Client UI timer expired - UI refresh only, no DB changes'
        }, { success: true });
        
        console.log('UI timer expired, refreshing to get the latest server state');
        // Just refresh the UI without making any changes to the database
        onTimerExpire();
      } catch (error) {
        console.error('Error handling UI refresh on timer expiration:', error);
      }
    };

    refreshUiOnly();
  }, [orderId, isExpired, onTimerExpire, expiresAt]);
};

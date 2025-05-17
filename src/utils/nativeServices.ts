
import { Platform } from '@/utils/platform';
import { BadgeService } from '@/services/badge/badgeService';

export const nativeServices = {
  /**
   * Start the location tracking foreground service on Android
   */
  startLocationTrackingService: async (): Promise<boolean> => {
    if (!Platform.isNative() || !Platform.isAndroid()) {
      console.log('Foreground service only supported on Android');
      return false;
    }
    
    try {
      // Create a custom event to trigger the service
      // In a production app, you would use a Capacitor plugin
      const event = new CustomEvent('startLocationService');
      document.dispatchEvent(event);
      return true;
    } catch (error) {
      console.error('Error starting location tracking service:', error);
      return false;
    }
  },
  
  /**
   * Stop the location tracking foreground service on Android
   */
  stopLocationTrackingService: async (): Promise<boolean> => {
    if (!Platform.isNative() || !Platform.isAndroid()) {
      console.log('Foreground service only supported on Android');
      return false;
    }
    
    try {
      // Create a custom event to stop the service
      // In a production app, you would use a Capacitor plugin
      const event = new CustomEvent('stopLocationService');
      document.dispatchEvent(event);
      return true;
    } catch (error) {
      console.error('Error stopping location tracking service:', error);
      return false;
    }
  },
  
  /**
   * Set the application badge number
   */
  setBadgeCount: async (count: number): Promise<boolean> => {
    return BadgeService.setBadgeCount(count);
  },
  
  /**
   * Get the current badge count
   */
  getBadgeCount: async (): Promise<number> => {
    return BadgeService.getBadgeCount();
  },
  
  /**
   * Clear the application badge (set to 0)
   */
  clearBadgeCount: async (): Promise<boolean> => {
    return BadgeService.clearBadge();
  }
};


import { LocalNotifications } from '@capacitor/local-notifications';
import { Platform } from '@/utils/platform';
import { toast } from '@/components/ui/use-toast';

/**
 * Service to manage application badge numbers on iOS and Android
 */
export class BadgeService {
  private static currentBadgeCount = 0;
  
  /**
   * Set the application badge count
   * @param count Number to display on the app icon
   */
  static async setBadgeCount(count: number): Promise<boolean> {
    try {
      if (!Platform.isNative()) {
        console.log('Badge counts only supported on native platforms');
        return false;
      }
      
      // Ensure count is not negative
      const validCount = Math.max(0, count);
      
      // Using the badge count API, and fallback to our stored value
      try {
        // On native platforms, set the badge count
        if (Platform.isIOS()) {
          // On iOS, we can use the badge property of scheduleNotification
          await LocalNotifications.schedule({
            notifications: [{
              id: 1,
              title: 'Badge Update',
              body: 'Badge count updated',
              schedule: { at: new Date(Date.now() + 1000) },
              sound: null,
              smallIcon: 'ic_notification',
              badge: validCount
            }]
          });
        } else if (Platform.isAndroid()) {
          // On Android, handle badge through custom methods
          // This would typically be implemented in native code
          // For now, we'll just store the value
          console.log("Setting badge count on Android:", validCount);
        }
      } catch (error) {
        console.error("Native badge update error:", error);
      }
      
      this.currentBadgeCount = validCount;
      return true;
    } catch (error) {
      console.error('Error setting badge count:', error);
      return false;
    }
  }
  
  /**
   * Get the current badge count
   */
  static async getBadgeCount(): Promise<number> {
    try {
      if (!Platform.isNative()) {
        return 0;
      }
      
      // Since we can't directly get the badge count from Capacitor,
      // we'll return our stored value
      return this.currentBadgeCount;
    } catch (error) {
      console.error('Error getting badge count:', error);
      return this.currentBadgeCount;
    }
  }
  
  /**
   * Increment the badge count by the specified amount
   * @param increment Amount to increase badge by (default: 1)
   */
  static async incrementBadge(increment = 1): Promise<boolean> {
    const currentCount = await this.getBadgeCount();
    return this.setBadgeCount(currentCount + increment);
  }
  
  /**
   * Decrement the badge count by the specified amount
   * @param decrement Amount to decrease badge by (default: 1)
   */
  static async decrementBadge(decrement = 1): Promise<boolean> {
    const currentCount = await this.getBadgeCount();
    const newCount = Math.max(0, currentCount - decrement);
    return this.setBadgeCount(newCount);
  }
  
  /**
   * Clear the badge (set to 0)
   */
  static async clearBadge(): Promise<boolean> {
    return this.setBadgeCount(0);
  }
  
  /**
   * Request permission to use badges if needed
   * Note: On iOS this is part of notification permissions
   */
  static async requestPermission(): Promise<boolean> {
    try {
      if (!Platform.isNative()) {
        return false;
      }
      
      const result = await LocalNotifications.requestPermissions();
      const granted = result.display === 'granted';
      
      if (!granted) {
        toast({
          title: "Permission denied",
          description: "Badge notifications require permission to display",
          variant: "destructive"
        });
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting badge permissions:', error);
      return false;
    }
  }
}

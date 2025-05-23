
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import { Preferences } from '@capacitor/preferences';

export class LocationPermissionService {
  private static instance: LocationPermissionService;
  private initialized = false;
  private lastPermissionStatus: PermissionStatus | null = null;
  
  // Track when permissions were last checked
  private lastPermissionCheck = 0;
  
  // Constants
  private PERMISSION_CHECK_INTERVAL = 3600000; // 1 hour
  private PERMISSION_STATUS_KEY = 'location_permission_status';
  
  private constructor() {}
  
  public static getInstance(): LocationPermissionService {
    if (!LocationPermissionService.instance) {
      LocationPermissionService.instance = new LocationPermissionService();
    }
    return LocationPermissionService.instance;
  }
  
  /**
   * Initialize location permissions as recommended by Capacitor team
   */
  public async initialize(): Promise<PermissionStatus> {
    if (this.initialized) {
      return this.lastPermissionStatus || await this.checkPermissions();
    }
    
    try {
      console.log('Initializing location permissions service');
      
      // Check if we need to clear storage during development
      // Uncomment this during development if you encounter storage migration issues
      // await this.clearStorageIfNeeded();
      
      // Check current permissions
      const status = await this.checkPermissions();
      this.lastPermissionStatus = status;
      
      // Store last check time
      this.lastPermissionCheck = Date.now();
      this.initialized = true;
      
      return status;
    } catch (error) {
      console.error('Error initializing location permissions:', error);
      throw error;
    }
  }
  
  /**
   * Check current location permissions
   */
  public async checkPermissions(): Promise<PermissionStatus> {
    try {
      const status = await Geolocation.checkPermissions();
      
      // Cache the permission status
      await this.savePermissionStatus(status);
      this.lastPermissionStatus = status;
      
      return status;
    } catch (error) {
      console.error('Error checking location permissions:', error);
      
      // Try to get cached status if available
      const cachedStatus = await this.getCachedPermissionStatus();
      if (cachedStatus) {
        return cachedStatus;
      }
      
      // Default response if everything fails
      return { location: 'prompt', coarseLocation: 'prompt' };
    }
  }
  
  /**
   * Request location permissions
   */
  public async requestPermissions(): Promise<PermissionStatus> {
    try {
      console.log('Requesting location permissions');
      const status = await Geolocation.requestPermissions();
      
      // Update cached status
      await this.savePermissionStatus(status);
      this.lastPermissionStatus = status;
      
      return status;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      throw error;
    }
  }
  
  /**
   * Clear preferences storage if needed (during development)
   */
  private async clearStorageIfNeeded(): Promise<void> {
    const CLEAR_FLAG_KEY = 'storage_cleared_v1';
    
    try {
      const { value } = await Preferences.get({ key: CLEAR_FLAG_KEY });
      
      if (!value) {
        console.log('Clearing preferences storage for clean initialization');
        await Preferences.clear();
        
        // Set flag to indicate we've cleared storage for this version
        await Preferences.set({ key: CLEAR_FLAG_KEY, value: 'true' });
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
  
  /**
   * Save permission status to preferences
   */
  private async savePermissionStatus(status: PermissionStatus): Promise<void> {
    try {
      await Preferences.set({
        key: this.PERMISSION_STATUS_KEY,
        value: JSON.stringify({
          status,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error('Error saving permission status:', error);
    }
  }
  
  /**
   * Get cached permission status
   */
  private async getCachedPermissionStatus(): Promise<PermissionStatus | null> {
    try {
      const { value } = await Preferences.get({ key: this.PERMISSION_STATUS_KEY });
      
      if (value) {
        const data = JSON.parse(value);
        return data.status;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached permission status:', error);
      return null;
    }
  }
}

// Export singleton instance
export const locationPermissionService = LocationPermissionService.getInstance();

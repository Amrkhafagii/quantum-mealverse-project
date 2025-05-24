
import { registerPlugin } from '@capacitor/core';
import { Platform } from '@/utils/platform';

// Define the interface for our BackgroundGeolocation plugin
export interface BackgroundGeolocationPlugin {
  addWatcher(options: any, callback: any): Promise<any>;
  removeWatcher(options: { id: string }): Promise<void>;
  // Add the methods we need for type checking, even if they're not fully implemented yet
  checkPermissions?: () => Promise<{ backgroundLocation: PermissionState }>;
  requestPermissions?: () => Promise<{ backgroundLocation: PermissionState }>;
}

// Web fallback implementation
class BackgroundGeolocationWeb implements BackgroundGeolocationPlugin {
  private watchers = new Map<string, number>();

  async addWatcher(options: any, callback: any): Promise<any> {
    console.log('BackgroundGeolocation.addWatcher called on web - using fallback implementation');
    
    // Use standard Geolocation API for web
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported on this browser');
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        callback(null, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp
        });
      },
      (error) => {
        callback(error, null);
      },
      {
        enableHighAccuracy: true,
        timeout: options.timeout || 10000,
        maximumAge: options.maximumAge || 300000
      }
    );

    const id = `web-watcher-${Date.now()}`;
    this.watchers.set(id, watchId);
    
    return Promise.resolve({ id });
  }

  async removeWatcher(options: { id: string }): Promise<void> {
    console.log('BackgroundGeolocation.removeWatcher called on web - using fallback implementation');
    
    const watchId = this.watchers.get(options.id);
    if (watchId !== undefined) {
      navigator.geolocation.clearWatch(watchId);
      this.watchers.delete(options.id);
    }
    
    return Promise.resolve();
  }
}

// Register the BackgroundGeolocation plugin with web fallback
export const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>(
  'BackgroundGeolocation',
  {
    web: new BackgroundGeolocationWeb()
  }
);

// Define the background geolocation configuration
export interface BackgroundGeolocationOptions {
  backgroundMessage?: string;
  backgroundTitle?: string;
  requestPermissions?: boolean;
  stale?: boolean;
  distanceFilter?: number;
  timeout?: number;
  maximumAge?: number;
  // Add iOS and Android specific configuration options
  ios?: {
    significantChangesOnly?: boolean;
    activityType?: 'other' | 'automotiveNavigation' | 'fitness' | 'otherNavigation';
    desiredAccuracy?: 'best' | 'bestForNavigation' | 'nearestTenMeters' | 'hundredMeters' | 'kilometer' | 'threeKilometers';
    pauseLocationUpdatesAutomatically?: boolean;
    distanceFilter?: number;
  };
  android?: {
    locationUpdateInterval?: number;
    distanceFilter?: number;
    stationaryRadius?: number;
    notificationIconColor?: string;
    notification?: {
      title?: string;
      text?: string;
      priority?: number;
    };
  };
}

// Create a function to get background watcher options
export function getBackgroundWatcherOptions(options: BackgroundGeolocationOptions = {}) {
  const baseOptions = {
    backgroundMessage: options.backgroundMessage || "Quantum Mealverse is tracking your location for delivery",
    backgroundTitle: options.backgroundTitle || "Location Tracking Active",
    requestPermissions: options.requestPermissions !== false,
    stale: options.stale || false,
    distanceFilter: options.distanceFilter || 10,
    timeout: options.timeout || 10000,
    maximumAge: options.maximumAge || 300000,
  };

  // Only add platform-specific options on native platforms
  if (Platform.isNative()) {
    return {
      ...baseOptions,
      ios: options.ios || {},
      android: options.android || {},
    };
  }

  return baseOptions;
}

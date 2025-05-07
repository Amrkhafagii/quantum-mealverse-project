
import { registerPlugin } from '@capacitor/core';

// Define the interface for our BackgroundGeolocation plugin
export interface BackgroundGeolocationPlugin {
  addWatcher(options: any, callback: any): Promise<any>;
  removeWatcher(options: { id: string }): Promise<void>;
  // Add the methods we need for type checking, even if they're not fully implemented yet
  checkPermissions?: () => Promise<{ backgroundLocation: PermissionState }>;
  requestPermissions?: () => Promise<{ backgroundLocation: PermissionState }>;
}

// Register the BackgroundGeolocation plugin
export const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

// Define the background geolocation configuration
export interface BackgroundGeolocationOptions {
  backgroundMessage?: string;
  backgroundTitle?: string;
  requestPermissions?: boolean;
  stale?: boolean;
  distanceFilter?: number;
}

// Define the watcher result interface
export interface WatcherResult {
  id: string;
}

// Create a function to get background watcher options
export function getBackgroundWatcherOptions(options: BackgroundGeolocationOptions = {}) {
  return {
    backgroundMessage: options.backgroundMessage || "Quantum Mealverse is tracking your location for delivery",
    backgroundTitle: options.backgroundTitle || "Location Tracking Active",
    requestPermissions: options.requestPermissions !== false,
    stale: options.stale || false,
    distanceFilter: options.distanceFilter || 10,
  };
}

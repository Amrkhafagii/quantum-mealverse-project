
import { registerPlugin } from '@capacitor/core';
import { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';

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

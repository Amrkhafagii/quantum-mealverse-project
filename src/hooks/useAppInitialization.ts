
import { useState, useEffect } from 'react';
import { locationService } from '@/services/location/LocationService';
import { locationPermissionService } from '@/services/permission/LocationPermissionService';
import { Preferences } from '@capacitor/preferences';

interface InitializationState {
  isInitializing: boolean;
  isInitialized: boolean;
  locationPermissionStatus: string;
  error: Error | null;
}

/**
 * Hook to handle app initialization tasks
 */
export function useAppInitialization() {
  const [state, setState] = useState<InitializationState>({
    isInitializing: true,
    isInitialized: false,
    locationPermissionStatus: 'unknown',
    error: null
  });
  
  // Run initialization logic
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Starting app initialization');
        setState(prev => ({ ...prev, isInitializing: true }));
        
        // Check if we need to clear storage (for development/testing)
        // Uncomment during development if you're having migration issues
        // await clearStorageIfNeeded();
        
        // Initialize location permissions
        const permissionStatus = await locationPermissionService.initialize();
        console.log('Location permission status:', permissionStatus.location);
        
        // Initialize location service
        await locationService.initialize();
        
        // Set initialization complete
        setState({
          isInitializing: false,
          isInitialized: true,
          locationPermissionStatus: permissionStatus.location,
          error: null
        });
        
        console.log('App initialization complete');
      } catch (error) {
        console.error('Error during app initialization:', error);
        setState({
          isInitializing: false,
          isInitialized: false,
          locationPermissionStatus: 'error',
          error: error instanceof Error ? error : new Error('Unknown initialization error')
        });
      }
    };
    
    initializeApp();
  }, []);
  
  /**
   * Helper to clear storage if needed (for development)
   */
  const clearStorageIfNeeded = async () => {
    const DEV_MODE = import.meta.env.DEV;
    const STORAGE_VERSION_KEY = 'storage_version';
    const CURRENT_VERSION = '1.0.0';
    
    if (!DEV_MODE) return; // Only clear in development
    
    try {
      const { value } = await Preferences.get({ key: STORAGE_VERSION_KEY });
      
      // If version mismatch or no version, clear storage
      if (!value || value !== CURRENT_VERSION) {
        console.log('Storage version mismatch, clearing...');
        await Preferences.clear();
        await Preferences.set({ key: STORAGE_VERSION_KEY, value: CURRENT_VERSION });
        console.log('Storage cleared and reset to version', CURRENT_VERSION);
      }
    } catch (error) {
      console.error('Error checking storage version:', error);
    }
  };
  
  return state;
}

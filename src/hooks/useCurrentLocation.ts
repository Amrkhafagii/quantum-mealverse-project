
import { useState, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { createDeliveryLocation } from '@/utils/locationConverters';
import { DeliveryLocation } from '@/types/location';
import { Platform } from '@/utils/platform';
import { toast } from 'sonner';
import { securelyStoreLocation, getSecurelyStoredLocation } from '@/utils/locationUtils';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { UnifiedLocation, DeviceInfo, NetworkType, LocationSource } from '@/types/unifiedLocation';

export function useCurrentLocation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<DeliveryLocation | null>(null);
  const [locationSource, setLocationSource] = useState<LocationSource>('gps');

  // Get device info for enhanced location context
  const getDeviceInfo = async (): Promise<DeviceInfo> => {
    try {
      const info = await Device.getInfo();
      const platform = info.platform === 'ios' || info.platform === 'android' 
        ? info.platform 
        : 'web';
        
      return {
        platform,
        model: info.model,
        osVersion: info.osVersion,
        // Using optional chaining to handle potential missing property
        appVersion: info.appVersion
      };
    } catch (err) {
      console.warn('Could not get device info:', err);
      return { platform: 'web' };
    }
  };

  // Get network information
  const getNetworkInfo = async (): Promise<{ type: NetworkType }> => {
    try {
      const status = await Network.getStatus();
      let networkType: NetworkType = 'unknown';
      
      if (!status.connected) {
        networkType = 'none';
      } else if (status.connectionType === 'wifi') {
        networkType = 'wifi';
      } else if (status.connectionType === 'cellular') {
        // In a real app, you might want to detect the cellular generation
        networkType = 'cellular_4g';
      }
      
      return { type: networkType };
    } catch (err) {
      console.warn('Could not get network info:', err);
      return { type: 'unknown' };
    }
  };

  const getCurrentLocation = useCallback(async (): Promise<DeliveryLocation | null> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('useCurrentLocation: Getting current location');
      
      // Try to get device and network info for enhanced context
      const [deviceInfo, networkInfo] = await Promise.all([
        getDeviceInfo(),
        getNetworkInfo()
      ]);
      
      // Special handling for web environment - use browser API directly
      if (Platform.isWeb()) {
        console.log('useCurrentLocation: Using browser geolocation API');
        return new Promise<DeliveryLocation | null>((resolve) => {
          if (!navigator.geolocation) {
            const errorMsg = 'Geolocation is not supported by this browser';
            console.error(errorMsg);
            setError(errorMsg);
            setIsLoading(false);
            toast.error('Geolocation not supported');
            resolve(null);
            return;
          }
          
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              console.log('useCurrentLocation: Browser geolocation successful');
              // Determine source based on accuracy
              let source: LocationSource = 'gps';
              if (position.coords.accuracy > 100) {
                source = 'wifi';
              } else if (position.coords.accuracy > 1000) {
                source = 'cell_tower';
              }
              
              setLocationSource(source);
              
              const locationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                timestamp: position.timestamp || Date.now(),
                accuracy: position.coords.accuracy,
                speed: position.coords.speed || 0,
                isMoving: (position.coords.speed || 0) > 0.5,
                source: source
              };
              
              console.log('useCurrentLocation: Location data:', locationData);
              
              // Store location data securely when available
              try {
                await securelyStoreLocation(locationData);
              } catch (e) {
                console.warn('Could not store location securely, falling back to standard storage', e);
              }
              
              setLastLocation(locationData);
              setIsLoading(false);
              resolve(locationData);
            },
            (err) => {
              console.error('Browser geolocation error:', err);
              
              let errorMessage = 'An unknown error occurred.';
              if (err.code === 1) {
                errorMessage = 'Permission denied. Please enable location in your browser settings.';
              } else if (err.code === 2) {
                errorMessage = 'Location information is unavailable.';
              } else if (err.code === 3) {
                errorMessage = 'The request to get user location timed out.';
              }
              
              setError(errorMessage);
              toast.error('Location error', { description: errorMessage });
              setIsLoading(false);
              resolve(null);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        });
      }
      
      // Standard Capacitor implementation for native platforms with enhanced options
      console.log('useCurrentLocation: Using Capacitor Geolocation with hybrid positioning');
      
      // Use options to get the most accurate result on native platforms
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };
      
      // Android has additional options for the Fused Location Provider
      if (Platform.isAndroid()) {
        Object.assign(options, {
          // These would be used by a native implementation of the Fused Location Provider
          androidFusedLocation: true,
          forceRequestLocation: true,
        });
      }
      
      const position = await Geolocation.getCurrentPosition(options);
      console.log('useCurrentLocation: Capacitor geolocation successful', position);
      
      // Extract source from extras if available (set by our enhanced native implementation)
      let source: LocationSource = 'gps';
      
      // Safely access position.extras with a type guard
      const positionWithExtras = position as any; // Use 'any' for accessing possible extras
      if (positionWithExtras.extras && typeof positionWithExtras.extras === 'object') {
        if (positionWithExtras.extras.source && 
            typeof positionWithExtras.extras.source === 'string') {
          source = positionWithExtras.extras.source as LocationSource;
        }
      }
      
      // Fallback: Determine source based on accuracy if not provided by native code
      if (!source) {
        if (position.coords.accuracy > 100) {
          source = 'wifi';
        } else if (position.coords.accuracy > 1000) {
          source = 'cell_tower';
        } else {
          source = 'gps';
        }
      }
      
      setLocationSource(source);
      
      const locationData = {
        ...createDeliveryLocation(position),
        source
      };
      
      // Create enhanced location object with device and network context
      const unifiedLocation: UnifiedLocation = {
        id: crypto.randomUUID(),
        location_type: 'user',
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        speed: locationData.speed,
        timestamp: new Date().toISOString(),
        device_info: deviceInfo,
        source: source,
        is_moving: locationData.isMoving,
        network_type: networkInfo.type,
        user_consent: true,
      };
      
      // Store in memory state
      setLastLocation(locationData);
      setIsLoading(false);
      
      // Try to store securely
      try {
        await securelyStoreLocation(locationData);
      } catch (e) {
        console.warn('Could not store location securely', e);
      }
      
      return locationData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      console.error('Error getting current location', err);
      setError(errorMessage);
      toast.error('Location error', { description: errorMessage });
      setIsLoading(false);
      return null;
    }
  }, []);

  return {
    getCurrentLocation,
    isLoadingLocation: isLoading,
    locationError: error,
    lastLocation,
    locationSource
  };
}

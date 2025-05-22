
import { Geolocation } from '@capacitor/geolocation';
import { DeliveryLocation } from '@/types/location';
import { Platform } from '@/utils/platform';
import { createDeliveryLocation } from '@/utils/locationConverters';
import { LocationSource } from '@/types/unifiedLocation';
import { securelyStoreLocation } from './locationUtils';

/**
 * Get location using Capacitor's Geolocation plugin
 */
export const getCapacitorLocation = async (): Promise<DeliveryLocation | null> => {
  try {
    console.log('Using Capacitor Geolocation with hybrid positioning');
    
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
    console.log('Capacitor geolocation successful', position);
    
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
    
    const locationData: DeliveryLocation = {
      ...createDeliveryLocation(position),
      source
    };
    
    // Try to store securely
    try {
      await securelyStoreLocation(locationData);
    } catch (e) {
      console.warn('Could not store location securely', e);
    }
    
    return locationData;
  } catch (err) {
    console.error('Error getting Capacitor location', err);
    return null;
  }
};


import { Position } from '@capacitor/geolocation';
import { DeliveryLocation } from '@/types/location';

// Function to convert Position to our DeliveryLocation type
export function createDeliveryLocation(position: Position): DeliveryLocation {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    timestamp: position.timestamp,
  };
}


import { useState, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { createDeliveryLocation } from '@/utils/locationConverters';
import { DeliveryLocation } from '@/types/location';

interface ForegroundTrackingOptions {
  onLocationUpdate?: (location: DeliveryLocation) => void;
}

export function useForegroundLocationTracking({ onLocationUpdate }: ForegroundTrackingOptions = {}) {
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<string | number | null>(null);

  const startForegroundTracking = useCallback(async () => {
    try {
      // Different implementation based on platform
      if (Capacitor.isNativePlatform()) {
        const watchId = await Geolocation.watchPosition(
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 3000,
          },
          (position) => {
            if (!position) return;
            
            const locationData = createDeliveryLocation(position);
            if (onLocationUpdate) {
              onLocationUpdate(locationData);
            }
          }
        );
        
        setWatchId(watchId);
      } else {
        // Fallback for web: use regular geolocation via the web API
        if ('geolocation' in navigator) {
          const webWatchId = navigator.geolocation.watchPosition(
            (position) => {
              const locationData: DeliveryLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp,
              };
              
              if (onLocationUpdate) {
                onLocationUpdate(locationData);
              }
            },
            (err) => {
              console.error('Error watching position', err);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 3000,
            }
          );
          
          setWatchId(webWatchId);
        }
      }
      
      setIsTracking(true);
      return true;
    } catch (err) {
      console.error('Error starting location tracking', err);
      return false;
    }
  }, [onLocationUpdate]);

  const stopForegroundTracking = useCallback(async () => {
    if (watchId === null) return true;
    
    try {
      if (Capacitor.isNativePlatform()) {
        await Geolocation.clearWatch({ id: watchId as string });
      } else if (typeof watchId === 'number') {
        navigator.geolocation.clearWatch(watchId);
      }
      
      setWatchId(null);
      setIsTracking(false);
      return true;
    } catch (err) {
      console.error('Error stopping location tracking', err);
      return false;
    }
  }, [watchId]);

  return {
    isForegroundTracking: isTracking,
    startForegroundTracking,
    stopForegroundTracking
  };
}

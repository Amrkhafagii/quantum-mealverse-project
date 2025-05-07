
import { useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { BackgroundGeolocation, getBackgroundWatcherOptions } from '@/utils/backgroundGeolocation';
import { DeliveryLocation } from '@/types/location';
import { toast } from '@/components/ui/use-toast';

interface BackgroundTrackingOptions {
  onLocationUpdate?: (location: DeliveryLocation) => void;
}

// Define the watcher return type to match what the plugin actually returns
interface WatcherResult {
  id: string;
}

export function useBackgroundLocationTracking({ onLocationUpdate }: BackgroundTrackingOptions = {}) {
  const [isTracking, setIsTracking] = useState(false);
  const [watcherId, setWatcherId] = useState<string | null>(null);

  const startBackgroundTracking = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.warn("Background tracking is only supported on native platforms");
      return false;
    }

    try {
      // Use background geolocation for more efficient background tracking
      const watcher = await BackgroundGeolocation.addWatcher(
        getBackgroundWatcherOptions(),
        (position, err) => {
          if (err) {
            console.error(err);
            return;
          }
          
          if (position) {
            const locationData: DeliveryLocation = {
              latitude: position.latitude,
              longitude: position.longitude,
              accuracy: position.accuracy,
              timestamp: Date.now(),
            };
            
            if (onLocationUpdate) {
              onLocationUpdate(locationData);
            }
          }
        }
      );
      
      // The plugin actually returns an object with an id property
      // Handle it correctly based on the actual return type
      if (typeof watcher === 'string') {
        setWatcherId(watcher);
      } else if (watcher && typeof watcher === 'object' && 'id' in watcher) {
        setWatcherId((watcher as WatcherResult).id);
      } else {
        console.error('Unexpected return type from addWatcher:', watcher);
        return false;
      }
      
      setIsTracking(true);
      return true;
    } catch (err) {
      console.error('Error starting background location tracking', err);
      toast({
        title: "Location tracking failed",
        description: "Could not start background tracking. Please check your settings.",
        variant: "destructive"
      });
      return false;
    }
  }, [onLocationUpdate]);

  const stopBackgroundTracking = useCallback(async () => {
    if (!watcherId) return true;

    try {
      await BackgroundGeolocation.removeWatcher({
        id: watcherId
      });
      setWatcherId(null);
      setIsTracking(false);
      return true;
    } catch (err) {
      console.error('Error stopping background location tracking', err);
      return false;
    }
  }, [watcherId]);

  return {
    isBackgroundTracking: isTracking,
    startBackgroundTracking,
    stopBackgroundTracking
  };
}

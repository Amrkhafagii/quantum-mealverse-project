
import React, { useState, useEffect, useCallback } from 'react';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { useAdaptiveAccuracy } from '@/hooks/useAdaptiveAccuracy';
import { LocationConfidenceIndicator } from './LocationConfidenceIndicator';
import { DeliveryLocation } from '@/types/location';
import { UnifiedLocation, LocationSource } from '@/types/unifiedLocation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Map, Activity, Battery } from 'lucide-react';
import { toast } from 'sonner';

interface AdaptiveLocationTrackerProps {
  activityContext?: 'stationary' | 'walking' | 'driving' | 'unknown';
  onLocationUpdate?: (location: DeliveryLocation) => void;
}

export function AdaptiveLocationTracker({ 
  activityContext = 'unknown',
  onLocationUpdate 
}: AdaptiveLocationTrackerProps) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [locationHistory, setLocationHistory] = useState<UnifiedLocation[]>([]);
  
  // Use our hooks
  const { getCurrentLocation, isLoadingLocation, locationError, lastLocation } = useCurrentLocation();
  
  const { 
    accuracySettings,
    batteryLevel,
    isLowBattery,
    networkType,
    isNetworkAvailable
  } = useAdaptiveAccuracy({
    activityContext,
    batteryThreshold: 20,
    networkRequired: false
  });
  
  // Convert DeliveryLocation to UnifiedLocation for our confidence indicator
  const createUnifiedLocation = (location: DeliveryLocation): UnifiedLocation => {
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy || undefined,
      speed: location.speed || undefined,
      timestamp: new Date().toISOString(),
      deviceInfo: { platform: 'web' },
      source: (location.source as LocationSource) || 'manual',
      isMoving: location.isMoving,
      network_type: networkType as any
    };
  };

  // Update location with adaptive settings
  const updateLocation = useCallback(async () => {
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
        const browserLocation = await getBrowserLocation();
        if (browserLocation) {
          setLocationSource(browserLocation.source || 'gps');
          setLastLocation(browserLocation);
          setIsLoading(false);
          return browserLocation;
        }
        
        setIsLoading(false);
        return null;
      }
      
      // Use Capacitor implementation for native platforms
      const capacitorLocation = await getCapacitorLocation();
      if (capacitorLocation) {
        setLocationSource(capacitorLocation.source || 'gps');
        setLastLocation(capacitorLocation);
        setIsLoading(false);
        return capacitorLocation;
      }
      
      const errorMessage = 'Failed to get location from any source';
      setError(errorMessage);
      toast.error('Location error', { description: errorMessage });
      setIsLoading(false);
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      console.error('Error getting current location', err);
      setError(errorMessage);
      toast.error('Location error', { description: errorMessage });
      setIsLoading(false);
      return null;
    }
  }, []);

  // Update location with adaptive settings
  const updateLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('useCurrentLocation: Getting current location');
      
      const location = await getCurrentLocation();
      
      if (location) {
        setLastUpdated(new Date());
        
        if (onLocationUpdate) {
          onLocationUpdate(location);
        }
        
        // Add to history for confidence analysis
        const unifiedLocation = createUnifiedLocation(location);
        setLocationHistory(prev => [unifiedLocation, ...prev].slice(0, 10));
      }
    } catch (err) {
      console.error('Error updating location', err);
      toast.error('Failed to update location', {
        description: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }, [getCurrentLocation, networkType, onLocationUpdate]);
  
  // Show settings adjustments
  useEffect(() => {
    console.log('Adaptive accuracy settings updated:', accuracySettings);
  }, [accuracySettings]);
  
  // Initial location fetch
  useEffect(() => {
    updateLocation();
    
    // Set up interval based on the adaptive settings
    const intervalId = setInterval(() => {
      updateLocation();
    }, accuracySettings.updateInterval || 30000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [accuracySettings.updateInterval, updateLocation]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Location Tracker
          </CardTitle>
          
          {lastLocation && locationHistory[0] && (
            <LocationConfidenceIndicator location={locationHistory[0]} />
          )}
        </div>
        <CardDescription>
          Adaptive tracking based on context
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {activityContext}
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1">
              <Battery className="h-3 w-3" />
              {batteryLevel !== null ? `${batteryLevel}%` : 'Unknown'}
            </Badge>
            
            <Badge 
              variant="outline" 
              className={isNetworkAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
            >
              {networkType}
            </Badge>
          </div>
          
          {lastLocation ? (
            <>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Latitude</div>
                <div>{lastLocation.latitude.toFixed(6)}</div>
                
                <div className="font-medium">Longitude</div>
                <div>{lastLocation.longitude.toFixed(6)}</div>
                
                <div className="font-medium">Accuracy</div>
                <div>{lastLocation.accuracy ? `${lastLocation.accuracy.toFixed(1)}m` : 'Unknown'}</div>
                
                <div className="font-medium">Source</div>
                <div>{lastLocation.source || 'Unknown'}</div>
                
                <div className="font-medium">Last Updated</div>
                <div>{lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}</div>
              </div>
              
              {locationHistory[0] && (
                <div className="mt-4">
                  <LocationConfidenceIndicator 
                    location={locationHistory[0]} 
                    showDetails={true}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              {isLoadingLocation ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p>Getting location...</p>
                </div>
              ) : (
                <p>{locationError || 'No location data available'}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <div className="w-full flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Update interval: {Math.round((accuracySettings.updateInterval || 30000) / 1000)}s
          </div>
          <Button 
            onClick={updateLocation} 
            disabled={isLoadingLocation}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            {isLoadingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Update Now
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

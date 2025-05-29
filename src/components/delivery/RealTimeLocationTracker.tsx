
import React, { useEffect, useState } from 'react';
import { useRealTimeLocationSharing } from '@/hooks/useRealTimeLocationSharing';
import { useAuth } from '@/hooks/useAuth';
import { useDeliveryUser } from '@/hooks/useDeliveryUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Battery, Wifi, Navigation, Play, Square } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface RealTimeLocationTrackerProps {
  deliveryAssignmentId: string;
  orderId?: string;
  className?: string;
}

export const RealTimeLocationTracker: React.FC<RealTimeLocationTrackerProps> = ({
  deliveryAssignmentId,
  orderId,
  className = ''
}) => {
  const { user } = useAuth();
  const { deliveryUser } = useDeliveryUser(user?.id);
  const [watchId, setWatchId] = useState<number | null>(null);

  const {
    latestLocation,
    currentETA,
    isLocationSharingEnabled,
    privacyLevel,
    isTracking,
    error,
    startLocationTracking,
    stopLocationTracking,
    updateLocationSharingSettings
  } = useRealTimeLocationSharing({
    deliveryAssignmentId,
    orderId,
    enableAutoTracking: true,
    trackingInterval: 10000 // 10 seconds
  });

  // Handle start tracking
  const handleStartTracking = async () => {
    if (!deliveryUser?.id) {
      toast({
        title: "Error",
        description: "Delivery user not found",
        variant: "destructive"
      });
      return;
    }

    try {
      const cleanup = await startLocationTracking(deliveryUser.id);
      if (cleanup) {
        // Store cleanup function reference (simplified for this implementation)
        toast({
          title: "Location Tracking Started",
          description: "Real-time location sharing is now active",
        });
      }
    } catch (err) {
      toast({
        title: "Failed to Start Tracking",
        description: err instanceof Error ? err.message : "Could not start location tracking",
        variant: "destructive"
      });
    }
  };

  // Handle stop tracking
  const handleStopTracking = () => {
    stopLocationTracking();
    toast({
      title: "Location Tracking Stopped",
      description: "Real-time location sharing has been disabled",
    });
  };

  // Handle privacy level change
  const handlePrivacyChange = async (newLevel: 'precise' | 'approximate' | 'disabled') => {
    const success = await updateLocationSharingSettings({
      privacy_level: newLevel,
      is_location_sharing_enabled: newLevel !== 'disabled'
    });

    if (success) {
      toast({
        title: "Privacy Settings Updated",
        description: `Location sharing set to ${newLevel}`,
      });
    } else {
      toast({
        title: "Update Failed",
        description: "Could not update privacy settings",
        variant: "destructive"
      });
    }
  };

  // Format location accuracy
  const formatAccuracy = (accuracy?: number) => {
    if (!accuracy) return 'Unknown';
    if (accuracy < 10) return 'High';
    if (accuracy < 50) return 'Medium';
    return 'Low';
  };

  // Format time ago
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ago`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Real-Time Location Tracking
          </span>
          <div className="flex items-center gap-2">
            {isTracking && (
              <Badge variant="outline" className="bg-green-500/20 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                Live
              </Badge>
            )}
            {privacyLevel !== 'disabled' && (
              <Badge variant="outline">
                {privacyLevel === 'precise' ? 'Precise' : 'Approximate'}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Location Sharing Controls */}
        {deliveryUser && (
          <div className="flex items-center gap-2">
            <Button
              onClick={isTracking ? handleStopTracking : handleStartTracking}
              variant={isTracking ? "destructive" : "default"}
              size="sm"
              className="flex items-center gap-2"
            >
              {isTracking ? (
                <>
                  <Square className="h-4 w-4" />
                  Stop Tracking
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Tracking
                </>
              )}
            </Button>

            <select
              value={privacyLevel}
              onChange={(e) => handlePrivacyChange(e.target.value as any)}
              className="px-3 py-1 bg-background border border-border rounded text-sm"
            >
              <option value="precise">Precise Location</option>
              <option value="approximate">Approximate Location</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        )}

        {/* Current Location Info */}
        {latestLocation && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Coordinates:</span>
                <div className="font-mono">
                  {latestLocation.latitude.toFixed(6)}, {latestLocation.longitude.toFixed(6)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Accuracy:</span>
                <div className="flex items-center gap-1">
                  <span>{formatAccuracy(latestLocation.accuracy)}</span>
                  {latestLocation.accuracy && (
                    <span className="text-xs text-muted-foreground">
                      (±{Math.round(latestLocation.accuracy)}m)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              {latestLocation.speed !== null && latestLocation.speed !== undefined && (
                <div className="flex items-center gap-1">
                  <Navigation className="h-3 w-3" />
                  <span>{Math.round(latestLocation.speed * 3.6)} km/h</span>
                </div>
              )}
              
              {latestLocation.battery_level && (
                <div className="flex items-center gap-1">
                  <Battery className="h-3 w-3" />
                  <span>{latestLocation.battery_level}%</span>
                </div>
              )}
              
              {latestLocation.network_type && (
                <div className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  <span className="capitalize">{latestLocation.network_type}</span>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              Last updated: {formatTimeAgo(latestLocation.timestamp)}
            </div>
          </div>
        )}

        {/* ETA Information */}
        {currentETA && (
          <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-blue-400">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Estimated Arrival</span>
            </div>
            <div className="mt-1">
              <div className="text-lg font-bold text-blue-300">
                {currentETA.eta_minutes} minutes
              </div>
              <div className="text-sm text-blue-400">
                {new Date(currentETA.estimated_arrival).toLocaleTimeString()}
              </div>
              {currentETA.distance_km > 0 && (
                <div className="text-xs text-blue-400">
                  Distance: {currentETA.distance_km.toFixed(1)} km
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status when not tracking */}
        {!isTracking && !latestLocation && isLocationSharingEnabled && (
          <div className="text-center py-4 text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Location tracking is not active</p>
            {deliveryUser && (
              <p className="text-sm mt-1">Click "Start Tracking" to begin sharing location</p>
            )}
          </div>
        )}

        {/* Privacy disabled state */}
        {privacyLevel === 'disabled' && (
          <div className="text-center py-4 text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Location sharing is disabled</p>
            <p className="text-sm mt-1">Enable location sharing to track delivery progress</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

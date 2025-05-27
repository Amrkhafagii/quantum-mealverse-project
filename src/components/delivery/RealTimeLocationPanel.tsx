
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRealTimeLocationTracking } from '@/hooks/useRealTimeLocationTracking';
import { MapPin, Battery, Radio, Zap } from 'lucide-react';

interface RealTimeLocationPanelProps {
  assignmentId?: string;
}

export const RealTimeLocationPanel: React.FC<RealTimeLocationPanelProps> = ({ assignmentId }) => {
  const {
    isTracking,
    batteryLevel,
    lastLocation,
    activeGeofences,
    error,
    startTracking,
    stopTracking,
    isLocationServiceActive
  } = useRealTimeLocationTracking(assignmentId);

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-500';
    if (level > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTrackingModeText = () => {
    if (batteryLevel > 50) return 'High Accuracy';
    if (batteryLevel > 20) return 'Medium Accuracy';
    return 'Battery Saving';
  };

  return (
    <Card className="holographic-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-quantum-cyan" />
          Real-Time Location Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span className="text-sm">
              {isTracking ? 'Active' : 'Inactive'}
            </span>
          </div>
          <Badge variant={isTracking ? 'default' : 'secondary'}>
            {getTrackingModeText()}
          </Badge>
        </div>

        {/* Battery Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Battery className={`h-4 w-4 ${getBatteryColor(batteryLevel)}`} />
            <span className="text-sm">Battery Level</span>
          </div>
          <span className={`text-sm font-medium ${getBatteryColor(batteryLevel)}`}>
            {batteryLevel}%
          </span>
        </div>

        {/* Active Geofences */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-quantum-cyan" />
            <span className="text-sm">Active Zones</span>
          </div>
          <Badge variant="outline">
            {activeGeofences}
          </Badge>
        </div>

        {/* Last Location */}
        {lastLocation && (
          <div className="p-3 bg-quantum-darkBlue/30 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Last Location</div>
            <div className="text-sm">
              {lastLocation.coords.latitude.toFixed(6)}, {lastLocation.coords.longitude.toFixed(6)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Accuracy: {lastLocation.coords.accuracy?.toFixed(0)}m
              {lastLocation.coords.speed && (
                <span className="ml-2">
                  Speed: {(lastLocation.coords.speed * 3.6).toFixed(1)} km/h
                </span>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="text-red-400 text-sm">{error}</div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!isTracking ? (
            <Button 
              onClick={startTracking}
              className="flex-1 bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
              disabled={!assignmentId}
            >
              <Zap className="h-4 w-4 mr-2" />
              Start Tracking
            </Button>
          ) : (
            <Button 
              onClick={stopTracking}
              variant="outline"
              className="flex-1"
            >
              Stop Tracking
            </Button>
          )}
        </div>

        {/* Info Text */}
        <div className="text-xs text-gray-400">
          Battery-optimized tracking adjusts frequency based on device battery level and movement speed.
          {!assignmentId && (
            <div className="mt-1 text-yellow-400">
              Assignment ID required to start tracking.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

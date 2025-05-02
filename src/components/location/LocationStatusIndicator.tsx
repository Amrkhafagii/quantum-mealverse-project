
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLocationPermission } from '@/hooks/useLocationPermission';

interface LocationStatusIndicatorProps {
  showButton?: boolean;
  colorVariant?: 'default' | 'navbar';
}

const LocationStatusIndicator: React.FC<LocationStatusIndicatorProps> = ({ 
  showButton = false,
  colorVariant = 'default'
}) => {
  const { 
    permissionStatus, 
    trackingEnabled, 
    isTracking,
    location,
    requestPermission,
    toggleTracking
  } = useLocationPermission();

  // Generate status text based on current state
  const getStatusText = () => {
    if (!trackingEnabled) {
      return "Tracking disabled";
    }
    
    switch (permissionStatus) {
      case 'granted':
        return location ? "Location active" : "Waiting for location";
      case 'denied':
        return "Permission denied";
      case 'prompt':
        return "Permission needed";
      default:
        return "Unknown status";
    }
  };

  // Generate badge color based on status
  const getBadgeColor = () => {
    if (!trackingEnabled) return "bg-gray-500";
    
    switch (permissionStatus) {
      case 'granted':
        return "bg-green-500";
      case 'denied':
        return "bg-red-500";
      case 'prompt':
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  // Format location for display
  const formatLocation = () => {
    if (!location) return "No location data";
    
    // Access coordinates through coords property
    return `${location.coords.latitude.toFixed(5)}, ${location.coords.longitude.toFixed(5)}`;
  };

  // Format timestamp
  const formatTimestamp = () => {
    if (!location || !location.timestamp) return "Unknown";
    
    const timestamp = new Date(location.timestamp);
    return formatDistanceToNow(timestamp, { addSuffix: true });
  };

  // Handle enable/disable tracking
  const handleToggleTracking = async () => {
    await toggleTracking(!trackingEnabled);
  };

  // Request permission if not granted
  const handleRequestPermission = async () => {
    await requestPermission();
  };

  // Component for the badge alone
  const StatusBadge = () => (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1 px-3 py-1 ${getBadgeColor()} text-white`}
    >
      <MapPin className="h-3 w-3" />
      <span>{getStatusText()}</span>
    </Badge>
  );

  // Render just the badge if the button variant isn't requested
  if (!showButton) {
    return <StatusBadge />;
  }

  // Full popover version with button
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={
            colorVariant === 'navbar' 
              ? "h-9 w-9 p-0 rounded-md" 
              : "h-10 px-4 py-2"
          }
        >
          <MapPin 
            className={
              colorVariant === 'navbar'
                ? `h-5 w-5 ${trackingEnabled && permissionStatus === 'granted' ? 'text-green-500' : 'text-gray-400'}`
                : "h-4 w-4 mr-2"
            } 
          />
          {colorVariant !== 'navbar' && <span>Location</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Location Status</h4>
            <p className="text-sm text-muted-foreground">
              {permissionStatus === 'granted' && location
                ? `Your current location: ${location.coords.latitude.toFixed(5)}, ${location.coords.longitude.toFixed(5)}`
                : "Location information unavailable"
              }
            </p>
          </div>
          
          <div className="grid gap-2">
            <div className="grid grid-cols-2 items-center gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Tracking</span>
                <span className="text-xs">{trackingEnabled ? "Enabled" : "Disabled"}</span>
              </div>
              <Button 
                onClick={handleToggleTracking} 
                variant={trackingEnabled ? "destructive" : "default"} 
                size="sm"
              >
                {trackingEnabled ? "Disable" : "Enable"}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 items-center gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Permission</span>
                <span className="text-xs">{permissionStatus}</span>
              </div>
              {permissionStatus !== 'granted' && (
                <Button 
                  onClick={handleRequestPermission} 
                  variant="outline" 
                  size="sm"
                >
                  Request
                </Button>
              )}
            </div>
            
            {location && (
              <div className="grid grid-cols-2 items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Last updated</span>
                  <span className="text-xs">{formatTimestamp()}</span>
                </div>
                <StatusBadge />
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LocationStatusIndicator;

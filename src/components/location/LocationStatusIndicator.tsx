
import React, { useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface LocationStatusIndicatorProps {
  showTooltip?: boolean;
  showDropdown?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const LocationStatusIndicator: React.FC<LocationStatusIndicatorProps> = ({
  showTooltip = true,
  showDropdown = true,
  size = 'md'
}) => {
  const { 
    location, 
    permissionStatus, 
    isTracking,
    trackingEnabled,
    toggleTracking,
    requestPermission 
  } = useLocationPermission();
  
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };
  
  const getStatusColor = () => {
    if (permissionStatus === 'granted' && location && isTracking) {
      return 'text-green-400';
    } else if (permissionStatus === 'prompt') {
      return 'text-yellow-400';
    } else if (permissionStatus === 'denied') {
      return 'text-red-400';
    } else {
      return 'text-gray-400';
    }
  };
  
  const getStatusText = () => {
    if (permissionStatus === 'granted' && location && isTracking) {
      return 'Location active';
    } else if (permissionStatus === 'denied') {
      return 'Location denied';
    } else if (permissionStatus === 'prompt') {
      return 'Location permission needed';
    } else {
      return 'Location inactive';
    }
  };
  
  if (!showTooltip && !showDropdown) {
    return (
      <MapPin className={`${iconSizes[size]} ${getStatusColor()}`} />
    );
  }
  
  const icon = (
    <MapPin className={`${iconSizes[size]} ${getStatusColor()}`} />
  );
  
  if (!showDropdown) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {icon}
          </TooltipTrigger>
          <TooltipContent>
            <p>{getStatusText()}</p>
            {location && (
              <p className="text-xs opacity-70">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-2 h-auto w-auto">
          {icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <div className="flex items-center justify-between p-2">
          <div className="font-medium">Location Services</div>
          <div className={`text-xs ${getStatusColor()}`}>{getStatusText()}</div>
        </div>
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <div className="flex items-center space-x-2">
            <Switch 
              id="location-toggle" 
              checked={trackingEnabled}
              onCheckedChange={toggleTracking}
            />
            <Label htmlFor="location-toggle">Enable location tracking</Label>
          </div>
          
          {permissionStatus === 'denied' && (
            <div className="mt-2 text-xs text-red-400 flex">
              <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
              <p>Location access denied. Please update your browser settings.</p>
            </div>
          )}
          
          {location && (
            <div className="mt-2 p-2 bg-gray-800 rounded text-xs">
              <div>Current coordinates:</div>
              <div className="font-mono mt-1">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </div>
            </div>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={requestPermission}
          disabled={permissionStatus === 'granted' || permissionStatus === 'denied'}
        >
          Request location permission
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LocationStatusIndicator;

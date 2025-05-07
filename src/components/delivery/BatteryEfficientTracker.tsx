
import React, { useState, useEffect } from 'react';
import { useIntelligentTracking } from '@/hooks/useIntelligentTracking';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Battery, BatteryLow, BatteryMedium, BatteryFull, MapPin, Zap, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Order } from '@/types/order';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";

interface BatteryEfficientTrackerProps {
  order?: Order;
  onLocationUpdate?: (location: any) => void;
  className?: string;
}

const BatteryEfficientTracker: React.FC<BatteryEfficientTrackerProps> = ({
  order,
  onLocationUpdate,
  className = ''
}) => {
  const [lowPowerMode, setLowPowerMode] = useState(false);

  // Extract locations from order
  const customerLocation = order && {
    latitude: order.latitude,
    longitude: order.longitude
  };

  const restaurantLocation = order?.restaurant && {
    latitude: order.restaurant.latitude,
    longitude: order.restaurant.longitude
  };

  // Use our intelligent tracking hook
  const {
    location,
    trackingMode,
    trackingInterval,
    batteryLevel,
    isLowBattery,
    distanceToDestination,
    isTracking,
    forceLocationUpdate
  } = useIntelligentTracking({
    orderId: order?.id,
    orderStatus: order?.status,
    customerLocation,
    restaurantLocation,
    onLocationUpdate,
    forceLowPowerMode: lowPowerMode
  });

  // Handle toggle of low power mode
  const handleToggleLowPowerMode = (checked: boolean) => {
    setLowPowerMode(checked);
    
    toast.info(checked 
      ? "Low power mode enabled - location updates reduced" 
      : "Standard tracking mode - normal location updates");
  };

  // Handle manual location update request
  const handleForceUpdate = async () => {
    toast.info("Updating location...");
    const newLocation = await forceLocationUpdate();
    if (newLocation) {
      toast.success("Location updated successfully");
    }
  };

  // Render battery icon based on level
  const renderBatteryIcon = () => {
    if (batteryLevel === null) return <Battery className="h-4 w-4" />;
    
    if (batteryLevel <= 20) return <BatteryLow className="h-4 w-4 text-red-500" />;
    if (batteryLevel <= 60) return <BatteryMedium className="h-4 w-4 text-yellow-500" />;
    return <BatteryFull className="h-4 w-4 text-green-500" />;
  };

  // Get the appropriate color for tracking mode badge
  const getTrackingModeColor = () => {
    switch (trackingMode) {
      case 'high': return "bg-green-500 hover:bg-green-400";
      case 'medium': return "bg-blue-500 hover:bg-blue-400";
      case 'low': return "bg-yellow-500 hover:bg-yellow-400 text-yellow-950";
      case 'minimal': return "bg-red-500 hover:bg-red-400";
      default: return "";
    }
  };

  // Format tracking interval for display
  const formatInterval = (ms: number): string => {
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds} sec`;
    return `${(seconds / 60).toFixed(1)} min`;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            Battery-Efficient Tracking
          </CardTitle>
          <Badge variant="outline" className={`${getTrackingModeColor()} capitalize`}>
            {trackingMode} mode
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm">Location updates every <span className="font-semibold">{formatInterval(trackingInterval)}</span></p>
            {batteryLevel !== null && (
              <div className="flex items-center space-x-2">
                {renderBatteryIcon()}
                <Progress value={batteryLevel} className="h-2 w-20" />
                <span className="text-xs">{batteryLevel}%</span>
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleForceUpdate} 
            disabled={!isTracking}
            className="h-8 px-2"
          >
            <MapPin className="h-3 w-3 mr-1" /> Update Now
          </Button>
        </div>
        
        {order && distanceToDestination !== null && (
          <div className="flex items-center text-sm">
            <span className="mr-2">Distance to {order.status === 'on_the_way' ? 'customer' : 'restaurant'}:</span>
            <Badge variant="secondary">
              {distanceToDestination < 1 
                ? `${(distanceToDestination * 1000).toFixed(0)}m` 
                : `${distanceToDestination.toFixed(1)}km`}
            </Badge>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2">
            {isLowBattery && (
              <Badge variant="destructive" className="flex gap-1 items-center">
                <AlertTriangle className="h-3 w-3" />
                Low Battery
              </Badge>
            )}
            <Label htmlFor="low-power" className="flex items-center cursor-pointer">
              <Zap className="h-4 w-4 mr-2 text-yellow-400" />
              Low Power Mode
            </Label>
          </div>
          <Switch
            id="low-power"
            checked={lowPowerMode}
            onCheckedChange={handleToggleLowPowerMode}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BatteryEfficientTracker;

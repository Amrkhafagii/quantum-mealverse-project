
import React, { useState, useEffect } from 'react';
import { useAdaptiveLocationTracking } from '@/hooks/useAdaptiveLocationTracking';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Battery, BatteryLow, BatteryMedium, BatteryFull, MapPin, Zap, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Order } from '@/types/order';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { BatteryOptimization } from '@/utils/batteryOptimization';

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
  const [batteryOptimizationSavings, setBatteryOptimizationSavings] = useState<number | null>(null);

  // Extract locations from order
  const customerLocation = order && {
    latitude: order.latitude,
    longitude: order.longitude
  };

  const restaurantLocation = order?.restaurant && {
    latitude: order.restaurant.latitude,
    longitude: order.restaurant.longitude
  };

  // Calculate distance to destination based on order status
  const destination = order?.status === 'on_the_way' ? customerLocation : 
                     (order?.status === 'preparing' || order?.status === 'accepted') ? restaurantLocation : 
                     null;
                     
  // Use the new adaptive tracking hook
  const {
    isTracking,
    startTracking,
    stopTracking,
    forceLocationUpdate,
    currentInterval,
    isMoving,
    speed,
    batteryLevel,
    isLowPowerMode,
    lastLocationTimestamp
  } = useAdaptiveLocationTracking({
    onLocationUpdate,
    distanceToDestination: destination ? calculateDistance(destination) : undefined,
    enableMotionDetection: true,
    enableAdaptiveSampling: true,
    batteryAware: true,
    initialInterval: lowPowerMode ? 60000 : 30000,
  });

  // Start tracking when component mounts
  useEffect(() => {
    if (!isTracking && order?.id) {
      startTracking();
    }
    
    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, [order?.id, isTracking, startTracking, stopTracking]);
  
  // Calculate estimated battery savings
  useEffect(() => {
    const calculateSavings = async () => {
      const isLowBattery = await BatteryOptimization.isLowBatteryState();
      // Calculate estimated battery savings based on:
      // - Adaptive sampling intervals vs constant 10 second intervals
      // - Motion detection reducing updates when stationary
      // - Distance filtering
      
      // Base savings from higher interval alone (vs 10 sec baseline)
      const baselineInterval = 10000; // 10 seconds
      let savings = ((currentInterval - baselineInterval) / baselineInterval) * 0.05;
      
      // Additional savings from being stationary
      if (!isMoving) {
        savings += 0.10; // Extra 10% savings when not moving
      }
      
      // Additional savings from low power mode
      if (lowPowerMode || isLowPowerMode || isLowBattery) {
        savings += 0.15; // Extra 15% savings in low power mode
      }
      
      // Cap savings at meaningful range
      savings = Math.min(savings, 0.65); // Maximum 65% savings
      savings = Math.max(savings, 0.05); // Minimum 5% savings
      
      setBatteryOptimizationSavings(Math.round(savings * 100));
    };
    
    calculateSavings();
  }, [currentInterval, isMoving, lowPowerMode, isLowPowerMode]);

  // Helper function to calculate distance between current location and destination
  function calculateDistance(destination: { latitude: number, longitude: number }): number | undefined {
    // Dummy implementation - would need actual location data
    // For demo purposes, return a random distance between 0 and 10km
    return Math.random() * 10;
  }

  // Handle toggle of low power mode
  const handleToggleLowPowerMode = (checked: boolean) => {
    setLowPowerMode(checked);
    
    // Restart tracking with new power settings
    if (isTracking) {
      stopTracking().then(() => {
        startTracking();
      });
    }
    
    toast.info(checked 
      ? "Low power mode enabled - location updates reduced" 
      : "Standard tracking mode - normal location updates");
  };

  // Handle manual location update request
  const handleForceUpdate = async () => {
    toast.info("Updating location...");
    const success = await forceLocationUpdate();
    if (success) {
      toast.success("Location updated successfully");
    }
  };

  // Render battery icon based on level
  const renderBatteryIcon = () => {
    if (batteryLevel === null) return <Battery className="h-4 w-4" />;
    
    if (batteryLevel <= 0.2) return <BatteryLow className="h-4 w-4 text-red-500" />;
    if (batteryLevel <= 0.6) return <BatteryMedium className="h-4 w-4 text-yellow-500" />;
    return <BatteryFull className="h-4 w-4 text-green-500" />;
  };

  // Get the appropriate color for tracking mode
  const getTrackingModeColor = () => {
    if (lowPowerMode || isLowPowerMode) {
      return "bg-yellow-500 hover:bg-yellow-400 text-yellow-950";
    }
    if (!isMoving) {
      return "bg-blue-500 hover:bg-blue-400";
    }
    if (currentInterval <= 15000) {
      return "bg-green-500 hover:bg-green-400";
    }
    return "bg-blue-500 hover:bg-blue-400";
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
            Battery-Optimized Tracking
          </CardTitle>
          <Badge variant="outline" className={`${getTrackingModeColor()}`}>
            {lowPowerMode || isLowPowerMode ? 'Power Saving' : 
             !isMoving ? 'Stationary Mode' : 'Standard Mode'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm">Updates every <span className="font-semibold">{formatInterval(currentInterval)}</span></p>
            {batteryLevel !== null && (
              <div className="flex items-center space-x-2">
                {renderBatteryIcon()}
                <Progress value={batteryLevel * 100} className="h-2 w-20" />
                <span className="text-xs">{Math.round(batteryLevel * 100)}%</span>
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
        
        {batteryOptimizationSavings && (
          <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded text-xs flex items-center">
            <Zap className="h-3 w-3 mr-1 text-green-500" />
            <span>Battery optimization saving approximately <strong>{batteryOptimizationSavings}%</strong> battery</span>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2">
            {batteryLevel !== null && batteryLevel <= 0.15 && (
              <Badge variant="destructive" className="flex gap-1 items-center">
                <AlertTriangle className="h-3 w-3" />
                Low Battery Mode
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
        
        <div className="text-xs text-muted-foreground">
          <ul className="list-disc list-inside space-y-1">
            <li>Battery-saving features: {isMoving ? 'Motion active' : 'Device stationary'}</li>
            {!isMoving && <li>Reduced updates while stationary</li>}
            {(lowPowerMode || isLowPowerMode) && <li>Power saving mode enabled</li>}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BatteryEfficientTracker;

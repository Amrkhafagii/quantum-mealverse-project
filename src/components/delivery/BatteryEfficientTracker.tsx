
import React, { useEffect, useState } from 'react';
import { useIntelligentTracking } from '@/hooks/useIntelligentTracking';
import { Button } from '@/components/ui/button';
import { Battery, Bluetooth, Wifi, Thermometer } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useBatteryMonitor } from '@/utils/batteryMonitor';

const BatteryEfficientTracker: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const { batteryLevel, isLowBattery } = useBatteryMonitor({ minimumBatteryLevel: 15 });
  
  // Configure and use intelligent tracking
  const tracking = useIntelligentTracking({
    forceLowPowerMode: isLowBattery,
    onLocationUpdate: (location) => {
      console.log('Location updated:', location);
    }
  });
  
  // Handle start tracking
  useEffect(() => {
    if (isActive) {
      // Notify that tracking is active
      toast({
        title: 'Tracking activated',
        description: 'Battery-efficient location tracking is now active.',
        duration: 3000,
      });
    } else {
      tracking.stopTracking?.();
    }
  }, [isActive, tracking]);
  
  return (
    <div className="p-4">
      {isActive && (
        <div className="flex items-center justify-between mb-3 p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
          <div className="flex items-center">
            <div className="mr-2">
              <Battery className={`h-5 w-5 ${batteryLevel < 20 ? 'text-red-500' : 'text-green-500'}`} />
            </div>
            <span className="text-sm">{tracking.trackingMode}</span>
            {showDebug && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({tracking.trackingInterval / 1000}s)
              </span>
            )}
          </div>
          <div className="flex space-x-1">
            <Bluetooth className="h-4 w-4 text-blue-500" />
            <Wifi className="h-4 w-4 text-blue-500" />
            <Thermometer className={`h-4 w-4 ${isLowBattery ? 'text-red-500' : 'text-green-500'}`} />
          </div>
        </div>
      )}
      
      <Button 
        variant={isActive ? "destructive" : "default"}
        size="sm"
        className="w-full"
        onClick={() => setIsActive(!isActive)}
      >
        {isActive ? "Stop Tracking" : "Start Energy-Efficient Tracking"}
      </Button>
      
      {isActive && showDebug && (
        <div className="mt-3 text-xs space-y-1 text-muted-foreground">
          <p>Tracking mode: {tracking.trackingMode}</p>
          <p>Battery: {batteryLevel}% ({isLowBattery ? 'Low' : 'Normal'})</p>
          <p>Update interval: {tracking.trackingInterval / 1000}s</p>
        </div>
      )}
      
      <div className="mt-2 text-center">
        <button 
          className="text-xs text-muted-foreground underline"
          onClick={() => setShowDebug(!showDebug)}
        >
          {showDebug ? 'Hide debug info' : 'Show debug info'}
        </button>
      </div>
    </div>
  );
};

export default BatteryEfficientTracker;

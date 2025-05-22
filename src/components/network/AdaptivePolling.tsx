
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { getAdaptivePollingInterval } from '@/utils/networkAdaptation';
import { NetworkQuality, NetworkType } from '@/types/unifiedLocation';

const AdaptivePolling = () => {
  const [baseInterval, setBaseInterval] = useState<number>(30);
  const [networkType, setNetworkType] = useState<NetworkType>('wifi');
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality>('good');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [currentInterval, setCurrentInterval] = useState<number>(30);

  // Update interval when parameters change
  useEffect(() => {
    const baseIntervalMs = baseInterval * 1000;
    const adaptedIntervalMs = getAdaptivePollingInterval(
      baseIntervalMs, 
      networkType,
      networkQuality,
      isActive
    );
    setCurrentInterval(adaptedIntervalMs / 1000); // Convert back to seconds for display
  }, [baseInterval, networkType, networkQuality, isActive]);

  return (
    <div className="p-4 border rounded-md space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">Adaptive Polling Demo</h3>
        <div className="text-sm text-muted-foreground">
          Current interval: <span className="font-semibold">{currentInterval.toFixed(1)}s</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Base Interval (seconds)</Label>
          <Slider 
            defaultValue={[baseInterval]} 
            max={60} 
            min={5}
            step={1}
            onValueChange={(val) => setBaseInterval(val[0])}
          />
          <div className="text-sm text-right">{baseInterval}s</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Network Type</Label>
            <Select 
              value={networkType} 
              onValueChange={(value) => setNetworkType(value as NetworkType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wifi">WiFi</SelectItem>
                <SelectItem value="cellular_5g">5G</SelectItem>
                <SelectItem value="cellular_4g">4G</SelectItem>
                <SelectItem value="cellular_3g">3G</SelectItem>
                <SelectItem value="ethernet">Ethernet</SelectItem>
                <SelectItem value="none">No Connection</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Network Quality</Label>
            <Select 
              value={networkQuality} 
              onValueChange={(value) => setNetworkQuality(value as NetworkQuality)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
                <SelectItem value="very-poor">Very Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>App State</Label>
          <Select 
            value={isActive ? "active" : "background"}
            onValueChange={(value) => setIsActive(value === "active")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active (Foreground)</SelectItem>
              <SelectItem value="background">Background</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default AdaptivePolling;

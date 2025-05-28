
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { BatteryPerformanceSettings } from '@/types/batteryPerformance';

interface AdaptiveTrackingSettingsProps {
  settings: BatteryPerformanceSettings;
  onUpdate: (updates: Partial<BatteryPerformanceSettings>) => void;
  isProcessing: boolean;
  currentConfig: any;
}

export const AdaptiveTrackingSettings: React.FC<AdaptiveTrackingSettingsProps> = ({
  settings,
  onUpdate,
  isProcessing,
  currentConfig
}) => {
  return (
    <div className="space-y-6">
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle>Tracking Mode Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tracking Mode</Label>
            <Select
              value={settings.tracking_mode}
              onValueChange={(value: 'high' | 'medium' | 'low' | 'adaptive') =>
                onUpdate({ tracking_mode: value })
              }
              disabled={isProcessing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adaptive">Adaptive (Recommended)</SelectItem>
                <SelectItem value="high">High Accuracy</SelectItem>
                <SelectItem value="medium">Medium Accuracy</SelectItem>
                <SelectItem value="low">Low Power</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Adaptive mode automatically adjusts based on battery level and conditions
            </p>
          </div>

          {currentConfig && (
            <div className="p-3 bg-quantum-darkBlue/30 rounded-lg">
              <div className="text-sm font-medium mb-2">Current Optimal Configuration</div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Update Interval:</span>
                  <span className="ml-2 text-quantum-cyan">{Math.round(currentConfig.interval / 1000)}s</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Distance Filter:</span>
                  <span className="ml-2 text-quantum-cyan">{currentConfig.distanceFilter}m</span>
                </div>
                <div>
                  <span className="text-muted-foreground">High Accuracy:</span>
                  <span className="ml-2 text-quantum-cyan">{currentConfig.enableHighAccuracy ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Batching:</span>
                  <span className="ml-2 text-quantum-cyan">{currentConfig.locationBatching ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle>Interval Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>High Accuracy Interval (ms)</Label>
              <Input
                type="number"
                value={settings.high_accuracy_interval}
                onChange={(e) => onUpdate({ high_accuracy_interval: parseInt(e.target.value) })}
                disabled={isProcessing}
                min={1000}
                max={30000}
              />
              <p className="text-xs text-muted-foreground">1-30 seconds</p>
            </div>
            <div className="space-y-2">
              <Label>Medium Accuracy Interval (ms)</Label>
              <Input
                type="number"
                value={settings.medium_accuracy_interval}
                onChange={(e) => onUpdate({ medium_accuracy_interval: parseInt(e.target.value) })}
                disabled={isProcessing}
                min={5000}
                max={60000}
              />
              <p className="text-xs text-muted-foreground">5-60 seconds</p>
            </div>
            <div className="space-y-2">
              <Label>Low Power Interval (ms)</Label>
              <Input
                type="number"
                value={settings.low_accuracy_interval}
                onChange={(e) => onUpdate({ low_accuracy_interval: parseInt(e.target.value) })}
                disabled={isProcessing}
                min={30000}
                max={300000}
              />
              <p className="text-xs text-muted-foreground">30-300 seconds</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle>Distance Filter Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>High Accuracy Filter (m)</Label>
              <Input
                type="number"
                value={settings.distance_filter_high}
                onChange={(e) => onUpdate({ distance_filter_high: parseFloat(e.target.value) })}
                disabled={isProcessing}
                min={1}
                max={50}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground">1-50 meters</p>
            </div>
            <div className="space-y-2">
              <Label>Medium Accuracy Filter (m)</Label>
              <Input
                type="number"
                value={settings.distance_filter_medium}
                onChange={(e) => onUpdate({ distance_filter_medium: parseFloat(e.target.value) })}
                disabled={isProcessing}
                min={5}
                max={100}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground">5-100 meters</p>
            </div>
            <div className="space-y-2">
              <Label>Low Power Filter (m)</Label>
              <Input
                type="number"
                value={settings.distance_filter_low}
                onChange={(e) => onUpdate({ distance_filter_low: parseFloat(e.target.value) })}
                disabled={isProcessing}
                min={20}
                max={500}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground">20-500 meters</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

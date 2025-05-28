
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { BatteryPerformanceSettings } from '@/types/batteryPerformance';
import { Activity } from 'lucide-react';

interface MotionDetectionSettingsProps {
  settings: BatteryPerformanceSettings;
  onUpdate: (updates: Partial<BatteryPerformanceSettings>) => void;
  isProcessing: boolean;
}

export const MotionDetectionSettings: React.FC<MotionDetectionSettingsProps> = ({
  settings,
  onUpdate,
  isProcessing
}) => {
  const getSensitivityDescription = (sensitivity: string) => {
    switch (sensitivity) {
      case 'low': return 'Less sensitive, detects only significant movement';
      case 'medium': return 'Balanced sensitivity for normal use';
      case 'high': return 'Very sensitive, detects small movements';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Motion Detection Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Motion Detection</Label>
              <p className="text-sm text-muted-foreground">
                Detect when the device is moving to optimize tracking
              </p>
            </div>
            <Switch
              checked={settings.motion_detection_enabled}
              onCheckedChange={(checked) => onUpdate({ motion_detection_enabled: checked })}
              disabled={isProcessing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-pause When Stationary</Label>
              <p className="text-sm text-muted-foreground">
                Automatically reduce tracking frequency when not moving
              </p>
            </div>
            <Switch
              checked={settings.auto_pause_tracking_when_stationary}
              onCheckedChange={(checked) => onUpdate({ auto_pause_tracking_when_stationary: checked })}
              disabled={isProcessing || !settings.motion_detection_enabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle>Sensitivity Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Motion Sensitivity</Label>
            <Select
              value={settings.motion_sensitivity}
              onValueChange={(value: 'low' | 'medium' | 'high') =>
                onUpdate({ motion_sensitivity: value })
              }
              disabled={isProcessing || !settings.motion_detection_enabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Sensitivity</SelectItem>
                <SelectItem value="medium">Medium Sensitivity</SelectItem>
                <SelectItem value="high">High Sensitivity</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {getSensitivityDescription(settings.motion_sensitivity)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle>Movement Thresholds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Movement Threshold (meters)</Label>
              <Input
                type="number"
                value={settings.movement_threshold_meters}
                onChange={(e) => onUpdate({ movement_threshold_meters: parseFloat(e.target.value) })}
                disabled={isProcessing || !settings.motion_detection_enabled}
                min={1}
                max={100}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground">
                Minimum distance to consider as movement
              </p>
            </div>

            <div className="space-y-2">
              <Label>Speed Threshold (km/h)</Label>
              <Input
                type="number"
                value={settings.speed_threshold_kmh}
                onChange={(e) => onUpdate({ speed_threshold_kmh: parseFloat(e.target.value) })}
                disabled={isProcessing || !settings.motion_detection_enabled}
                min={0.1}
                max={50}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground">
                Minimum speed to consider as active movement
              </p>
            </div>

            <div className="space-y-2">
              <Label>Stationary Timeout (minutes)</Label>
              <Input
                type="number"
                value={settings.stationary_timeout_minutes}
                onChange={(e) => onUpdate({ stationary_timeout_minutes: parseInt(e.target.value) })}
                disabled={isProcessing || !settings.motion_detection_enabled}
                min={1}
                max={30}
              />
              <p className="text-xs text-muted-foreground">
                How long to wait before considering the device stationary
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle>Performance Optimization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Background Processing</Label>
              <p className="text-sm text-muted-foreground">
                Continue processing location data in the background
              </p>
            </div>
            <Switch
              checked={settings.background_processing_enabled}
              onCheckedChange={(checked) => onUpdate({ background_processing_enabled: checked })}
              disabled={isProcessing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Location Batching</Label>
              <p className="text-sm text-muted-foreground">
                Batch location updates to reduce processing overhead
              </p>
            </div>
            <Switch
              checked={settings.location_batching_enabled}
              onCheckedChange={(checked) => onUpdate({ location_batching_enabled: checked })}
              disabled={isProcessing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Batch Size</Label>
              <Input
                type="number"
                value={settings.batch_size}
                onChange={(e) => onUpdate({ batch_size: parseInt(e.target.value) })}
                disabled={isProcessing || !settings.location_batching_enabled}
                min={1}
                max={20}
              />
              <p className="text-xs text-muted-foreground">
                Number of locations to batch together
              </p>
            </div>

            <div className="space-y-2">
              <Label>Batch Timeout (seconds)</Label>
              <Input
                type="number"
                value={settings.batch_timeout_seconds}
                onChange={(e) => onUpdate({ batch_timeout_seconds: parseInt(e.target.value) })}
                disabled={isProcessing || !settings.location_batching_enabled}
                min={10}
                max={300}
              />
              <p className="text-xs text-muted-foreground">
                Maximum time to wait before sending batch
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>CPU Optimization Level</Label>
            <Select
              value={settings.cpu_optimization_level}
              onValueChange={(value: 'performance' | 'balanced' | 'power_save') =>
                onUpdate({ cpu_optimization_level: value })
              }
              disabled={isProcessing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">Performance Mode</SelectItem>
                <SelectItem value="balanced">Balanced Mode</SelectItem>
                <SelectItem value="power_save">Power Save Mode</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Adjust CPU usage for location processing
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

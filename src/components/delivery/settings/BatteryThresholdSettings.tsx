
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { BatteryPerformanceSettings } from '@/types/batteryPerformance';
import { Battery } from 'lucide-react';

interface BatteryThresholdSettingsProps {
  settings: BatteryPerformanceSettings;
  onUpdate: (updates: Partial<BatteryPerformanceSettings>) => void;
  isProcessing: boolean;
  currentBatteryLevel: number;
}

export const BatteryThresholdSettings: React.FC<BatteryThresholdSettingsProps> = ({
  settings,
  onUpdate,
  isProcessing,
  currentBatteryLevel
}) => {
  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-400';
    if (level > 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCurrentThresholdLevel = () => {
    if (currentBatteryLevel >= settings.battery_high_threshold) return 'High';
    if (currentBatteryLevel >= settings.battery_medium_threshold) return 'Medium';
    if (currentBatteryLevel >= settings.battery_low_threshold) return 'Low';
    return 'Critical';
  };

  return (
    <div className="space-y-6">
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Battery className="mr-2 h-5 w-5" />
            Battery Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-quantum-darkBlue/30 rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">Current Battery Level</div>
              <div className={`text-2xl font-bold ${getBatteryColor(currentBatteryLevel)}`}>
                {currentBatteryLevel}%
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Threshold Level</div>
              <div className="text-lg font-medium text-quantum-cyan">
                {getCurrentThresholdLevel()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle>Battery Threshold Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>High Battery Threshold: {settings.battery_high_threshold}%</Label>
              <Slider
                value={[settings.battery_high_threshold]}
                onValueChange={([value]) => onUpdate({ battery_high_threshold: value })}
                max={100}
                min={60}
                step={5}
                disabled={isProcessing}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Above this level, use high accuracy tracking
              </p>
            </div>

            <div className="space-y-3">
              <Label>Medium Battery Threshold: {settings.battery_medium_threshold}%</Label>
              <Slider
                value={[settings.battery_medium_threshold]}
                onValueChange={([value]) => onUpdate({ battery_medium_threshold: value })}
                max={settings.battery_high_threshold - 5}
                min={30}
                step={5}
                disabled={isProcessing}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Above this level, use medium accuracy tracking
              </p>
            </div>

            <div className="space-y-3">
              <Label>Low Battery Threshold: {settings.battery_low_threshold}%</Label>
              <Slider
                value={[settings.battery_low_threshold]}
                onValueChange={([value]) => onUpdate({ battery_low_threshold: value })}
                max={settings.battery_medium_threshold - 5}
                min={10}
                step={5}
                disabled={isProcessing}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Below this level, use low power tracking
              </p>
            </div>

            <div className="space-y-3">
              <Label>Critical Battery Threshold: {settings.battery_critical_threshold}%</Label>
              <Slider
                value={[settings.battery_critical_threshold]}
                onValueChange={([value]) => onUpdate({ battery_critical_threshold: value })}
                max={settings.battery_low_threshold - 5}
                min={5}
                step={1}
                disabled={isProcessing}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Below this level, use emergency power saving
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle>Power Saving Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Low Power Mode</Label>
              <p className="text-sm text-muted-foreground">
                Automatically enable power saving when battery is low
              </p>
            </div>
            <Switch
              checked={settings.enable_low_power_mode}
              onCheckedChange={(checked) => onUpdate({ enable_low_power_mode: checked })}
              disabled={isProcessing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-reduce Accuracy on Low Battery</Label>
              <p className="text-sm text-muted-foreground">
                Automatically reduce tracking accuracy when battery is low
              </p>
            </div>
            <Switch
              checked={settings.auto_reduce_accuracy_on_low_battery}
              onCheckedChange={(checked) => onUpdate({ auto_reduce_accuracy_on_low_battery: checked })}
              disabled={isProcessing}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

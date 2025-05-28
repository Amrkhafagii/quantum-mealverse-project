
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { BatteryPerformanceSettings } from '@/types/batteryPerformance';
import { Wifi, WifiOff } from 'lucide-react';

interface NetworkQualitySettingsProps {
  settings: BatteryPerformanceSettings;
  onUpdate: (updates: Partial<BatteryPerformanceSettings>) => void;
  isProcessing: boolean;
  currentNetworkQuality: 'wifi' | 'cellular' | 'poor' | 'offline';
}

export const NetworkQualitySettings: React.FC<NetworkQualitySettingsProps> = ({
  settings,
  onUpdate,
  isProcessing,
  currentNetworkQuality
}) => {
  const getNetworkIcon = () => {
    return currentNetworkQuality === 'offline' ? <WifiOff className="h-5 w-5" /> : <Wifi className="h-5 w-5" />;
  };

  const getNetworkColor = () => {
    switch (currentNetworkQuality) {
      case 'wifi': return 'text-green-400';
      case 'cellular': return 'text-blue-400';
      case 'poor': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center">
            {getNetworkIcon()}
            <span className="ml-2">Network Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-quantum-darkBlue/30 rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">Current Network Quality</div>
              <div className={`text-2xl font-bold ${getNetworkColor()}`}>
                {currentNetworkQuality.charAt(0).toUpperCase() + currentNetworkQuality.slice(1)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Optimization</div>
              <div className="text-lg font-medium text-quantum-cyan">
                {settings.network_quality_optimization ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle>Network Adaptation Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Network Quality Optimization</Label>
              <p className="text-sm text-muted-foreground">
                Automatically adjust tracking based on network conditions
              </p>
            </div>
            <Switch
              checked={settings.network_quality_optimization}
              onCheckedChange={(checked) => onUpdate({ network_quality_optimization: checked })}
              disabled={isProcessing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Data Compression</Label>
              <p className="text-sm text-muted-foreground">
                Compress location data to reduce bandwidth usage
              </p>
            </div>
            <Switch
              checked={settings.enable_data_compression}
              onCheckedChange={(checked) => onUpdate({ enable_data_compression: checked })}
              disabled={isProcessing}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle>Network-Specific Intervals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>WiFi Preferred Interval (ms)</Label>
              <Input
                type="number"
                value={settings.wifi_preferred_interval}
                onChange={(e) => onUpdate({ wifi_preferred_interval: parseInt(e.target.value) })}
                disabled={isProcessing}
                min={5000}
                max={30000}
              />
              <p className="text-xs text-muted-foreground">Optimal interval for WiFi connections</p>
            </div>

            <div className="space-y-2">
              <Label>Cellular Interval (ms)</Label>
              <Input
                type="number"
                value={settings.cellular_interval}
                onChange={(e) => onUpdate({ cellular_interval: parseInt(e.target.value) })}
                disabled={isProcessing}
                min={10000}
                max={60000}
              />
              <p className="text-xs text-muted-foreground">Interval for cellular connections</p>
            </div>

            <div className="space-y-2">
              <Label>Poor Network Interval (ms)</Label>
              <Input
                type="number"
                value={settings.poor_network_interval}
                onChange={(e) => onUpdate({ poor_network_interval: parseInt(e.target.value) })}
                disabled={isProcessing}
                min={20000}
                max={120000}
              />
              <p className="text-xs text-muted-foreground">Interval for poor network conditions</p>
            </div>

            <div className="space-y-2">
              <Label>Offline Mode Interval (ms)</Label>
              <Input
                type="number"
                value={settings.offline_mode_interval}
                onChange={(e) => onUpdate({ offline_mode_interval: parseInt(e.target.value) })}
                disabled={isProcessing}
                min={60000}
                max={300000}
              />
              <p className="text-xs text-muted-foreground">Interval when offline (for caching)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

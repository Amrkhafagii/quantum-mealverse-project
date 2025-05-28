
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Battery, Cpu, Wifi, Activity } from 'lucide-react';
import { AdaptiveTrackingSettings } from './AdaptiveTrackingSettings';
import { BatteryThresholdSettings } from './BatteryThresholdSettings';
import { NetworkQualitySettings } from './NetworkQualitySettings';
import { MotionDetectionSettings } from './MotionDetectionSettings';
import { useBatteryPerformanceSettings } from '@/hooks/useBatteryPerformanceSettings';

interface BatteryPerformanceSettingsProps {
  deliveryUserId: string;
}

export const BatteryPerformanceSettings: React.FC<BatteryPerformanceSettingsProps> = ({
  deliveryUserId
}) => {
  const {
    settings,
    loading,
    isProcessing,
    batteryLevel,
    networkQuality,
    updateSettings,
    getOptimalTrackingConfig
  } = useBatteryPerformanceSettings(deliveryUserId);

  if (loading) {
    return (
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="text-quantum-cyan">Loading battery performance settings...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardContent className="pt-6">
          <div className="text-center text-red-400">
            Failed to load battery performance settings
          </div>
        </CardContent>
      </Card>
    );
  }

  const optimalConfig = getOptimalTrackingConfig(false);

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Battery className="mr-2 h-5 w-5" />
            Performance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                batteryLevel > 50 ? 'text-green-400' : 
                batteryLevel > 20 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {batteryLevel}%
              </div>
              <div className="text-sm text-muted-foreground">Battery</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-quantum-cyan">
                {settings.tracking_mode}
              </div>
              <div className="text-sm text-muted-foreground">Mode</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {networkQuality}
              </div>
              <div className="text-sm text-muted-foreground">Network</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {optimalConfig ? Math.round(optimalConfig.interval / 1000) : 0}s
              </div>
              <div className="text-sm text-muted-foreground">Interval</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle>Battery & Performance Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tracking" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tracking" className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Tracking
              </TabsTrigger>
              <TabsTrigger value="battery" className="flex items-center gap-2">
                <Battery className="h-4 w-4" />
                Battery
              </TabsTrigger>
              <TabsTrigger value="network" className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Network
              </TabsTrigger>
              <TabsTrigger value="motion" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Motion
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tracking" className="mt-6">
              <AdaptiveTrackingSettings
                settings={settings}
                onUpdate={updateSettings}
                isProcessing={isProcessing}
                currentConfig={optimalConfig}
              />
            </TabsContent>

            <TabsContent value="battery" className="mt-6">
              <BatteryThresholdSettings
                settings={settings}
                onUpdate={updateSettings}
                isProcessing={isProcessing}
                currentBatteryLevel={batteryLevel}
              />
            </TabsContent>

            <TabsContent value="network" className="mt-6">
              <NetworkQualitySettings
                settings={settings}
                onUpdate={updateSettings}
                isProcessing={isProcessing}
                currentNetworkQuality={networkQuality}
              />
            </TabsContent>

            <TabsContent value="motion" className="mt-6">
              <MotionDetectionSettings
                settings={settings}
                onUpdate={updateSettings}
                isProcessing={isProcessing}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

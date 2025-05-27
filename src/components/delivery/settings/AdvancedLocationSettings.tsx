
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { deliveryLocationSettingsService } from '@/services/delivery/deliveryLocationSettingsService';
import type { DeliveryLocationSettings } from '@/types/delivery-location-settings';

interface AdvancedLocationSettingsProps {
  deliveryUserId: string;
}

export const AdvancedLocationSettings: React.FC<AdvancedLocationSettingsProps> = ({ deliveryUserId }) => {
  const [settings, setSettings] = useState<DeliveryLocationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [deliveryUserId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await deliveryLocationSettingsService.getLocationSettings(deliveryUserId);
      setSettings(data);
    } catch (error) {
      console.error('Error loading location settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load location settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<DeliveryLocationSettings>) => {
    if (!settings) return;

    try {
      setSaving(true);
      const updatedSettings = await deliveryLocationSettingsService.updateLocationSettings(
        deliveryUserId,
        updates
      );
      
      if (updatedSettings) {
        setSettings(updatedSettings);
        toast({
          title: 'Settings Updated',
          description: 'Location settings have been saved successfully'
        });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update location settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardContent className="pt-6">
          <div className="text-center text-quantum-cyan">Loading advanced settings...</div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardContent className="pt-6">
          <div className="text-center text-red-400">Failed to load settings</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Location Accuracy Thresholds */}
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle className="text-quantum-cyan">Location Accuracy Thresholds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>High Accuracy Threshold: {settings.high_accuracy_threshold}m</Label>
              <Slider
                value={[settings.high_accuracy_threshold]}
                onValueChange={(value) => updateSettings({ high_accuracy_threshold: value[0] })}
                min={1}
                max={50}
                step={1}
                className="mt-2"
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Locations within this accuracy are considered highly accurate
              </p>
            </div>

            <div>
              <Label>Medium Accuracy Threshold: {settings.medium_accuracy_threshold}m</Label>
              <Slider
                value={[settings.medium_accuracy_threshold]}
                onValueChange={(value) => updateSettings({ medium_accuracy_threshold: value[0] })}
                min={20}
                max={200}
                step={5}
                className="mt-2"
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Locations within this accuracy are considered moderately accurate
              </p>
            </div>

            <div>
              <Label>Low Accuracy Threshold: {settings.low_accuracy_threshold}m</Label>
              <Slider
                value={[settings.low_accuracy_threshold]}
                onValueChange={(value) => updateSettings({ low_accuracy_threshold: value[0] })}
                min={50}
                max={500}
                step={10}
                className="mt-2"
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Locations within this accuracy are considered low accuracy
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Tracking Intervals */}
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle className="text-quantum-cyan">Custom Tracking Intervals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>High Accuracy Interval: {Math.round(settings.high_accuracy_interval / 1000)}s</Label>
              <Slider
                value={[settings.high_accuracy_interval / 1000]}
                onValueChange={(value) => updateSettings({ high_accuracy_interval: value[0] * 1000 })}
                min={1}
                max={30}
                step={1}
                className="mt-2"
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground mt-1">
                How often to update location in high accuracy mode
              </p>
            </div>

            <div>
              <Label>Medium Accuracy Interval: {Math.round(settings.medium_accuracy_interval / 1000)}s</Label>
              <Slider
                value={[settings.medium_accuracy_interval / 1000]}
                onValueChange={(value) => updateSettings({ medium_accuracy_interval: value[0] * 1000 })}
                min={5}
                max={60}
                step={5}
                className="mt-2"
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground mt-1">
                How often to update location in medium accuracy mode
              </p>
            </div>

            <div>
              <Label>Low Accuracy Interval: {Math.round(settings.low_accuracy_interval / 1000)}s</Label>
              <Slider
                value={[settings.low_accuracy_interval / 1000]}
                onValueChange={(value) => updateSettings({ low_accuracy_interval: value[0] * 1000 })}
                min={10}
                max={300}
                step={10}
                className="mt-2"
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground mt-1">
                How often to update location in low accuracy mode
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geofencing Preferences */}
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle className="text-quantum-cyan">Geofencing Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Delivery Zone Radius: {settings.delivery_zone_radius}m</Label>
            <Slider
              value={[settings.delivery_zone_radius]}
              onValueChange={(value) => updateSettings({ delivery_zone_radius: value[0] })}
              min={100}
              max={5000}
              step={50}
              className="mt-2"
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Default radius for delivery zone boundaries
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Entry Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Notify when entering delivery zones
                </p>
              </div>
              <Switch
                checked={settings.geofence_entry_notifications}
                onCheckedChange={(checked) => updateSettings({ geofence_entry_notifications: checked })}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Exit Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Notify when leaving delivery zones
                </p>
              </div>
              <Switch
                checked={settings.geofence_exit_notifications}
                onCheckedChange={(checked) => updateSettings({ geofence_exit_notifications: checked })}
                disabled={saving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Sharing Duration */}
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle className="text-quantum-cyan">Location Sharing Duration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Sharing Duration: {Math.round(settings.location_sharing_duration / 60)} hours</Label>
            <Slider
              value={[settings.location_sharing_duration / 60]}
              onValueChange={(value) => updateSettings({ location_sharing_duration: value[0] * 60 })}
              min={1}
              max={24}
              step={0.5}
              className="mt-2"
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground mt-1">
              How long to share location during active deliveries
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-stop After Delivery</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically stop sharing when delivery is complete
                </p>
              </div>
              <Switch
                checked={settings.auto_stop_sharing_after_delivery}
                onCheckedChange={(checked) => updateSettings({ auto_stop_sharing_after_delivery: checked })}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label>Sharing Precision Level</Label>
              <Select
                value={settings.sharing_precision_level}
                onValueChange={(value: 'high' | 'medium' | 'low') => 
                  updateSettings({ sharing_precision_level: value })
                }
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High (±5m accuracy)</SelectItem>
                  <SelectItem value="medium">Medium (±50m accuracy)</SelectItem>
                  <SelectItem value="low">Low (±100m accuracy)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle className="text-quantum-cyan">Additional Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Battery Optimization</Label>
              <p className="text-xs text-muted-foreground">
                Automatically adjust tracking based on battery level
              </p>
            </div>
            <Switch
              checked={settings.battery_optimization_enabled}
              onCheckedChange={(checked) => updateSettings({ battery_optimization_enabled: checked })}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Background Location</Label>
              <p className="text-xs text-muted-foreground">
                Continue tracking when app is in background
              </p>
            </div>
            <Switch
              checked={settings.background_location_enabled}
              onCheckedChange={(checked) => updateSettings({ background_location_enabled: checked })}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label>Movement Detection Sensitivity</Label>
            <Select
              value={settings.movement_detection_sensitivity}
              onValueChange={(value: 'high' | 'medium' | 'low') => 
                updateSettings({ movement_detection_sensitivity: value })
              }
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High (detect small movements)</SelectItem>
                <SelectItem value="medium">Medium (normal sensitivity)</SelectItem>
                <SelectItem value="low">Low (only detect significant movement)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

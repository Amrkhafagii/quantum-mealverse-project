
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { deliveryLocationSettingsService } from '@/services/delivery/deliveryLocationSettingsService';
import type { DeliveryLocationSettings } from '@/types/delivery-location-settings';

interface AdvancedLocationSettingsProps {
  deliveryUserId: string;
}

export const AdvancedLocationSettings: React.FC<AdvancedLocationSettingsProps> = ({
  deliveryUserId
}) => {
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

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const updated = await deliveryLocationSettingsService.updateLocationSettings(
        deliveryUserId,
        settings
      );
      
      if (updated) {
        setSettings(updated);
        toast({
          title: 'Success',
          description: 'Location settings updated successfully'
        });
      }
    } catch (error) {
      console.error('Error saving location settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save location settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof DeliveryLocationSettings, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [key]: value
    });
  };

  if (loading) {
    return <div className="text-center p-4">Loading settings...</div>;
  }

  if (!settings) {
    return <div className="text-center p-4 text-red-500">Failed to load settings</div>;
  }

  return (
    <div className="space-y-6">
      {/* Location Accuracy Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle>Location Accuracy Thresholds</CardTitle>
          <p className="text-sm text-muted-foreground">
            Set accuracy thresholds in meters for different tracking modes
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="high-accuracy">High Accuracy (m)</Label>
              <Input
                id="high-accuracy"
                type="number"
                value={settings.high_accuracy_threshold}
                onChange={(e) => updateSetting('high_accuracy_threshold', Number(e.target.value))}
                min="1"
                max="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medium-accuracy">Medium Accuracy (m)</Label>
              <Input
                id="medium-accuracy"
                type="number"
                value={settings.medium_accuracy_threshold}
                onChange={(e) => updateSetting('medium_accuracy_threshold', Number(e.target.value))}
                min="10"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="low-accuracy">Low Accuracy (m)</Label>
              <Input
                id="low-accuracy"
                type="number"
                value={settings.low_accuracy_threshold}
                onChange={(e) => updateSetting('low_accuracy_threshold', Number(e.target.value))}
                min="50"
                max="500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Tracking Intervals */}
      <Card>
        <CardHeader>
          <CardTitle>Tracking Intervals</CardTitle>
          <p className="text-sm text-muted-foreground">
            Set how frequently location updates are sent (in seconds)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="high-interval">High Accuracy (s)</Label>
              <Input
                id="high-interval"
                type="number"
                value={Math.round(settings.high_accuracy_interval / 1000)}
                onChange={(e) => updateSetting('high_accuracy_interval', Number(e.target.value) * 1000)}
                min="1"
                max="60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medium-interval">Medium Accuracy (s)</Label>
              <Input
                id="medium-interval"
                type="number"
                value={Math.round(settings.medium_accuracy_interval / 1000)}
                onChange={(e) => updateSetting('medium_accuracy_interval', Number(e.target.value) * 1000)}
                min="5"
                max="120"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="low-interval">Low Accuracy (s)</Label>
              <Input
                id="low-interval"
                type="number"
                value={Math.round(settings.low_accuracy_interval / 1000)}
                onChange={(e) => updateSetting('low_accuracy_interval', Number(e.target.value) * 1000)}
                min="15"
                max="300"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geofencing Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Geofencing Preferences</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure delivery zone boundaries and notifications
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delivery-radius">Delivery Zone Radius (m)</Label>
            <Input
              id="delivery-radius"
              type="number"
              value={settings.delivery_zone_radius}
              onChange={(e) => updateSetting('delivery_zone_radius', Number(e.target.value))}
              min="100"
              max="5000"
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="entry-notifications">Geofence Entry Notifications</Label>
              <p className="text-xs text-muted-foreground">Get notified when entering delivery zones</p>
            </div>
            <Switch
              id="entry-notifications"
              checked={settings.geofence_entry_notifications}
              onCheckedChange={(checked) => updateSetting('geofence_entry_notifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="exit-notifications">Geofence Exit Notifications</Label>
              <p className="text-xs text-muted-foreground">Get notified when leaving delivery zones</p>
            </div>
            <Switch
              id="exit-notifications"
              checked={settings.geofence_exit_notifications}
              onCheckedChange={(checked) => updateSetting('geofence_exit_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location Sharing Duration */}
      <Card>
        <CardHeader>
          <CardTitle>Location Sharing Settings</CardTitle>
          <p className="text-sm text-muted-foreground">
            Control how long and how precisely your location is shared
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sharing-duration">Sharing Duration (minutes)</Label>
            <Input
              id="sharing-duration"
              type="number"
              value={settings.location_sharing_duration}
              onChange={(e) => updateSetting('location_sharing_duration', Number(e.target.value))}
              min="60"
              max="1440"
            />
            <p className="text-xs text-muted-foreground">
              How long to share location during active deliveries (1-24 hours)
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="precision-level">Sharing Precision Level</Label>
            <Select
              value={settings.sharing_precision_level}
              onValueChange={(value: 'high' | 'medium' | 'low') => updateSetting('sharing_precision_level', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High (±5m)</SelectItem>
                <SelectItem value="medium">Medium (±25m)</SelectItem>
                <SelectItem value="low">Low (±100m)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-stop">Auto-stop after delivery</Label>
              <p className="text-xs text-muted-foreground">Automatically stop sharing when delivery is complete</p>
            </div>
            <Switch
              id="auto-stop"
              checked={settings.auto_stop_sharing_after_delivery}
              onCheckedChange={(checked) => updateSetting('auto_stop_sharing_after_delivery', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="battery-optimization">Battery Optimization</Label>
              <p className="text-xs text-muted-foreground">Reduce tracking frequency when battery is low</p>
            </div>
            <Switch
              id="battery-optimization"
              checked={settings.battery_optimization_enabled}
              onCheckedChange={(checked) => updateSetting('battery_optimization_enabled', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="background-location">Background Location</Label>
              <p className="text-xs text-muted-foreground">Allow location tracking when app is in background</p>
            </div>
            <Switch
              id="background-location"
              checked={settings.background_location_enabled}
              onCheckedChange={(checked) => updateSetting('background_location_enabled', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="movement-sensitivity">Movement Detection Sensitivity</Label>
            <Select
              value={settings.movement_detection_sensitivity}
              onValueChange={(value: 'high' | 'medium' | 'low') => updateSetting('movement_detection_sensitivity', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

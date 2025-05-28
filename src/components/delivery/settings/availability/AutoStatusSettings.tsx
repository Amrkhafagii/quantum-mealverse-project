
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Pause } from 'lucide-react';
import type { DeliveryAutoStatusSettings } from '@/types/availability';

interface AutoStatusSettingsProps {
  autoStatusSettings: DeliveryAutoStatusSettings | null;
  updateAutoStatusSettings: (settings: Partial<DeliveryAutoStatusSettings>) => Promise<DeliveryAutoStatusSettings | undefined>;
  isProcessing: boolean;
}

export const AutoStatusSettings: React.FC<AutoStatusSettingsProps> = ({
  autoStatusSettings,
  updateAutoStatusSettings,
  isProcessing
}) => {
  const settings = autoStatusSettings || {
    enable_location_based_status: false,
    work_zone_radius_meters: 1000,
    auto_active_in_work_zone: false,
    auto_inactive_outside_work_zone: false,
    enable_time_based_status: false,
    auto_active_on_schedule: false,
    auto_inactive_off_schedule: false,
    pre_shift_buffer_minutes: 15,
    post_shift_buffer_minutes: 15,
    auto_break_status_during_breaks: false
  } as DeliveryAutoStatusSettings;

  const handleUpdateSetting = async (key: keyof DeliveryAutoStatusSettings, value: any) => {
    await updateAutoStatusSettings({ [key]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Auto-Status Management</h3>
        <p className="text-sm text-muted-foreground">
          Automatically change your status based on location, time, and break schedules
        </p>
      </div>

      {/* Location-Based Status */}
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location-Based Status Changes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Location-Based Status</Label>
              <p className="text-sm text-muted-foreground">
                Automatically change status when entering/leaving work zones
              </p>
            </div>
            <Switch
              checked={settings.enable_location_based_status}
              onCheckedChange={(checked) => handleUpdateSetting('enable_location_based_status', checked)}
              disabled={isProcessing}
            />
          </div>

          {settings.enable_location_based_status && (
            <div className="space-y-4 pl-6 border-l-2 border-quantum-cyan/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Work Zone Latitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={settings.work_zone_latitude || ''}
                    onChange={(e) => handleUpdateSetting('work_zone_latitude', parseFloat(e.target.value) || null)}
                    placeholder="e.g., 40.712776"
                    disabled={isProcessing}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Work Zone Longitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={settings.work_zone_longitude || ''}
                    onChange={(e) => handleUpdateSetting('work_zone_longitude', parseFloat(e.target.value) || null)}
                    placeholder="e.g., -74.005974"
                    disabled={isProcessing}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Work Zone Radius (meters)</Label>
                  <Input
                    type="number"
                    min="100"
                    max="10000"
                    value={settings.work_zone_radius_meters}
                    onChange={(e) => handleUpdateSetting('work_zone_radius_meters', parseInt(e.target.value) || 1000)}
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Active in Work Zone</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically set status to active when entering work zone
                    </p>
                  </div>
                  <Switch
                    checked={settings.auto_active_in_work_zone}
                    onCheckedChange={(checked) => handleUpdateSetting('auto_active_in_work_zone', checked)}
                    disabled={isProcessing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Inactive Outside Work Zone</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically set status to inactive when leaving work zone
                    </p>
                  </div>
                  <Switch
                    checked={settings.auto_inactive_outside_work_zone}
                    onCheckedChange={(checked) => handleUpdateSetting('auto_inactive_outside_work_zone', checked)}
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                      handleUpdateSetting('work_zone_latitude', position.coords.latitude);
                      handleUpdateSetting('work_zone_longitude', position.coords.longitude);
                    });
                  }
                }}
                disabled={isProcessing}
              >
                Use Current Location
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time-Based Status */}
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time-Based Status Changes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Time-Based Status</Label>
              <p className="text-sm text-muted-foreground">
                Automatically change status based on your scheduled availability
              </p>
            </div>
            <Switch
              checked={settings.enable_time_based_status}
              onCheckedChange={(checked) => handleUpdateSetting('enable_time_based_status', checked)}
              disabled={isProcessing}
            />
          </div>

          {settings.enable_time_based_status && (
            <div className="space-y-4 pl-6 border-l-2 border-quantum-cyan/20">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Active on Schedule</Label>
                  <p className="text-sm text-muted-foreground">
                    Set status to active when your scheduled hours begin
                  </p>
                </div>
                <Switch
                  checked={settings.auto_active_on_schedule}
                  onCheckedChange={(checked) => handleUpdateSetting('auto_active_on_schedule', checked)}
                  disabled={isProcessing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Inactive Off Schedule</Label>
                  <p className="text-sm text-muted-foreground">
                    Set status to inactive when your scheduled hours end
                  </p>
                </div>
                <Switch
                  checked={settings.auto_inactive_off_schedule}
                  onCheckedChange={(checked) => handleUpdateSetting('auto_inactive_off_schedule', checked)}
                  disabled={isProcessing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pre-Shift Buffer (minutes)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="60"
                    value={settings.pre_shift_buffer_minutes}
                    onChange={(e) => handleUpdateSetting('pre_shift_buffer_minutes', parseInt(e.target.value) || 15)}
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-muted-foreground">
                    Activate this many minutes before scheduled start
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Post-Shift Buffer (minutes)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="60"
                    value={settings.post_shift_buffer_minutes}
                    onChange={(e) => handleUpdateSetting('post_shift_buffer_minutes', parseInt(e.target.value) || 15)}
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-muted-foreground">
                    Remain active this many minutes after scheduled end
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Break-Based Status */}
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pause className="h-5 w-5" />
            Break-Based Status Changes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Break Status During Breaks</Label>
              <p className="text-sm text-muted-foreground">
                Automatically set status to "on break" when taking scheduled breaks
              </p>
            </div>
            <Switch
              checked={settings.auto_break_status_during_breaks}
              onCheckedChange={(checked) => handleUpdateSetting('auto_break_status_during_breaks', checked)}
              disabled={isProcessing}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

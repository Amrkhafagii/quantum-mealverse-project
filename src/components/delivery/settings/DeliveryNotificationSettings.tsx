
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { deliveryNotificationService } from '@/services/delivery/deliveryNotificationService';
import type { DeliveryNotificationPreferences } from '@/types/delivery-notification-preferences';

interface DeliveryNotificationSettingsProps {
  deliveryUserId: string;
}

export const DeliveryNotificationSettings: React.FC<DeliveryNotificationSettingsProps> = ({
  deliveryUserId
}) => {
  const [preferences, setPreferences] = useState<DeliveryNotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [deliveryUserId]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await deliveryNotificationService.getDeliveryUserNotificationPreferences(deliveryUserId);
      setPreferences(data);
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<DeliveryNotificationPreferences>) => {
    if (!preferences) return;

    try {
      setSaving(true);
      const updated = await deliveryNotificationService.updateNotificationPreferences(
        deliveryUserId,
        updates
      );
      
      if (updated) {
        setPreferences(updated);
        toast({
          title: 'Success',
          description: 'Notification preferences updated'
        });
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update preferences',
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
          <div className="text-center text-quantum-cyan">Loading notification preferences...</div>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardContent className="pt-6">
          <div className="text-center text-red-400">Failed to load notification preferences</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Push Notifications */}
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="push-assignments">Delivery Assignments</Label>
            <Switch
              id="push-assignments"
              checked={preferences.push_delivery_assignments}
              onCheckedChange={(checked) => updatePreferences({ push_delivery_assignments: checked })}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-updates">Order Updates</Label>
            <Switch
              id="push-updates"
              checked={preferences.push_order_updates}
              onCheckedChange={(checked) => updatePreferences({ push_order_updates: checked })}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-payments">Payment Notifications</Label>
            <Switch
              id="push-payments"
              checked={preferences.push_payment_notifications}
              onCheckedChange={(checked) => updatePreferences({ push_payment_notifications: checked })}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-alerts">System Alerts</Label>
            <Switch
              id="push-alerts"
              checked={preferences.push_system_alerts}
              onCheckedChange={(checked) => updatePreferences({ push_system_alerts: checked })}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-assignments">Delivery Assignments</Label>
            <Switch
              id="email-assignments"
              checked={preferences.email_delivery_assignments}
              onCheckedChange={(checked) => updatePreferences({ email_delivery_assignments: checked })}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-weekly">Weekly Summary</Label>
            <Switch
              id="email-weekly"
              checked={preferences.email_weekly_summary}
              onCheckedChange={(checked) => updatePreferences({ email_weekly_summary: checked })}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sound & Vibration */}
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle>Sound & Vibration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-enabled">Sound Enabled</Label>
            <Switch
              id="sound-enabled"
              checked={preferences.sound_enabled}
              onCheckedChange={(checked) => updatePreferences({ sound_enabled: checked })}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="vibration-enabled">Vibration Enabled</Label>
            <Switch
              id="vibration-enabled"
              checked={preferences.vibration_enabled}
              onCheckedChange={(checked) => updatePreferences({ vibration_enabled: checked })}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
            <Switch
              id="quiet-hours"
              checked={preferences.quiet_hours_enabled}
              onCheckedChange={(checked) => updatePreferences({ quiet_hours_enabled: checked })}
              disabled={saving}
            />
          </div>
          
          {preferences.quiet_hours_enabled && (
            <>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Select
                  value={preferences.quiet_hours_start}
                  onValueChange={(value) => updatePreferences({ quiet_hours_start: value })}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20:00:00">8:00 PM</SelectItem>
                    <SelectItem value="21:00:00">9:00 PM</SelectItem>
                    <SelectItem value="22:00:00">10:00 PM</SelectItem>
                    <SelectItem value="23:00:00">11:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>End Time</Label>
                <Select
                  value={preferences.quiet_hours_end}
                  onValueChange={(value) => updatePreferences({ quiet_hours_end: value })}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00:00">6:00 AM</SelectItem>
                    <SelectItem value="07:00:00">7:00 AM</SelectItem>
                    <SelectItem value="08:00:00">8:00 AM</SelectItem>
                    <SelectItem value="09:00:00">9:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

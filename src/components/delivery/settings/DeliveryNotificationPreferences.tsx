
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { deliveryNotificationService } from '@/services/delivery/deliveryNotificationService';
import type { DeliveryNotificationPreferences } from '@/types/delivery-notification-preferences';
import { useToast } from '@/hooks/use-toast';

interface DeliveryNotificationSettingsProps {
  deliveryUserId: string;
}

export const DeliveryNotificationSettings: React.FC<DeliveryNotificationSettingsProps> = ({
  deliveryUserId
}) => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<DeliveryNotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);
        const prefs = await deliveryNotificationService.getDeliveryUserNotificationPreferences(deliveryUserId);
        setPreferences(prefs);
      } catch (error) {
        console.error('Error loading notification preferences:', error);
        toast({
          title: 'Error',
          description: 'Failed to load notification preferences.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (deliveryUserId) {
      loadPreferences();
    }
  }, [deliveryUserId, toast]);

  const updatePreferences = async (updates: Partial<DeliveryNotificationPreferences>) => {
    if (!preferences) return;

    const updatedPrefs = { ...preferences, ...updates };
    setPreferences(updatedPrefs);

    try {
      setSaving(true);
      await deliveryNotificationService.updateNotificationPreferences(deliveryUserId, updates);
      toast({
        title: 'Settings Updated',
        description: 'Your notification preferences have been saved.',
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences.',
        variant: 'destructive'
      });
      // Revert the local state on error
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !preferences) {
    return (
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardContent className="pt-6">
          <div className="text-center text-quantum-cyan">Loading notification settings...</div>
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

      {/* SMS Notifications */}
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle>SMS Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-assignments">Delivery Assignments</Label>
            <Switch
              id="sms-assignments"
              checked={preferences.sms_delivery_assignments}
              onCheckedChange={(checked) => updatePreferences({ sms_delivery_assignments: checked })}
              disabled={saving}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-updates">Order Updates</Label>
            <Switch
              id="sms-updates"
              checked={preferences.sms_order_updates}
              onCheckedChange={(checked) => updatePreferences({ sms_order_updates: checked })}
              disabled={saving}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-payments">Payment Notifications</Label>
            <Switch
              id="sms-payments"
              checked={preferences.sms_payment_notifications}
              onCheckedChange={(checked) => updatePreferences({ sms_payment_notifications: checked })}
              disabled={saving}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-alerts">System Alerts</Label>
            <Switch
              id="sms-alerts"
              checked={preferences.sms_system_alerts}
              onCheckedChange={(checked) => updatePreferences({ sms_system_alerts: checked })}
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
            <Label htmlFor="email-updates">Order Updates</Label>
            <Switch
              id="email-updates"
              checked={preferences.email_order_updates}
              onCheckedChange={(checked) => updatePreferences({ email_order_updates: checked })}
              disabled={saving}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="email-payments">Payment Notifications</Label>
            <Switch
              id="email-payments"
              checked={preferences.email_payment_notifications}
              onCheckedChange={(checked) => updatePreferences({ email_payment_notifications: checked })}
              disabled={saving}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="email-alerts">System Alerts</Label>
            <Switch
              id="email-alerts"
              checked={preferences.email_system_alerts}
              onCheckedChange={(checked) => updatePreferences({ email_system_alerts: checked })}
              disabled={saving}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="email-summary">Weekly Summary</Label>
            <Switch
              id="email-summary"
              checked={preferences.email_weekly_summary}
              onCheckedChange={(checked) => updatePreferences({ email_weekly_summary: checked })}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sound and Vibration */}
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

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-assignments">Delivery Assignments Sound</Label>
              <Select
                value={preferences.sound_delivery_assignments}
                onValueChange={(value) => updatePreferences({ sound_delivery_assignments: value })}
                disabled={saving || !preferences.sound_enabled}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                  <SelectItem value="chime">Chime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sound-updates">Order Updates Sound</Label>
              <Select
                value={preferences.sound_order_updates}
                onValueChange={(value) => updatePreferences({ sound_order_updates: value })}
                disabled={saving || !preferences.sound_enabled}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                  <SelectItem value="chime">Chime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sound-payments">Payment Notifications Sound</Label>
              <Select
                value={preferences.sound_payment_notifications}
                onValueChange={(value) => updatePreferences({ sound_payment_notifications: value })}
                disabled={saving || !preferences.sound_enabled}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                  <SelectItem value="chime">Chime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sound-alerts">System Alerts Sound</Label>
              <Select
                value={preferences.sound_system_alerts}
                onValueChange={(value) => updatePreferences({ sound_system_alerts: value })}
                disabled={saving || !preferences.sound_enabled}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                  <SelectItem value="chime">Chime</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="quiet-start">Start Time</Label>
                <input
                  id="quiet-start"
                  type="time"
                  value={preferences.quiet_hours_start}
                  onChange={(e) => updatePreferences({ quiet_hours_start: e.target.value })}
                  disabled={saving}
                  className="px-3 py-1 bg-transparent border border-quantum-cyan/20 rounded text-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="quiet-end">End Time</Label>
                <input
                  id="quiet-end"
                  type="time"
                  value={preferences.quiet_hours_end}
                  onChange={(e) => updatePreferences({ quiet_hours_end: e.target.value })}
                  disabled={saving}
                  className="px-3 py-1 bg-transparent border border-quantum-cyan/20 rounded text-white"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

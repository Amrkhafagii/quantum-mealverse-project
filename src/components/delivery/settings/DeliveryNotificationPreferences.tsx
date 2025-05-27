
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, MessageSquare, Mail, Volume2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deliveryNotificationService } from '@/services/delivery/deliveryNotificationService';
import type { DeliveryNotificationPreferences } from '@/types/delivery-notification-preferences';

interface DeliveryNotificationPreferencesProps {
  deliveryUserId: string;
}

export const DeliveryNotificationPreferences: React.FC<DeliveryNotificationPreferencesProps> = ({
  deliveryUserId
}) => {
  const { toast } = useToast();
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
      console.error('Error loading preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof DeliveryNotificationPreferences, value: any) => {
    if (!preferences) return;

    const updatedPreferences = { ...preferences, [key]: value };
    setPreferences(updatedPreferences);

    try {
      setSaving(true);
      await deliveryNotificationService.updateNotificationPreferences(deliveryUserId, {
        [key]: value
      });
      
      toast({
        title: 'Success',
        description: 'Notification preferences updated',
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences',
        variant: 'destructive'
      });
      // Revert the change
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  const soundOptions = [
    { value: 'default', label: 'Default' },
    { value: 'notification', label: 'Notification' },
    { value: 'alert', label: 'Alert' },
    { value: 'chime', label: 'Chime' },
    { value: 'ping', label: 'Ping' },
    { value: 'silent', label: 'Silent' }
  ];

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
    <Card className="border border-quantum-cyan/20 bg-transparent">
      <CardHeader>
        <CardTitle className="text-quantum-cyan flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="push" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="push">Push</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="sound">Sound</TabsTrigger>
            <TabsTrigger value="quiet">Quiet Hours</TabsTrigger>
          </TabsList>

          <TabsContent value="push" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-4 w-4 text-quantum-cyan" />
              <h3 className="text-lg font-medium">Push Notifications</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Delivery Assignments</Label>
                  <p className="text-sm text-gray-400">Get notified about new delivery assignments</p>
                </div>
                <Switch
                  checked={preferences.push_delivery_assignments}
                  onCheckedChange={(checked) => updatePreference('push_delivery_assignments', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Order Updates</Label>
                  <p className="text-sm text-gray-400">Status changes and order modifications</p>
                </div>
                <Switch
                  checked={preferences.push_order_updates}
                  onCheckedChange={(checked) => updatePreference('push_order_updates', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Payment Notifications</Label>
                  <p className="text-sm text-gray-400">Payment confirmations and earnings updates</p>
                </div>
                <Switch
                  checked={preferences.push_payment_notifications}
                  onCheckedChange={(checked) => updatePreference('push_payment_notifications', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>System Alerts</Label>
                  <p className="text-sm text-gray-400">Important system messages and announcements</p>
                </div>
                <Switch
                  checked={preferences.push_system_alerts}
                  onCheckedChange={(checked) => updatePreference('push_system_alerts', checked)}
                  disabled={saving}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sms" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-4 w-4 text-quantum-cyan" />
              <h3 className="text-lg font-medium">SMS Notifications</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Delivery Assignments</Label>
                  <p className="text-sm text-gray-400">SMS alerts for new assignments</p>
                </div>
                <Switch
                  checked={preferences.sms_delivery_assignments}
                  onCheckedChange={(checked) => updatePreference('sms_delivery_assignments', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Order Updates</Label>
                  <p className="text-sm text-gray-400">SMS notifications for order changes</p>
                </div>
                <Switch
                  checked={preferences.sms_order_updates}
                  onCheckedChange={(checked) => updatePreference('sms_order_updates', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Payment Notifications</Label>
                  <p className="text-sm text-gray-400">SMS for payment confirmations</p>
                </div>
                <Switch
                  checked={preferences.sms_payment_notifications}
                  onCheckedChange={(checked) => updatePreference('sms_payment_notifications', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>System Alerts</Label>
                  <p className="text-sm text-gray-400">Critical system messages via SMS</p>
                </div>
                <Switch
                  checked={preferences.sms_system_alerts}
                  onCheckedChange={(checked) => updatePreference('sms_system_alerts', checked)}
                  disabled={saving}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-4 w-4 text-quantum-cyan" />
              <h3 className="text-lg font-medium">Email Notifications</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Delivery Assignments</Label>
                  <p className="text-sm text-gray-400">Email notifications for new assignments</p>
                </div>
                <Switch
                  checked={preferences.email_delivery_assignments}
                  onCheckedChange={(checked) => updatePreference('email_delivery_assignments', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Order Updates</Label>
                  <p className="text-sm text-gray-400">Email alerts for order status changes</p>
                </div>
                <Switch
                  checked={preferences.email_order_updates}
                  onCheckedChange={(checked) => updatePreference('email_order_updates', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Payment Notifications</Label>
                  <p className="text-sm text-gray-400">Email confirmations for payments</p>
                </div>
                <Switch
                  checked={preferences.email_payment_notifications}
                  onCheckedChange={(checked) => updatePreference('email_payment_notifications', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>System Alerts</Label>
                  <p className="text-sm text-gray-400">Important system announcements</p>
                </div>
                <Switch
                  checked={preferences.email_system_alerts}
                  onCheckedChange={(checked) => updatePreference('email_system_alerts', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Summary</Label>
                  <p className="text-sm text-gray-400">Weekly delivery and earnings summary</p>
                </div>
                <Switch
                  checked={preferences.email_weekly_summary}
                  onCheckedChange={(checked) => updatePreference('email_weekly_summary', checked)}
                  disabled={saving}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sound" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Volume2 className="h-4 w-4 text-quantum-cyan" />
              <h3 className="text-lg font-medium">Sound & Vibration</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sound Enabled</Label>
                  <p className="text-sm text-gray-400">Enable notification sounds</p>
                </div>
                <Switch
                  checked={preferences.sound_enabled}
                  onCheckedChange={(checked) => updatePreference('sound_enabled', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Vibration Enabled</Label>
                  <p className="text-sm text-gray-400">Enable vibration for notifications</p>
                </div>
                <Switch
                  checked={preferences.vibration_enabled}
                  onCheckedChange={(checked) => updatePreference('vibration_enabled', checked)}
                  disabled={saving}
                />
              </div>

              {preferences.sound_enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Delivery Assignments Sound</Label>
                    <Select
                      value={preferences.sound_delivery_assignments}
                      onValueChange={(value) => updatePreference('sound_delivery_assignments', value)}
                      disabled={saving}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {soundOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Order Updates Sound</Label>
                    <Select
                      value={preferences.sound_order_updates}
                      onValueChange={(value) => updatePreference('sound_order_updates', value)}
                      disabled={saving}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {soundOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Notifications Sound</Label>
                    <Select
                      value={preferences.sound_payment_notifications}
                      onValueChange={(value) => updatePreference('sound_payment_notifications', value)}
                      disabled={saving}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {soundOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>System Alerts Sound</Label>
                    <Select
                      value={preferences.sound_system_alerts}
                      onValueChange={(value) => updatePreference('sound_system_alerts', value)}
                      disabled={saving}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {soundOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="quiet" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-quantum-cyan" />
              <h3 className="text-lg font-medium">Quiet Hours</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Quiet Hours</Label>
                  <p className="text-sm text-gray-400">Silence notifications during specified hours</p>
                </div>
                <Switch
                  checked={preferences.quiet_hours_enabled}
                  onCheckedChange={(checked) => updatePreference('quiet_hours_enabled', checked)}
                  disabled={saving}
                />
              </div>

              {preferences.quiet_hours_enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={preferences.quiet_hours_start}
                      onChange={(e) => updatePreference('quiet_hours_start', e.target.value)}
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={preferences.quiet_hours_end}
                      onChange={(e) => updatePreference('quiet_hours_end', e.target.value)}
                      disabled={saving}
                    />
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

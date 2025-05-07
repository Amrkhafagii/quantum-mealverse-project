
import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Info } from 'lucide-react';
import { useNotificationPermissions } from '@/hooks/useNotificationPermissions';
import { Platform } from '@/utils/platform';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const NotificationPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    isSupported, 
    isPermissionGranted, 
    isLoading: permissionsLoading, 
    requestPermissions 
  } = useNotificationPermissions();
  
  const [preferences, setPreferences] = useState({
    orderStatus: true,
    deliveryAlerts: true,
    promotions: false,
    reminders: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Load user notification preferences
  useEffect(() => {
    if (!user) return;
    
    const loadPreferences = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          console.error('Error loading notification preferences:', error);
        } else if (data) {
          setPreferences({
            orderStatus: data.order_status !== false,
            deliveryAlerts: data.delivery_alerts !== false,
            promotions: data.promotions === true,
            reminders: data.reminders === true,
          });
        }
      } catch (error) {
        console.error('Error in loadPreferences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreferences();
  }, [user]);
  
  // Save preferences when they change
  const savePreferences = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          order_status: preferences.orderStatus,
          delivery_alerts: preferences.deliveryAlerts,
          promotions: preferences.promotions,
          reminders: preferences.reminders,
          updated_at: new Date().toISOString()
        });
        
      if (error) {
        console.error('Error saving notification preferences:', error);
        toast({
          title: 'Error',
          description: 'Failed to save notification preferences.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Preferences Saved',
          description: 'Your notification preferences have been updated.',
        });
      }
    } catch (error) {
      console.error('Error in savePreferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle toggle changes
  const handleToggle = (key: keyof typeof preferences) => (checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: checked
    }));
  };
  
  if (!Platform.isNative()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Notification settings are only available on mobile devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Info size={16} />
            <p className="text-sm">
              Download our mobile app to receive notifications about your orders
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!isPermissionGranted && isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifications Disabled
          </CardTitle>
          <CardDescription>
            Enable notifications to get updates on your orders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            You'll need to enable notifications to receive updates about your orders,
            delivery status, and other important information.
          </p>
          
          <Button 
            onClick={requestPermissions} 
            disabled={permissionsLoading} 
            className="w-full"
          >
            {permissionsLoading ? 'Enabling...' : 'Enable Notifications'}
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Manage how you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="orderStatus" className="text-base font-medium">
                Order Status Updates
              </Label>
              <p className="text-sm text-muted-foreground">
                Notifications when your order status changes
              </p>
            </div>
            <Switch
              id="orderStatus"
              checked={preferences.orderStatus}
              onCheckedChange={handleToggle('orderStatus')}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="deliveryAlerts" className="text-base font-medium">
                Delivery Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Get alerts when your delivery is approaching
              </p>
            </div>
            <Switch
              id="deliveryAlerts"
              checked={preferences.deliveryAlerts}
              onCheckedChange={handleToggle('deliveryAlerts')}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="promotions" className="text-base font-medium">
                Promotional Offers
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about special offers and promotions
              </p>
            </div>
            <Switch
              id="promotions"
              checked={preferences.promotions}
              onCheckedChange={handleToggle('promotions')}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reminders" className="text-base font-medium">
                Order Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Get reminders about your recent orders
              </p>
            </div>
            <Switch
              id="reminders"
              checked={preferences.reminders}
              onCheckedChange={handleToggle('reminders')}
              disabled={isLoading}
            />
          </div>
        </div>
        
        <Button 
          onClick={savePreferences} 
          disabled={isLoading} 
          className="w-full"
        >
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
        
        <div className="text-xs text-muted-foreground">
          <p>
            You can change notification settings at any time from your device settings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

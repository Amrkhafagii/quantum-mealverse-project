import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Info } from 'lucide-react';
import { useNotificationPermissions } from '@/hooks/useNotificationPermissions';
import { Platform } from '@/utils/platform';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getUserNotificationPreferences, saveUserNotificationPreferences } from '@/services/notification/notificationService';

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
    order_status: true,
    delivery_alerts: true,
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
        // Use our service instead of direct database calls
        const prefs = await getUserNotificationPreferences(user.id);
        setPreferences(prefs);
      } catch (error) {
        console.error('Error loading notification preferences:', error);
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
      // Use our service instead of direct database calls
      const success = await saveUserNotificationPreferences(user.id, preferences);
        
      if (success) {
        toast({
          title: 'Preferences Saved',
          description: 'Your notification preferences have been updated.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save notification preferences.',
          variant: 'destructive'
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
              checked={preferences.order_status}
              onCheckedChange={handleToggle('order_status')}
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
              checked={preferences.delivery_alerts}
              onCheckedChange={handleToggle('delivery_alerts')}
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

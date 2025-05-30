
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { EnhancedOrderStatus } from './EnhancedOrderStatus';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Order } from '@/types/order';
import { toast } from '@/components/ui/use-toast';

interface OrderTrackingEnhancementProps {
  order: Order;
  children?: React.ReactNode;
}

export const OrderTrackingEnhancement: React.FC<OrderTrackingEnhancementProps> = ({
  order,
  children
}) => {
  const { permission, requestPermission, isSupported } = usePushNotifications();
  const [notificationsEnabled, setNotificationsEnabled] = useState(permission === 'granted');

  const handleToggleNotifications = async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (granted) {
        setNotificationsEnabled(true);
        toast({
          title: "Notifications enabled",
          description: "You'll receive updates about your order preparation",
        });
      } else {
        setNotificationsEnabled(false);
        toast({
          title: "Notifications disabled",
          description: "Please enable notifications in your browser settings",
          variant: "destructive"
        });
      }
    } else {
      const newState = !notificationsEnabled;
      setNotificationsEnabled(newState);
      toast({
        title: newState ? "Notifications enabled" : "Notifications disabled",
        description: newState 
          ? "You'll receive updates about your order preparation" 
          : "You won't receive preparation updates",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Notification Toggle */}
      {isSupported && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Live Updates</h4>
                <p className="text-sm text-gray-600">
                  Get notified about your order preparation progress
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleNotifications}
                className="flex items-center space-x-2"
              >
                {notificationsEnabled ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
                <span>{notificationsEnabled ? 'Enabled' : 'Enable'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Tracking Tabs */}
      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="status">Order Status</TabsTrigger>
          <TabsTrigger value="location">Delivery Tracking</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status" className="space-y-4">
          <EnhancedOrderStatus order={order} />
        </TabsContent>
        
        <TabsContent value="location" className="space-y-4">
          {children || (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <p>Delivery tracking will be available once your order is out for delivery</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

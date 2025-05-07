
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotificationPermissions } from '@/hooks/useNotificationPermissions';
import { AlertTriangle, Bell, BellOff, Info } from 'lucide-react';
import { Platform } from '@/utils/platform';

interface NotificationPermissionPromptProps {
  variant?: 'inline' | 'banner' | 'modal';
}

export const NotificationPermissionPrompt: React.FC<NotificationPermissionPromptProps> = ({ 
  variant = 'inline' 
}) => {
  const { 
    isSupported, 
    isPermissionGranted, 
    isLoading, 
    requestPermissions 
  } = useNotificationPermissions();
  
  // Don't show anything if notifications are already granted or not supported
  if (!isSupported || isPermissionGranted) {
    return null;
  }

  // Different UI variants
  const renderContent = () => {
    switch (variant) {
      case 'banner':
        return (
          <div className="bg-muted/30 backdrop-blur-sm border-b border-border p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm">Enable notifications to get real-time updates on your orders</p>
            </div>
            <Button 
              onClick={requestPermissions} 
              disabled={isLoading} 
              size="sm"
            >
              {isLoading ? 'Enabling...' : 'Enable'}
            </Button>
          </div>
        );
        
      case 'modal':
        return (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Enable Notifications
              </CardTitle>
              <CardDescription>
                Stay updated on your orders in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Get instant alerts when:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Your order is accepted</li>
                  <li>Your food is being prepared</li>
                  <li>Your order is ready for pickup</li>
                  <li>Your delivery is on the way</li>
                  <li>Your delivery driver is approaching</li>
                </ul>
                
                {Platform.isIOS() && (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-md">
                    <Info className="h-5 w-5 flex-shrink-0" />
                    <p className="text-xs">You'll need to confirm permission in the iOS system prompt</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
              <Button onClick={requestPermissions} disabled={isLoading} className="flex-1">
                {isLoading ? 'Enabling...' : 'Enable Notifications'}
              </Button>
              <Button variant="ghost" className="flex-1">
                Later
              </Button>
            </CardFooter>
          </Card>
        );
        
      case 'inline':
      default:
        return (
          <div className="flex items-center gap-3 bg-muted/20 border border-border rounded-md p-3">
            <Bell className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Get order updates</p>
              <p className="text-xs text-muted-foreground">
                Enable notifications to get real-time order status updates
              </p>
            </div>
            <Button 
              onClick={requestPermissions} 
              disabled={isLoading} 
              size="sm"
              variant="outline"
            >
              {isLoading ? 'Enabling...' : 'Enable'}
            </Button>
          </div>
        );
    }
  };

  return renderContent();
};

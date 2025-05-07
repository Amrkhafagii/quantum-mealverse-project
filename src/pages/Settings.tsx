import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserSettings } from '@/components/profile/UserSettings';
import { NotificationPermissionPrompt } from '@/components/notifications/NotificationPermissionPrompt';
import { NotificationPreferences } from '@/components/settings/NotificationPreferences';
import { UserCurrencySelector } from '@/components/settings/UserCurrencySelector';
import { Platform } from '@/utils/platform';
import { useNotificationPermissions } from '@/hooks/useNotificationPermissions';

const Settings = () => {
  const { isSupported: notificationsSupported } = useNotificationPermissions();
  const isMobile = Platform.isNative();
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="account">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          {notificationsSupported && (
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="account">
          <div className="space-y-6">
            <UserSettings />
            
            {/* Other account settings could go here */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Manage your data and privacy preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full">
                    Manage Data
                  </Button>
                  <Button variant="outline" className="w-full">
                    Export Personal Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="preferences">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>
                  Customize how the app looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Currency preferences */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Currency</h3>
                    <UserCurrencySelector />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {notificationsSupported && (
          <TabsContent value="notifications">
            <div className="space-y-6">
              <NotificationPreferences />
            </div>
          </TabsContent>
        )}
      </Tabs>
      
      {/* Add some spacing at the bottom for mobile */}
      {isMobile && <div className="h-16" />}
    </div>
  );
};

export default Settings;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { Platform } from '@/utils/platform';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Utensils, Package, Bell, LineChart } from 'lucide-react';
import { OrderManagement } from './orders/OrderManagement';
import { MenuManagement } from './menu/MenuManagement';

const RestaurantDashboard: React.FC = () => {
  const { restaurant, isLoading } = useRestaurantAuth();
  const { isOnline } = useConnectionStatus();
  const [activeTab, setActiveTab] = useState('orders');
  
  // Convert to responsive design based on platform
  const isMobile = Platform.isNative() || window.innerWidth < 768;
  
  // Handle offline state
  useEffect(() => {
    if (!isOnline) {
      // Load cached data or show offline message
    }
  }, [isOnline]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading dashboard...</div>;
  }
  
  if (!restaurant) {
    return <div className="flex items-center justify-center p-8">Restaurant not found</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{restaurant.name} Dashboard</h1>
      
      <Tabs
        defaultValue="orders"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex justify-between items-center">
          <TabsList className={isMobile ? "w-full grid grid-cols-4" : ""}>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className={isMobile ? "hidden" : ""}>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              <span className={isMobile ? "hidden" : ""}>Menu</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              <span className={isMobile ? "hidden" : ""}>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className={isMobile ? "hidden" : ""}>Notifications</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="orders" className="space-y-4">
          <OrderManagement restaurantId={restaurant.id} />
        </TabsContent>
        
        <TabsContent value="menu" className="space-y-4">
          <MenuManagement />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Analytics</CardTitle>
              <CardDescription>
                View insights about your restaurant's performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Analytics content will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage your restaurant notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Notifications content will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantDashboard;

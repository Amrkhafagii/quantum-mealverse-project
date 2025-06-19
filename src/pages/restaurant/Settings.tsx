
import React from 'react';
import { RestaurantLayout } from '@/components/restaurant/RestaurantLayout';
import RestaurantSettings from '@/components/restaurant/profile/RestaurantSettings';
import { OrderFixPanel } from '@/components/admin/OrderFixPanel';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RestaurantSettingsPage = () => {
  const { restaurant, isLoading } = useRestaurantAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-quantum-cyan mx-auto mb-4"></div>
          <p className="text-quantum-cyan">Loading restaurant settings...</p>
        </div>
      </div>
    );
  }

  return (
    <RestaurantLayout>
      <div className="container mx-auto p-6">
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="fix-orders">Fix Orders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="mt-6">
            <RestaurantSettings restaurant={restaurant} />
          </TabsContent>
          
          <TabsContent value="fix-orders" className="mt-6">
            <OrderFixPanel />
          </TabsContent>
        </Tabs>
      </div>
    </RestaurantLayout>
  );
};

export default RestaurantSettingsPage;

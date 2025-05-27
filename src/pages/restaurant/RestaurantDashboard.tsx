
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import RestaurantLayout from '@/components/restaurant/RestaurantLayout';
import { RestaurantDashboard as Dashboard } from '@/components/restaurant/RestaurantDashboard';
import { RestaurantProfile } from '@/components/restaurant/profile/RestaurantProfile';

const RestaurantDashboard = () => {
  const { isLoading } = useRestaurantAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-quantum-cyan mx-auto mb-4"></div>
          <p className="text-quantum-cyan">Loading restaurant dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedUserTypes={['restaurant']}>
      <RestaurantLayout>
        <div className="space-y-6">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              <Dashboard />
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <RestaurantProfile />
            </TabsContent>

            <TabsContent value="menu" className="space-y-4">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">Menu Management</h3>
                <p className="text-gray-600">Menu management will be implemented in future updates.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </RestaurantLayout>
    </ProtectedRoute>
  );
};

export default RestaurantDashboard;

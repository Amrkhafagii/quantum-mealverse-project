
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { RestaurantLayout } from '@/components/restaurant/RestaurantLayout';
import { RestaurantDashboard as Dashboard } from '@/components/restaurant/dashboard/RestaurantDashboard';
import { RestaurantProfile } from '@/components/restaurant/profile/RestaurantProfile';
import { RestaurantOnboarding } from '@/components/restaurant/onboarding/RestaurantOnboarding';
import OrderManagement from '@/components/restaurant/orders/OrderManagement';

const RestaurantDashboard = () => {
  const { isLoading, restaurant } = useRestaurantAuth();

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

  // Show onboarding if restaurant hasn't completed it yet
  const showOnboarding = restaurant && 
    (restaurant.onboarding_status === 'not_started' || 
     restaurant.onboarding_status === 'in_progress' ||
     restaurant.onboarding_status === 'pending_review');

  if (showOnboarding) {
    return (
      <ProtectedRoute allowedUserTypes={['restaurant']}>
        <RestaurantLayout>
          <RestaurantOnboarding />
        </RestaurantLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedUserTypes={['restaurant']}>
      <RestaurantLayout>
        <div className="space-y-6">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              <Dashboard />
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              {restaurant && <OrderManagement restaurantId={restaurant.id} />}
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

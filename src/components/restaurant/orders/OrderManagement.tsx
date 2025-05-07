
import React from 'react';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LiveOrdersList } from './LiveOrdersList';
import { OrderPreparation } from './OrderPreparation';
import { ReadyForPickupList } from './ReadyForPickupList';
import { OrderHistoryList } from './OrderHistoryList';

export const OrderManagement = () => {
  const { restaurant } = useRestaurantAuth();
  const [activeTab, setActiveTab] = React.useState('new');
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  // Re-fetch data when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Trigger a refresh when changing tabs
    setRefreshTrigger(prev => prev + 1);
  };

  if (!restaurant) return <div>Loading restaurant information...</div>;

  return (
    <Tabs defaultValue="new" onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="new">New Orders</TabsTrigger>
        <TabsTrigger value="preparation">In Preparation</TabsTrigger>
        <TabsTrigger value="pickup">Ready for Pickup</TabsTrigger>
        <TabsTrigger value="history">Order History</TabsTrigger>
      </TabsList>
      <TabsContent value="new" className="mt-6">
        <LiveOrdersList restaurantId={restaurant.id} key={`new-${refreshTrigger}`} />
      </TabsContent>
      <TabsContent value="preparation" className="mt-6">
        <OrderPreparation restaurantId={restaurant.id} key={`prep-${refreshTrigger}`} />
      </TabsContent>
      <TabsContent value="pickup" className="mt-6">
        <ReadyForPickupList restaurantId={restaurant.id} key={`pickup-${refreshTrigger}`} />
      </TabsContent>
      <TabsContent value="history" className="mt-6">
        <OrderHistoryList restaurantId={restaurant.id} key={`history-${refreshTrigger}`} />
      </TabsContent>
    </Tabs>
  );
};

export default OrderManagement;

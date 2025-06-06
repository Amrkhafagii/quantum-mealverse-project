
import React, { useState, useEffect } from 'react';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LiveOrdersList } from './LiveOrdersList';
import { ReadyForPickupList } from './ReadyForPickupList';
import { OrderHistoryList } from './OrderHistoryList';

export const OrderDashboard = () => {
  const { restaurant } = useRestaurantAuth();
  const [activeTab, setActiveTab] = useState('new');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Re-fetch data when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
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
        <LiveOrdersList 
          restaurantId={restaurant.id} 
          onOrderSelect={setSelectedOrderId}
        />
      </TabsContent>
      <TabsContent value="preparation" className="mt-6">
        {selectedOrderId ? (
          <div className="space-y-4">
            <button 
              onClick={() => setSelectedOrderId(null)}
              className="text-quantum-cyan hover:underline"
            >
              ← Back to Orders List
            </button>
            {/* OrderPreparation component would be imported and used here */}
            <div>Order Preparation Component for Order: {selectedOrderId}</div>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            Select an order from "New Orders" to view its preparation stages
          </div>
        )}
      </TabsContent>
      <TabsContent value="pickup" className="mt-6">
        <ReadyForPickupList restaurantId={restaurant.id} />
      </TabsContent>
      <TabsContent value="history" className="mt-6">
        <OrderHistoryList restaurantId={restaurant.id} />
      </TabsContent>
    </Tabs>
  );
};

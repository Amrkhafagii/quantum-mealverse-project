
import React from 'react';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { OrderDashboard } from './OrderDashboard';
import { Card, CardContent } from '@/components/ui/card';

export const OrderManagement = () => {
  const { restaurant, loading } = useRestaurantAuth();

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading restaurant information...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Restaurant Not Found</h2>
            <p className="text-gray-500">
              You either don't have access to a restaurant or your restaurant account hasn't been set up yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-quantum-cyan">Order Management</h1>
      <OrderDashboard />
    </div>
  );
};

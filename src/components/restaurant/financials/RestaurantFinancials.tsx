
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { EarningsOverview } from '@/components/financial/EarningsOverview';
import { PayoutHistory } from '@/components/financial/PayoutHistory';
import { FinancialReports } from '@/components/financial/FinancialReports';
import { BankAccountManagement } from '@/components/financial/BankAccountManagement';

export const RestaurantFinancials: React.FC = () => {
  const { restaurant } = useRestaurantAuth();

  if (!restaurant) {
    return <div>Loading restaurant information...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-quantum-cyan">Financial Management</h1>
        <p className="text-gray-600">Track earnings, manage payouts, and view financial reports</p>
      </div>

      <Tabs defaultValue="earnings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="banking">Banking</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="space-y-6">
          <EarningsOverview restaurantId={restaurant.id} />
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <PayoutHistory restaurantId={restaurant.id} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <FinancialReports restaurantId={restaurant.id} />
        </TabsContent>

        <TabsContent value="banking" className="space-y-6">
          <BankAccountManagement restaurantId={restaurant.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantFinancials;


import React from 'react';
import { EnhancedAnalyticsDashboard } from './EnhancedAnalyticsDashboard';
import { OrdersOverTimeChart } from './OrdersOverTimeChart';
import { PopularItemsList } from './PopularItemsList';
import { PerformanceMetricsCard } from './PerformanceMetricsCard';
import { SalesChart } from './SalesChart';
import { TopPerformersChart } from './TopPerformersChart';

const RestaurantAnalytics = () => {
  return (
    <div className="space-y-6">
      <EnhancedAnalyticsDashboard />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OrdersOverTimeChart />
        <SalesChart />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PerformanceMetricsCard />
        <PopularItemsList />
        <TopPerformersChart />
      </div>
    </div>
  );
};

export default RestaurantAnalytics;

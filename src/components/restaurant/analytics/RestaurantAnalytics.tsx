
import React, { useState, useEffect } from 'react';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { EnhancedAnalyticsDashboard } from './EnhancedAnalyticsDashboard';
import { OrdersOverTimeChart } from './OrdersOverTimeChart';
import { PopularItemsList } from './PopularItemsList';
import { PerformanceMetricsCard } from './PerformanceMetricsCard';
import { SalesChart } from './SalesChart';
import { TopPerformersChart } from './TopPerformersChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RestaurantAnalytics = () => {
  const { restaurant } = useRestaurantAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [performanceData, setPerformanceData] = useState({
    isLoading: true,
    topPerformers: [] as Array<{name: string, value: number}>
  });

  // Mock data for demonstration purposes
  const [mockedData] = useState({
    title: "Revenue",
    value: "$5,231.89",
    change: 12.5
  });

  useEffect(() => {
    // In a real implementation, this would fetch data based on timeRange
    // For now, we'll just mock setting loading to false after a delay
    const timer = setTimeout(() => {
      setPerformanceData({
        isLoading: false,
        topPerformers: [
          { name: "Burger Deluxe", value: 124 },
          { name: "Chicken Salad", value: 98 },
          { name: "Veggie Pizza", value: 82 },
          { name: "Fish Tacos", value: 65 },
          { name: "Steak Sandwich", value: 43 }
        ]
      });
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [timeRange]);

  // Safety check - if restaurant isn't loaded yet, don't render charts
  if (!restaurant || !restaurant.id) {
    return <div>Loading restaurant data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
        <Tabs defaultValue="week" onValueChange={(value) => setTimeRange(value as 'week' | 'month' | 'year')}>
          <TabsList>
            <TabsTrigger value="week">Last 7 Days</TabsTrigger>
            <TabsTrigger value="month">Last 30 Days</TabsTrigger>
            <TabsTrigger value="year">Last Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <EnhancedAnalyticsDashboard />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OrdersOverTimeChart 
          restaurantId={restaurant.id} 
          timeRange={timeRange} 
        />
        <SalesChart 
          restaurantId={restaurant.id} 
          timeRange={timeRange} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PerformanceMetricsCard 
          title={mockedData.title} 
          value={mockedData.value} 
          change={mockedData.change} 
        />
        <PopularItemsList 
          restaurantId={restaurant.id} 
          timeRange={timeRange} 
        />
        <TopPerformersChart 
          restaurantId={restaurant.id}
          timeRange={timeRange}
          data={performanceData.topPerformers}
          isLoading={performanceData.isLoading}
          title="Top Menu Items"
          description="Most ordered items in the selected period"
        />
      </div>
    </div>
  );
};

export default RestaurantAnalytics;

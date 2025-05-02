
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { useToast } from '@/hooks/use-toast';
import { SalesChart } from './SalesChart';
import { OrdersOverTimeChart } from './OrdersOverTimeChart';
import { PopularItemsList } from './PopularItemsList';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { OrderStatus } from '@/types/restaurant';

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
}

export const RestaurantAnalytics = () => {
  const { restaurant } = useRestaurantAuth();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalCustomers: 0
  });
  
  useEffect(() => {
    if (restaurant) {
      fetchAnalyticsData();
    }
  }, [restaurant, timeRange]);
  
  const fetchAnalyticsData = async () => {
    if (!restaurant) return;
    
    setLoading(true);
    
    try {
      // Calculate date range
      const today = new Date();
      let startDate;
      
      switch(timeRange) {
        case 'week':
          startDate = subDays(today, 7);
          break;
        case 'month':
          startDate = subDays(today, 30);
          break;
        case 'year':
          startDate = subDays(today, 365);
          break;
        default:
          startDate = subDays(today, 7);
      }
      
      // Format dates for Supabase query
      const startDateStr = startOfDay(startDate).toISOString();
      const endDateStr = endOfDay(today).toISOString();
      
      // Fetch orders for this restaurant in the date range
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr)
        .not('status', 'eq', OrderStatus.CANCELLED);
        
      if (error) throw error;
      
      if (!orders || orders.length === 0) {
        setAnalyticsData({
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          totalCustomers: 0
        });
        setLoading(false);
        return;
      }
      
      // Calculate metrics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Count unique customers
      const uniqueCustomers = new Set(orders.map(order => order.user_id));
      const totalCustomers = uniqueCustomers.size;
      
      setAnalyticsData({
        totalOrders,
        totalRevenue,
        averageOrderValue,
        totalCustomers
      });
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: 'Error loading analytics',
        description: 'Could not fetch restaurant analytics. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!restaurant) {
    return <div>Loading restaurant information...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-quantum-cyan">Restaurant Analytics</h1>
        <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as 'week' | 'month' | 'year')}>
          <TabsList>
            <TabsTrigger value="week">Last 7 days</TabsTrigger>
            <TabsTrigger value="month">Last 30 days</TabsTrigger>
            <TabsTrigger value="year">Last year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : analyticsData.totalOrders}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${loading ? '...' : analyticsData.totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Average Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${loading ? '...' : analyticsData.averageOrderValue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Unique Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : analyticsData.totalCustomers}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 col-span-1">
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
            <CardDescription>Revenue trends for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart restaurantId={restaurant.id} timeRange={timeRange} />
          </CardContent>
        </Card>
        
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 col-span-1">
          <CardHeader>
            <CardTitle>Orders Volume</CardTitle>
            <CardDescription>Number of orders over time</CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersOverTimeChart restaurantId={restaurant.id} timeRange={timeRange} />
          </CardContent>
        </Card>
      </div>
      
      {/* Popular Items Section */}
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle>Popular Items</CardTitle>
          <CardDescription>Your best-selling menu items</CardDescription>
        </CardHeader>
        <CardContent>
          <PopularItemsList restaurantId={restaurant.id} timeRange={timeRange} />
        </CardContent>
      </Card>
    </div>
  );
};

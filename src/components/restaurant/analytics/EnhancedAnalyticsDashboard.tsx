
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, Activity } from 'lucide-react';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { PerformanceMetricsCard } from './PerformanceMetricsCard';
import { SalesChart } from './SalesChart';
import { OrdersOverTimeChart } from './OrdersOverTimeChart';
import { PopularItemsList } from './PopularItemsList';
import { TopPerformersChart } from './TopPerformersChart';
import { useRestaurantAnalytics } from '@/hooks/useRestaurantAnalytics';

export const EnhancedAnalyticsDashboard = () => {
  const { restaurant } = useRestaurantAuth();
  const [timeRange, setTimeRange] = React.useState<'week' | 'month' | 'year'>('week');
  
  const { 
    data: analyticsData, 
    loading, 
    refreshData 
  } = useRestaurantAnalytics(restaurant?.id, timeRange);

  if (!restaurant) {
    return <div>Loading restaurant information...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-quantum-cyan">Restaurant Analytics</h1>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as 'week' | 'month' | 'year')}>
            <TabsList>
              <TabsTrigger value="week">Last 7 days</TabsTrigger>
              <TabsTrigger value="month">Last 30 days</TabsTrigger>
              <TabsTrigger value="year">Last year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PerformanceMetricsCard 
          title="Total Orders" 
          value={analyticsData.totalOrders}
          change={analyticsData.orderGrowth}
          isLoading={loading} 
        />
        
        <PerformanceMetricsCard 
          title="Revenue" 
          value={`$${analyticsData.totalRevenue.toFixed(2)}`}
          change={analyticsData.revenueGrowth}
          isLoading={loading} 
        />
        
        <PerformanceMetricsCard 
          title="Average Order" 
          value={`$${analyticsData.averageOrderValue.toFixed(2)}`}
          isLoading={loading} 
        />
        
        <PerformanceMetricsCard 
          title="Customer Retention" 
          value={`${analyticsData.repeatCustomers}/${analyticsData.totalCustomers}`}
          isLoading={loading} 
        />
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Revenue trends for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart restaurantId={restaurant.id} timeRange={timeRange} />
          </CardContent>
        </Card>
        
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader>
            <CardTitle>Orders Volume</CardTitle>
            <CardDescription>Number of orders over time</CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersOverTimeChart restaurantId={restaurant.id} timeRange={timeRange} />
          </CardContent>
        </Card>
      </div>
      
      {/* Additional Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopPerformersChart 
          restaurantId={restaurant.id}
          timeRange={timeRange}
          data={analyticsData.topSellingItems}
          isLoading={loading}
          title="Top Selling Items"
          description="Most ordered items in your menu"
        />
        
        <TopPerformersChart 
          restaurantId={restaurant.id}
          timeRange={timeRange}
          data={analyticsData.busiestHours}
          isLoading={loading}
          title="Busiest Hours"
          description="Times with the most order activity"
        />
      </div>
      
      {/* Popular Items List */}
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Popular Items</CardTitle>
            <CardDescription>Your best-selling menu items</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-quantum-cyan" />
            <span className="text-sm text-quantum-cyan">Performance</span>
          </div>
        </CardHeader>
        <CardContent>
          <PopularItemsList restaurantId={restaurant.id} timeRange={timeRange} />
        </CardContent>
      </Card>
      
      {/* Customer Insights */}
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Customer Insights</CardTitle>
            <CardDescription>Customer retention and behavior</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-quantum-cyan" />
            <span className="text-sm text-quantum-cyan">Customers</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Customer Retention</h3>
              <p className="text-gray-400">
                {loading ? 'Loading...' : `${analyticsData.repeatCustomers} out of ${analyticsData.totalCustomers} customers ordered more than once`}
              </p>
              <p className="text-gray-400 mt-2">
                {loading ? '' : `Retention rate: ${analyticsData.totalCustomers > 0 
                  ? ((analyticsData.repeatCustomers / analyticsData.totalCustomers) * 100).toFixed(1) 
                  : 0}%`}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Customer Growth</h3>
              <p className="text-gray-400">
                {loading ? 'Loading...' : `You served ${analyticsData.totalCustomers} unique customers in this period`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

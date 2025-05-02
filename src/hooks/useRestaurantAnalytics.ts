
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';
import { OrderStatus } from '@/types/restaurant';

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
  repeatCustomers: number;
  orderGrowth: number;
  revenueGrowth: number;
  topSellingItems: Array<{
    name: string;
    value: number;
  }>;
  busiestHours: Array<{
    name: string;
    value: number;
  }>;
}

export const useRestaurantAnalytics = (
  restaurantId: string | undefined, 
  timeRange: 'week' | 'month' | 'year'
) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
    repeatCustomers: 0,
    orderGrowth: 0,
    revenueGrowth: 0,
    topSellingItems: [],
    busiestHours: []
  });

  useEffect(() => {
    if (!restaurantId) return;
    fetchAnalyticsData();
  }, [restaurantId, timeRange]);

  const fetchAnalyticsData = async () => {
    if (!restaurantId) return;
    setLoading(true);

    try {
      // Calculate date ranges for current period and previous period
      const today = new Date();
      let startDate, prevStartDate, prevEndDate;
      
      switch(timeRange) {
        case 'week':
          startDate = subDays(today, 7);
          prevStartDate = subDays(startDate, 7);
          prevEndDate = subDays(startDate, 1);
          break;
        case 'month':
          startDate = subDays(today, 30);
          prevStartDate = subDays(startDate, 30);
          prevEndDate = subDays(startDate, 1);
          break;
        case 'year':
          startDate = subDays(today, 365);
          prevStartDate = subDays(startDate, 365);
          prevEndDate = subDays(startDate, 1);
          break;
        default:
          startDate = subDays(today, 7);
          prevStartDate = subDays(startDate, 7);
          prevEndDate = subDays(startDate, 1);
      }

      const currentStartStr = startOfDay(startDate).toISOString();
      const currentEndStr = endOfDay(today).toISOString();
      const prevStartStr = startOfDay(prevStartDate).toISOString();
      const prevEndStr = endOfDay(prevEndDate).toISOString();

      // Fetch current period orders
      const { data: currentOrders, error: currentError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', currentStartStr)
        .lte('created_at', currentEndStr)
        .not('status', 'eq', OrderStatus.CANCELLED);

      if (currentError) throw currentError;

      // Fetch previous period orders for comparison
      const { data: prevOrders, error: prevError } = await supabase
        .from('orders')
        .select('total')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', prevStartStr)
        .lte('created_at', prevEndStr)
        .not('status', 'eq', OrderStatus.CANCELLED);

      if (prevError) throw prevError;

      // Calculate basic metrics
      const totalOrders = currentOrders?.length || 0;
      const totalRevenue = currentOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate unique customers
      const uniqueCustomerIds = new Set(currentOrders?.map(order => order.user_id) || []);
      const totalCustomers = uniqueCustomerIds.size;

      // Calculate repeat customers (customers who ordered more than once)
      const customerOrderCounts: Record<string, number> = {};
      currentOrders?.forEach(order => {
        if (order.user_id) {
          customerOrderCounts[order.user_id] = (customerOrderCounts[order.user_id] || 0) + 1;
        }
      });
      const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;

      // Calculate growth percentages
      const prevTotalOrders = prevOrders?.length || 0;
      const prevTotalRevenue = prevOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      
      const orderGrowth = prevTotalOrders > 0 
        ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 
        : 0;
        
      const revenueGrowth = prevTotalRevenue > 0 
        ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 
        : 0;

      // Calculate top selling items
      const itemsMap: Record<string, number> = {};
      currentOrders?.forEach(order => {
        order.order_items?.forEach(item => {
          if (!itemsMap[item.name]) {
            itemsMap[item.name] = 0;
          }
          itemsMap[item.name] += item.quantity || 0;
        });
      });

      const topSellingItems = Object.entries(itemsMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Calculate busiest hours of the day
      const hourCounts: Record<string, number> = {};
      currentOrders?.forEach(order => {
        const orderDate = new Date(order.created_at);
        const hour = orderDate.getHours();
        const hourFormatted = format(orderDate, 'ha');
        
        if (!hourCounts[hourFormatted]) {
          hourCounts[hourFormatted] = 0;
        }
        hourCounts[hourFormatted]++;
      });

      const busiestHours = Object.entries(hourCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

      setData({
        totalOrders,
        totalRevenue,
        averageOrderValue,
        totalCustomers,
        repeatCustomers,
        orderGrowth,
        revenueGrowth,
        topSellingItems,
        busiestHours
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    data,
    refreshData: fetchAnalyticsData
  };
};

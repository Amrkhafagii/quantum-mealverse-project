
import { useRestaurantData } from './useRestaurantData';

interface AnalyticsData {
  id: string;
  date: string;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  created_at: string;
  updated_at: string;
}

export const useRestaurantAnalytics = (restaurantId: string, dateRange?: { from: Date; to: Date }) => {
  const filters: Record<string, any> = {};
  
  if (dateRange) {
    // Note: You might need to adjust this based on your actual filtering needs
    filters.date = dateRange.from.toISOString().split('T')[0];
  }

  return useRestaurantData<AnalyticsData>({
    queryKey: 'restaurant-analytics',
    tableName: 'restaurant_analytics',
    restaurantId,
    selectFields: '*',
    filters,
    orderBy: { column: 'date', ascending: false },
    limit: 30, // Last 30 days
  });
};
